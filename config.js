/**
 * EventSnap - Configurație Botez
 */
const DEFAULT_CONFIG = {
  // Titlul evenimentului afișat în pagină
  eventTitle: "Botezul Nostru",
  eventSubtitle: "Împarte cu noi momentele speciale surprinse de tine astăzi!",
  
  // Link-ul direct către folderul public Google Drive
  driveFolderUrl: "https://drive.google.com/drive/folders/1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR?usp=drive_link",
  
  // ID-ul folderului din link
  driveFolderId: "1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR",
  
  // URL-ul Web App generat din Google Apps Script (se poate schimba oricând și din interfața aplicației)
  scriptWebAppUrl: "",
  
  // Rezoluția maximă pentru redimensionare automată poze (reduce timpul de upload pe telefon)
  maxImageDimension: 2048,
  
  // Calitatea compresiei JPEG (0.82 oferă o claritate impecabilă dar reduce 20MB la ~1MB)
  imageQuality: 0.84
};

// Încărcare din localStorage dacă a fost configurat de utilizator
window.APP_CONFIG = {
  ...DEFAULT_CONFIG,
  ...(JSON.parse(localStorage.getItem('eventsnap_config') || '{}'))
};

window.saveAppConfig = function(newConfig) {
  window.APP_CONFIG = { ...window.APP_CONFIG, ...newConfig };
  localStorage.setItem('eventsnap_config', JSON.stringify(window.APP_CONFIG));
};
