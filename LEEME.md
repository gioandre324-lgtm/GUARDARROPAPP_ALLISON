# Armario — qué cambió y cómo publicarlo

## Los archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La app. Ya no lleva ninguna prenda adentro: bajó de 2,9 MB a 163 KB |
| `armario_inicial.json` | Tus 122 prendas con sus fotos. Se carga sola la primera vez |
| `manifest.webmanifest` | Lo que convierte la web en app instalable |
| `sw.js` | Hace que funcione sin internet |
| `icon-192.png` / `icon-512.png` | El ícono que queda en la pantalla del celular |

**Los cinco van juntos en la misma carpeta.** Si falta uno, la app deja de ser instalable.

## Publicar

1. Entra a tu repositorio `armario` en GitHub.
2. Sube los seis archivos reemplazando lo que había.
3. Espera un minuto y abre `https://sacb5324.github.io/armario/` en el celular.
4. Menú del navegador → **Agregar a pantalla de inicio**. Queda el ícono.

La primera vez carga tus 122 prendas y las guarda en el celular. De ahí en adelante abre al instante y funciona en avión.

**Importante:** no abras `index.html` con doble clic desde el escritorio. En modo archivo local el navegador bloquea el almacén grande y la app te lo va a avisar. Tiene que estar en una dirección web.

## Armar la versión de un cliente

Este es el flujo que convierte la app en algo vendible:

1. La persona te manda las fotos de su ropa por WhatsApp.
2. Abres la app, tocas **Agregar prenda** y las cargas una por una. El color lo detecta solo; tú corriges lo que falle y ajustas formalidad.
3. En **Mi guardarropa** escribes su descripción física y la guardas.
4. Tocas **Exportar armario**: baja un `.json` con todo.
5. Copias la carpeta a un repositorio nuevo (`armario-maria`), reemplazas `armario_inicial.json` por el que exportaste, y le pasas su link.

Cada cliente tiene su dirección y sus prendas. Nadie ve las de nadie.

Antes de armar la de otra persona, en tu propio celular toca **Exportar armario** y guarda el archivo: es tu respaldo.

## Lo que cambié en el código

**Motor separado de los datos.** Las prendas ya no viven dentro del HTML sino en IndexedDB, el almacén del navegador que sí aguanta fotos. Todo lo que antes se calculaba al cargar el archivo (precálculo de familias, matriz de afinidad, techo de formalidad) ahora se recalcula cada vez que agregas o borras una prenda.

**El armario se edita desde el celular.** Foto, categoría, tipo, colores, formalidad, temporada y cuánto abriga. La foto se achica a 760 px y se guarda en JPEG, y el color dominante se detecta con canvas mirando solo el centro de la imagen, porque los bordes casi siempre son la pared. Sin llamadas a ninguna IA: cero costo por prenda.

**El podado estaba estrangulando el motor.** Con 122 prendas son 6,16 millones de combinaciones y el tope de 260.000 dejaba pasar apenas el 4% de los núcleos. Además cortaba solo por la cabeza del ranking. Ahora el 60% son los mejores núcleos y el 40% una muestra repartida del resto.

**El verdadero cuello era el ordenamiento.** Una consulta de oficina generaba 437.000 objetos y los ordenaba enteros. Ahora se mantiene una lista acotada que se poda sola cuando se llena. Medido con tus prendas: la consulta de oficina bajó de 2.630 ms a 926 ms, y la de cita de noche de 3.044 ms a 1.206 ms. El número de combinaciones válidas que ves en pantalla sigue siendo el real.

**Arreglos menores.** Las miniaturas de Pinterest ya no rompen la tarjeta cuando no hay internet. El motor tolera armarios incompletos en vez de reventar. Tu descripción física se edita desde la app en lugar de estar escrita en el código.

**Lo que no toqué:** la puntuación, las tres tablas de color por banda de formalidad, el sorteo con temperatura, la memoria de 14 días, la regla de los trajes, los cinturones y los modos Tom Holland y Damiano David. Todo eso estaba medido y funcionando.

## La correa

