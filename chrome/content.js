// Content Script - S'exécute dans le contexte de la page web
console.log('Content script chargé sur:', window.location.href);

// État de l'extension
let extensionEnabled = true;

// Vérifier l'état de l'extension au chargement
chrome.storage.sync.get(['extensionEnabled'], (result) => {
  extensionEnabled = result.extensionEnabled ?? true;
  if (extensionEnabled) {
    initializeExtension();
  }
});

// Initialiser les fonctionnalités de l'extension
function initializeExtension() {
  console.log('Initialisation de l\'extension sur cette page');
  
  // Exemple: ajouter une classe CSS au body
  document.body.classList.add('mon-extension-active');
  
  // Exemple: observer les changements dans le DOM
  observePageChanges();
  
  // Exemple: ajouter des event listeners
  addEventListeners();
}

// Observer les changements dans le DOM
function observePageChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Nouveaux éléments ajoutés
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processNewElement(node);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Traiter les nouveaux éléments
function processNewElement(element) {
  // Exemple: marquer certains liens
  if (element.tagName === 'A') {
    element.classList.add('processed-by-extension');
  }
  
  // Ou traiter les éléments enfants
  const links = element.querySelectorAll('a');
  links.forEach(link => {
    link.classList.add('processed-by-extension');
  });
}

// Ajouter des event listeners
function addEventListeners() {
  // Exemple: intercepter les clics sur certains éléments
  document.addEventListener('click', (event) => {
    if (event.target.matches('.special-button')) {
      handleSpecialButtonClick(event);
    }
  });
  
  // Exemple: écouter les changements d'URL (pour les SPAs)
  let currentUrl = window.location.href;
  new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      onUrlChange();
    }
  }).observe(document, { subtree: true, childList: true });
}

// Gérer le clic sur un bouton spécial
function handleSpecialButtonClick(event) {
  event.preventDefault();
  console.log('Bouton spécial cliqué');
  
  // Envoyer un message au background script
  chrome.runtime.sendMessage({
    type: 'SPECIAL_BUTTON_CLICKED',
    url: window.location.href,
    timestamp: Date.now()
  });
}

// Gérer le changement d'URL
function onUrlChange() {
  console.log('URL changée vers:', window.location.href);
  // Réinitialiser ou adapter les fonctionnalités
}

// Écouter les messages du background script ou popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message reçu dans content script:', message);
  
  switch (message.type) {
    case 'TOGGLE_FEATURE':
      toggleFeature(message.enabled);
      sendResponse({ success: true });
      break;
      
    case 'GET_PAGE_INFO':
      sendResponse({
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname
      });
      break;
      
    case 'HIGHLIGHT_TEXT':
      highlightText(message.text);
      sendResponse({ success: true });
      break;
      
    default:
      console.log('Type de message non reconnu:', message.type);
  }
});

// Activer/désactiver une fonctionnalité
function toggleFeature(enabled) {
  if (enabled) {
    document.body.classList.add('feature-enabled');
  } else {
    document.body.classList.remove('feature-enabled');
  }
}

// Surligner du texte sur la page
function highlightText(searchText) {
  // Implémenter la logique de surlignage
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.includes(searchText)) {
      const parent = node.parentNode;
      const wrapper = document.createElement('span');
      wrapper.className = 'extension-highlight';
      wrapper.style.backgroundColor = '#ffff00';
      
      const text = node.textContent;
      const parts = text.split(searchText);
      
      parent.removeChild(node);
      
      parts.forEach((part, index) => {
        if (index > 0) {
          const highlight = document.createElement('span');
          highlight.className = 'extension-highlight';
          highlight.style.backgroundColor = '#ffff00';
          highlight.textContent = searchText;
          parent.appendChild(highlight);
        }
        if (part) {
          parent.appendChild(document.createTextNode(part));
        }
      });
    }
  }
}

// Nettoyer lors du déchargement
window.addEventListener('beforeunload', () => {
  console.log('Content script se décharge');
  // Nettoyer les event listeners si nécessaire
});