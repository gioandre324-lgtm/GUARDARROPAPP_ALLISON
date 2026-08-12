/* Armario - service worker.
   Sube el numero de VERSION cada vez que cambies index.html, o los
   celulares que ya instalaron la app seguiran viendo la version vieja. */
const VERSION = "armario-v1";
const NUCLEO = ["./", "./index.html", "./manifest.webmanifest",
                "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  /* El armario inicial y los gustos nunca se cachean: son los archivos que
     cambian por persona y servir los de otro cliente sería un desastre. */
  if (req.url.includes("armario_inicial.json") || req.url.includes("gustos_inicial.json")) {
    e.respondWith(fetch(req).catch(() => new Response("{}", {headers:{"Content-Type":"application/json"}})));
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