Dejó de estar siempre encendida. Por defecto no aparece ni en las explicaciones ni en el prompt, porque la mayoría de gente no usa. En **Mi guardarropa** hay una casilla: *Uso correa, a tono con el calzado*. Si la marcas, vuelve la regla de siempre con tus tres correas.

## Modo ideas

La app ya no depende de tener fotos. Si el armario está vacío o incompleto, entra sola en modo ideas: propone outfits **descritos** —tipo de prenda y color— usando exactamente las mismas tablas de color y de formalidad que ya tenías. Las prendas se dibujan como una mancha del color en vez de una foto.

Arriba de la caja de búsqueda hay dos botones, **Con mi ropa** e **Ideas sin fotos**, y un selector de ropa de hombre o de mujer. Apenas subas un pantalón, algo de arriba y un calzado, la app vuelve sola a tu armario real.

El modo ideas también sirve teniendo el armario lleno: es una lista de qué te conviene comprar. Y el botón **Prompt IA** funciona igual, así que puedes ver la prenda sugerida puesta sobre tu foto antes de comprarla.

El catálogo son 93 prendas descritas para hombre y 122 para mujer. En mujer hay faldas, blusas, tops y vestidos: los vestidos van por un carril aparte, porque resuelven torso y piernas de una vez y el motor de cinco huecos les habría puesto una camisa encima. Dos de las seis tarjetas se reservan para propuestas con vestido.

Medido: entre 200 y 600 ms por consulta en modo ideas.

## Los pines y los modos ya no son compartidos

Encontraste un problema serio: tus 30 pines de Pinterest, tus 400 referencias de color y tus dos modos de estilo (Tom Holland, Damiano David) estaban **escritos directamente en el código**, así que cualquier instalación de la app —la tuya o la de un cliente— heredaba literalmente tus gustos de moda masculina. Una mujer sí habría visto esas referencias.

Ahora viven en un archivo aparte, `gustos_inicial.json`, con la misma lógica que `armario_inicial.json`: se carga solo al arrancar, y si no está presente la app funciona igual pero sin ese sesgo personal — puntúa por las reglas generales de color y formalidad, sin pines ni modos de nadie.

**Tu propia app** (esta carpeta) sigue trayendo tus 30 pines y tus 2 modos, así que tu experiencia no cambió en nada.

**Para un cliente nuevo**, simplemente no le copies `gustos_inicial.json`, o cópiale uno vacío. Sin ese archivo la app arma outfits solo con las reglas generales — funciona, pero sin el aprendizaje fino de "esta paleta es la que más usas".

## El nuevo flujo: tú armas el JSON, no exportas desde tu app

Tenías razón en desconfiar de exportar tu propio armario para dárselo a otra persona: ahí saldría mezclada tu ropa. El flujo correcto es este:

1. La persona te manda sus fotos por WhatsApp (o las subes tú desde una carpeta) y te describe su físico.
2. Yo te devuelvo un `armario_inicial.json` armado desde cero con sus prendas, clasificadas con el mismo esquema que uso para las tuyas (nombre, tipo, categoría, colores, formalidad, temporada, abrigo).
3. Copias los seis archivos de la app a una carpeta nueva, reemplazas `armario_inicial.json` por el suyo, y **no** le copias tu `gustos_inicial.json** (o le copias uno vacío, o uno propio si más adelante le armas referencias de estilo).

Así cada cliente tiene su propio armario y sus propios gustos, y no ve nada de los tuyos.

## Pendiente

El panel **De dónde salen las reglas** (dentro de Cómo puntúa) todavía tiene algunas frases con números fijos escritos a mano —"30 pines", "27 referencias", "ocho pines"— que describen específicamente tu caso y no se actualizan según cuántos gustos tenga cada cliente. No es un problema de privacidad ni de contenido inapropiado, es solo texto explicativo que puede quedar impreciso para alguien con otro número de referencias. Lo dejo anotado para una pasada aparte si te importa pulirlo.

El formulario de alta todavía no ofrece "vestido" como categoría para prendas reales, solo existe en el catálogo de ideas.
