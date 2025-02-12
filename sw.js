self.addEventListener("install", (event) => {
    console.log("Service Worker instalado");
    event.waitUntil(self.skipWaiting());
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Service Worker activado");
  });
  
  self.addEventListener("fetch", (event) => {
    console.log("Interceptando solicitud a:", event.request.url);
  });