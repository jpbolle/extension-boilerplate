// popup.js - Logique pour l'interface du popup

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup chargé');
  
  // Références aux éléments
  const toggleSwitch = document.getElementById('toggle-switch');
  const status = document.getElementById('status');
  const searchInput = document.getElementById('search-text');
  const highlightBtn = document.getElementById('highlight-btn');
  const clearBtn = document.getElementById('clear-highlights-btn');
  const pageInfoBtn = document.getElementById('get-page-info-btn');
  const loading = document.getElementById('loading');
  const optionsLink = document.getElementById('options-link');
  const helpLink = document.getElementById('help-link');
  
  // État initial
  let extensionEnabled = true;
  let currentTab = null;
  
  // Initialisation
  await loadInitialState();
  setupEventListeners();
  
  // Charger l'état initial de l'extension
  async function loadInitialState() {
    try {
      // Récupérer l'onglet actif
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tabs[0];
      
      // Récupérer l'état de l'extension
      const result = await chrome.storage.sync.get(['extensionEnabled']);
      extensionEnabled = result.extensionEnabled ?? true;
      
      updateUI();
    } catch (error) {
      console.error('Erreur lors du chargement de l\'état initial:', error);
    }
  }
  
  // Configurer les event listeners
  function setupEventListeners() {
    // Toggle de l'extension
    toggleSwitch.addEventListener('click', toggleExtension);
    
    // Boutons
    highlightBtn.addEventListener('click', highlightText);
    clearBtn.addEventListener('click', clearHighlights);
    pageInfoBtn.addEventListener('click', getPageInfo);
    
    // Entrée au clavier
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        highlightText();
      }
    });
    
    // Liens
    optionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
    
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ 
        url: 'https://github.com/votre-username/votre-extension' 
      });
    });
  }
  
  // Activer/désactiver l'extension
  async function toggleExtension() {
    try {
      showLoading(true);
      
      // Inverser l'état
      extensionEnabled = !extensionEnabled;
      
      // Sauvegarder dans le storage
      await chrome.storage.sync.set({ extensionEnabled });
      
      // Envoyer un message au background script
      const response = await chrome.runtime.sendMessage({
        type: 'TOGGLE_EXTENSION'
      });
      
      if (response && typeof response.enabled === 'boolean') {
        extensionEnabled = response.enabled;
      }
      
      // Notifier le content script
      if (currentTab) {
        try {
          await chrome.tabs.sendMessage(currentTab.id, {
            type: 'TOGGLE_FEATURE',
            enabled: extensionEnabled
          });
        } catch (error) {
          console.log('Content script pas disponible sur cet onglet');
        }
      }
      
      updateUI();
    } catch (error) {
      console.error('Erreur lors du toggle:', error);
      // Restaurer l'état précédent en cas d'erreur
      extensionEnabled = !extensionEnabled;
      updateUI();
    } finally {
      showLoading(false);
    }
  }
  
  // Surligner du texte
  async function highlightText() {
    const text = searchInput.value.trim();
    if (!text) {
      alert('Veuillez entrer du texte à surligner');
      return;
    }
    
    if (!currentTab) {
      alert('Impossible d\'accéder à l\'onglet actuel');
      return;
    }
    
    try {
      showLoading(true);
      
      const response = await chrome.tabs.sendMessage(currentTab.id, {
        type: 'HIGHLIGHT_TEXT',
        text: text
      });
      
      if (response && response.success) {
        console.log('Texte surligné avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du surlignage:', error);
      alert('Impossible de surligner sur cette page');
    } finally {
      showLoading(false);
    }
  }
  
  // Effacer les surlignages
  async function clearHighlights() {
    if (!currentTab) return;
    
    try {
      showLoading(true);
      
      await chrome.tabs.sendMessage(currentTab.id, {
        type: 'CLEAR_HIGHLIGHTS'
      });
    } catch (error) {
      console.error('Erreur lors de l\'effacement:', error);
    } finally {
      showLoading(false);
    }
  }
  
  // Obtenir les informations de la page
  async function getPageInfo() {
    if (!currentTab) return;
    
    try {
      showLoading(true);
      
      const response = await chrome.tabs.sendMessage(currentTab.id, {
        type: 'GET_PAGE_INFO'
      });
      
      if (response) {
        const info = `Titre: ${response.title}\nURL: ${response.url}\nDomaine: ${response.domain}`;
        alert(info);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos:', error);
      alert('Impossible d\'obtenir les informations de cette page');
    } finally {
      showLoading(false);
    }
  }
  
  // Mettre à jour l'interface
  function updateUI() {
    // Toggle switch
    if (extensionEnabled) {
      toggleSwitch.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
    }
    
    // Status
    if (extensionEnabled) {
      status.className = 'status enabled';
      status.textContent = 'Extension activée';
    } else {
      status.className = 'status disabled';
      status.textContent = 'Extension désactivée';
    }
    
    // Boutons
    const isValidPage = currentTab && !currentTab.url.startsWith('chrome://');
    highlightBtn.disabled = !extensionEnabled || !isValidPage;
    clearBtn.disabled = !extensionEnabled || !isValidPage;
    pageInfoBtn.disabled = !isValidPage;
    
    if (!isValidPage) {
      status.textContent = 'Non disponible sur cette page';
      status.className = 'status disabled';
    }
  }
  
  // Afficher/masquer le loading
  function showLoading(show) {
    if (show) {
      loading.style.display = 'block';
    } else {
      loading.style.display = 'none';
    }
  }
  
  // Sauvegarder les préférences utilisateur
  async function saveUserPreferences() {
    const preferences = {
      defaultSearchText: searchInput.value,
      lastUsed: Date.now()
    };
    
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_DATA',
        data: preferences
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }
  
  // Charger les préférences utilisateur
  async function loadUserPreferences() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_DATA'
      });
      
      if (response && response.data) {
        if (response.data.defaultSearchText) {
          searchInput.value = response.data.defaultSearchText;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  }
  
  // Sauvegarder quand le popup se ferme
  window.addEventListener('beforeunload', saveUserPreferences);
  
  // Charger les préférences
  await loadUserPreferences();
});