/* Armario - service worker.

   El nombre del cache lleva la RUTA de la app. Sin eso, dos apps publicadas en
   la misma cuenta de GitHub Pages compartian nombre de cache y, peor, al
   activarse una borraba el cache de la otra (caches.keys() es por origen, no
   por carpeta). Ahora cada instalacion tiene el suyo y no se pisan.

   Sube el numero de VERSION cada vez que cambies index.html. */
const RUTA = new URL(self.registration.scope).pathname;
const PREFIJO = "armario" + RUTA;
const VERSION = PREFIJO + "v4";
const NUCLEO = ["./", "./index.html", "./manifest.webmanifest",
                "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    /* Solo se borran los caches viejos DE ESTA app, no los de las demas. */
    .then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIJO) && k !== VERSION)
                              .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  /* El armario inicial y los gustos nunca se cachean: son los archivos que
     cambian por persona y servir los de otro cliente seria un desastre. */
  if (req.url.includes("armario_inicial.json") || req.url.includes("gustos_inicial.json")) {
    e.respondWith(fetch(req).catch(() => new Response("{}", {headers:{"Content-Type":"application/json"}})));
    return;
  }

  /* index.html va primero a la red. Antes salia del cache y un celular que ya
     tenia la app instalada seguia viendo la version vieja despues de publicar
     un cambio. Si no hay internet, cae al cache y sigue funcionando offline. */
  const esDoc = req.mode === "navigate" || req.url.endsWith("/") || req.url.includes("index.html");
  if (esDoc) {
    e.respondWith(
      fetch(req).then(res => {
        const copia = res.clone();
        caches.open(VERSION).then(c => c.put(req, copia));
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200 && res.type === "basic") {
        const copia = res.clone();
        caches.open(VERSION).then(c => c.put(req, copia));
      }
      return res;
    }).catch(() => hit))
  );
});
