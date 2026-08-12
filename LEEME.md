# Armario — app de outfits, una carpeta por persona

Esta carpeta es la app de **Allison**. Sirve igual como plantilla para cualquier
otra clienta: se cambian dos archivos y listo.

## Los archivos

| Archivo | Para qué |
|---|---|
| `index.html` | El motor. **No lleva la ropa ni los datos de nadie adentro.** Es idéntico para todos los clientes |
| `armario_inicial.json` | Las prendas de esta persona, con sus fotos y su descripción física |
| `gustos_inicial.json` | Sus referencias de estilo. Vacío = el motor usa solo reglas generales de color y formalidad |
| `manifest.webmanifest` | Lo que convierte la web en app instalable |
| `sw.js` | Hace que funcione sin internet |
| `icon-192.png` / `icon-512.png` | El ícono en la pantalla del celular |

Los siete van juntos en la misma carpeta. La subcarpeta `_archivo/` guarda
versiones anteriores y la app la ignora; puedes no subirla.

## Armar la app de otra persona

1. Copia los **cinco archivos que no cambian** (`index.html`, `sw.js`,
   `manifest.webmanifest`, los dos íconos) a un repositorio nuevo.
2. Reemplaza `armario_inicial.json` por el suyo y `gustos_inicial.json` por el
   suyo (o déjalo vacío: `{"pines":[],"referencias":[],"modos":{}}`).
3. Publica y pásale el link.

No hay que tocar código. Tampoco hay que pedirle que borre datos del navegador.

### El campo `version` es obligatorio

```json
{
  "version": "allison-2026-08-11",
  "perfil": "mujer de 29 años, 1.53 m de estatura, complexión media, talla M",
  "sexo": "mujer",
  "prendas": [ ... ]
}
```

La app compara esa `version` con la que ya tiene guardada en el celular. Si
cambió, reemplaza el armario entero sola. **Cada vez que le cambies las prendas
a alguien, cambia también la `version`**, o el celular seguirá mostrando las
anteriores.

`sexo` acepta `mujer` u `hombre` y define qué prendas propone el modo ideas.
`perfil` es la descripción física que viaja en el prompt de imagen.

### Formato de cada prenda

```json
{ "id":"unico", "n":"Blazer crop crema", "t":"saco", "cat":"out",
  "c":["crema"], "f":5, "te":["todo"], "w":2, "src":"data:image/jpeg;base64,..." }
```

- `cat` y `t` tienen que combinar: `base` (pantalon, jeans) · `top` (camisa,
  camiseta, polo) · `mid` (sueter, camisa) · `out` (abrigo, chaqueta, saco) ·
  `shoe` (zapatos, zapatillas).
- `c` son de la paleta fija de la app (negro, gris, blanco, crema, beige, camel,
  marrón, chocolate, azul marino, azul, olivo, vino, rosa…). Máximo 3.
- `f` formalidad 1-5 · `w` abrigo 1-3 · `te` temporadas (`todo`, `verano`,
  `otono`, `invierno`, `primavera`).
- `src` es la foto embebida en base64. **Si no hay `armario_inicial.json`, la
  app abre con el guardarropa vacío** y la persona sube sus fotos desde el
  celular con *Agregar prenda*.

## Lo nuevo de esta versión

**Clima y outfit del día.** Un botón trae la temperatura real y propone ropa
acorde. Usa Open-Meteo: gratis, sin cuenta ni clave. No pide la ubicación hasta
que la persona toca *Activar clima*; si la rechaza, se escribe la ciudad a mano.
La última medición queda guardada 12 horas, así que sin internet sigue
funcionando. Los umbrales están pensados para clima costero templado (≤16°
invierno, ≤21° otoño, ≤26° primavera, más verano) y se cambian en una sola línea,
en la función `temporadaDe`.

**Pestaña "Mi uso".** El botón *Me lo puse* de cada outfit registra lo que de
verdad se usó. De ahí salen: qué porcentaje del armario está estrenado, las
prendas olvidadas (sin usar o con más de tres semanas guardadas), un calendario
de las últimas cinco semanas y el ranking de lo más repetido. En el guardarropa
cada prenda muestra cuántas veces se usó. Es lo que convierte la app en algo que
se abre a diario.

**Pestaña "Viaje": la maleta.** Se pone el destino, los días, qué se va a hacer
allá y en qué se lleva la ropa. La app no arma outfits sueltos: busca la *menor
cantidad de prendas* que vista todos los días sin repetir conjunto. Es un
problema de cobertura resuelto con una estrategia glotona — día por día elige el
mejor outfit que ya esté casi entero dentro de la maleta.

