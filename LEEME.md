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
