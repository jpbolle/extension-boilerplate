// Service Worker pour Manifest V3
// Remplace les background scripts persistants de V2

// Installation de l'extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installée:', details.reason);
  
  if (details.reason === 'install') {
    // Première installation
    console.log('Première installation de l\'extension');
    
    // Initialiser le storage si nécessaire
    chrome.storage.sync.set({
      extensionEnabled: true,
      userPreferences: {}
    });
  }
});

// Écouter les messages des content scripts ou popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message reçu:', message);
  
  switch (message.type) {
    case 'GET_DATA':
      // Récupérer des données du storage
      chrome.storage.sync.get(['userPreferences'], (result) => {
        sendResponse({ data: result.userPreferences });
      });
      return true; // Indique une réponse asynchrone
      
    case 'SAVE_DATA':
      // Sauvegarder des données
      chrome.storage.sync.set({ userPreferences: message.data }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'TOGGLE_EXTENSION':
      // Activer/désactiver l'extension
      chrome.storage.sync.get(['extensionEnabled'], (result) => {
        const newState = !result.extensionEnabled;
        chrome.storage.sync.set({ extensionEnabled: newState }, () => {
          sendResponse({ enabled: newState });
        });
      });
      return true;
      
    default:
      console.log('Type de message non reconnu:', message.type);
  }
});

// Écouter les clics sur l'icône de l'extension (si pas de popup)
chrome.action.onClicked.addListener((tab) => {
  console.log('Icône cliquée sur l\'onglet:', tab.id);
  
  // Exemple: injecter un script dans la page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleExtensionFeature
  });
});

// Fonction qui sera injectée dans la page
function toggleExtensionFeature() {
  console.log('Fonction exécutée dans la page');
  // Votre logique ici
}

// Gestion des alarmes (pour des tâches périodiques)
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarme déclenchée:', alarm.name);
  
  switch (alarm.name) {
    case 'periodic-task':
      // Exécuter une tâche périodique
      break;
  }
});

// Créer une alarme (exemple)
chrome.alarms.create('periodic-task', { 
  delayInMinutes: 1,
  periodInMinutes: 60 
});