El resultado se parece a un armario cápsula porque el motor sabe qué pesa: un
calzado o un abrigo cuestan mucho más que una camiseta, así que prefiere repetir
zapatos y pantalones y variar lo de arriba. Medido con el armario de Allison:

| Viaje | Prendas | Outfits distintos |
|---|---|---|
| 5 días paseando | 8 | 5 |
| 7 días, paseo y cenas | 10 | 7 |
| 4 días de trabajo, mochila | 6 | 4 |
| 10 días con todo | 13 | 10 |

Si pones el destino, trae el pronóstico real de esos días y arma la maleta con
ropa de esa temperatura. Hay un botón para copiar la lista y mandarla por
WhatsApp. El peso relativo entre "se ve bien" y "ocupa espacio" es el número 7
dentro de `armarMaleta`: subirlo da maletas más chicas y outfits más repetidos.

**Embellecedor de fotos.** Al agregar una prenda desde el celular, la app
intenta recortar el fondo, dejar la prenda sobre blanco y encuadrarla en un
cuadrado. Es canvas puro: sin modelo de IA, sin servidor y sin costo por foto.

Es importante saber hasta dónde llega. Medido sobre fotos reales de armario:
funciona cuando la prenda contrasta con un fondo parejo, y **se abstiene**
cuando el fondo tiene colores parecidos a la prenda (un piso de madera con un
pantalón marrón, un ropero oscuro con un sweater negro). En ese caso no recorta:
solo centra la foto en un lienzo blanco cuadrado, sin perder nada de la imagen,
y avisa cómo tomar mejor la foto. Esa decisión es deliberada: es preferible una
foto sin recortar que una prenda cortada por la mitad.

La prueba que lo decide es el centro de la imagen. En una foto de ropa la prenda
siempre ocupa el medio; si el centro quedó marcado como fondo, el recorte se
comió la prenda y se descarta.

Para subir el porcentaje de aciertos, la recomendación al cliente es simple:
prenda sobre una pared lisa o una cama de color plano, con buena luz.

**Las fotos que entregas tú son mejores.** Al preparar `armario_inicial.json` en
tu computadora puedes usar un algoritmo más pesado (GrabCut de OpenCV más
borrado de ganchos de colores) que no cabe dentro de una app sin servidor. Sobre
las 53 prendas de Allison, ese recortó las 53 sin fallos. Ese es el argumento de
venta del servicio: el armario que entregas se ve mejor que el que armaría la
persona sola.

## Qué se arregló (y por qué salía la ropa equivocada)

**La causa real: el navegador guarda por dominio, no por carpeta.** IndexedDB y
localStorage se comparten entre todo lo que cuelga de `usuario.github.io`. Dos
apps publicadas en la misma cuenta —`/armario/` y `/GUARDARROPAPP_ALLISON/`—
usaban literalmente la misma base de datos llamada `armario_db`. La segunda
abría y encontraba la ropa de la primera, y por eso cambiar el JSON no servía de
nada. Ahora el nombre de la base y de cada clave llevan un identificador sacado
de la carpeta, así que cada app queda aislada sola. El service worker tenía el
mismo problema: al activarse borraba el caché de las otras apps.

**Recarga automática.** Antes el armario inicial solo se leía si el
almacenamiento estaba vacío; una vez cargado, no había forma de actualizarlo sin
borrar los datos del navegador a mano. Ahora se lee siempre y se compara la
`version`.

**Datos personales fuera del código.** El `index.html` traía escrita la
descripción física del dueño anterior, su nombre en el título y la cabecera,
sus dos modos de estilo y ejemplos con sus prendas. Todo eso salía en la app de
cualquier cliente. Ahora sale de los JSON o no sale.

**Contadores fijos fuera.** Se quitaron las cifras que no se actualizaban solas
(número de prendas, de referencias, porcentajes de medición). Lo que queda en el
panel de reglas se recalcula con lo que haya cargado en ese momento.

**index.html va primero a la red.** Antes salía del caché y un celular con la
app ya instalada seguía viendo la versión vieja después de publicar un cambio.
Sin internet sigue funcionando desde el caché.

## Al publicar

Súbelo a una dirección web. Si abres `index.html` con doble clic desde el
escritorio, el navegador bloquea el almacén grande y la app te lo avisa: en ese
modo solo aguanta unas pocas fotos.

Si cambias `index.html`, sube el número de `VERSION` dentro de `sw.js`.
