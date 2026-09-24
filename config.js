/**
 * EventSnap - Configurație Botez Miraia
 */
const DEFAULT_CONFIG = {
  // Titlul evenimentului afișat în pagină și pe cartonașele de masă
  eventTitle: "Botez Miraia",
  eventSubtitle: "Împarte cu noi momentele speciale surprinse de tine astăzi la botezul Miraiei!",
  
  // Link-ul direct către folderul public Google Drive
  driveFolderUrl: "https://drive.google.com/drive/folders/1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR?usp=drive_link",
  
  // ID-ul folderului din Google Drive
  driveFolderId: "1wAaj_D6F1dVWnf1xsFvbJwD7Meg9NikR",
  
  // URL-ul Web App implementat din Google Apps Script
  scriptWebAppUrl: "https://script.google.com/macros/s/AKfycbx1u0U14mlLJVYn3f-xyQZ7vECVDCfqePIiVrP9NnzaGwF6qtLB_4rk3oo8NzC4wOy7/exec",
  
  // Rezoluția maximă pentru redimensionare automată poze (reduce timpul de upload pe telefon la 1-2 secunde)
  maxImageDimension: 2048,
  
  // Calitatea compresiei JPEG (claritate impecabilă, reduce fișierele de 20MB la ~1MB)
  imageQuality: 0.84
};

// Încărcare din localStorage dacă există modificări salvate local
window.APP_CONFIG = {
  ...DEFAULT_CONFIG,
  ...(JSON.parse(localStorage.getItem('eventsnap_config') || '{}'))
};

// Asigurăm că scriptWebAppUrl este actualizat cu cel furnizat
if (!window.APP_CONFIG.scriptWebAppUrl || window.APP_CONFIG.scriptWebAppUrl.trim() === '') {
  window.APP_CONFIG.scriptWebAppUrl = DEFAULT_CONFIG.scriptWebAppUrl;
}

window.saveAppConfig = function(newConfig) {
  window.APP_CONFIG = { ...window.APP_CONFIG, ...newConfig };
  localStorage.setItem('eventsnap_config', JSON.stringify(window.APP_CONFIG));
};
