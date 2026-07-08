# Amazon Redesign — Registro de mejoras aplicadas

**Fecha:** 8 de julio de 2026
**Alcance:** mejoras de contraste (WCAG 2.1 AA), accesibilidad estructural, robustez sin JavaScript, responsive en tablet y microcopy.
**Archivos modificados (editados in-place, sobrescribiendo los originales):**

- `hero-section/projects/amazon-redesign-website.html`
- `hero-section/projects/amazon-redesign-tokens.css`
- `hero-section/projects/amazon-redesign-design-system.html`

> Nota: no se crearon archivos nuevos ni copias. Se editaron los archivos existentes en la carpeta del proyecto. El contenido, la estructura y el estilo visual del rediseño se conservaron; los cambios son de precisión, no de rediseño.

---

## 1. Contraste de color (WCAG 2.1 AA)

Se midieron los ratios de contraste de todos los colores de texto e interfaz. Varios quedaban por debajo del mínimo de **4.5:1** exigido para texto normal a su tamaño. Todos se corrigieron y se verificaron por cálculo.

### Cambios en `amazon-redesign-tokens.css` (afectan a la web y al design system a la vez)

| Token | Antes | Después | Ratio antes | Ratio después | Estado |
|---|---|---|---|---|---|
| `--az-price` (precio de producto) | `#4875ce` | `#3560bd` | 4.46:1 ❌ | **5.90:1** ✅ | Sobre blanco |
| `--az-deal` (badge de oferta, texto blanco) | `#e0393e` | `#cf2f34` | 4.35:1 ❌ | **5.11:1** ✅ | Texto blanco |
| `--az-success` (botón "Agregado ✓", texto blanco) | `#1c9d5f` | `#17864f` | 3.48:1 ❌ | **4.61:1** ✅ | Texto blanco |

### Cambios en `amazon-redesign-website.html` (usos de azul como texto)

El token `--az-blue` (`#0b75fb`) da 4.24:1 sobre blanco, insuficiente para texto. En los lugares donde se usaba como **texto**, se cambió a `--az-blue-dark` (`#085dc7`, 6.18:1). Donde se usaba como **fondo** (botón de búsqueda, badges) no se tocó, porque ahí ya cumple.

- Hover de enlaces de la barra de categorías (`.az-catnav-links a:hover`)
- Hover de pestañas de producto (`.az-tabs button:hover`)
- Texto de los chips de filtro activo (`.az-chip`) — 3.73:1 → **5.43:1** sobre fondo pale
- Botón "Limpiar filtros" del estado vacío (`.az-empty button`)
- Botón "Mostrar más productos" (`.az-show-more button`)
- Hover del desplegable de categorías (`.az-cat-dropdown button:hover`)

### Títulos del footer

- `.az-footer-col h4`: de `--az-blue` (`#0b75fb`, 4.17:1 sobre navy ❌) a `--az-blue-tint` (`#4fa2ff`, **6.68:1** ✅).

---

## 2. Robustez sin JavaScript (progressive enhancement)

**Problema:** las animaciones de aparición (`.az-reveal`) dejaban el contenido en `opacity: 0` hasta que el JavaScript las revelaba al hacer scroll. Si el JS fallaba o estaba desactivado, secciones enteras (productos, promociones, testimonios) quedaban **invisibles**.

**Solución:** se condicionó la ocultación a una clase `js` que sólo se añade si el JavaScript se ejecuta.

- Se agregó al `<head>`: `<script>document.documentElement.className += ' js';</script>`
- Las reglas pasaron de `.az-reveal { opacity: 0 }` a `.js .az-reveal { opacity: 0 }`.

**Resultado verificado:** con JavaScript desactivado, todo el contenido ahora se muestra correctamente. Antes, la página quedaba prácticamente en blanco.

---

## 3. Accesibilidad estructural

- **Landmark `<main>`:** se envolvió el contenido principal (hero, productos, promociones, testimonios) en un elemento `<main id="main">`, separándolo del `<header>` y el `<footer>`. Mejora la navegación con lectores de pantalla.
- **Enlace "Saltar al contenido":** se añadió un skip link (`.az-skip`) como primer elemento tabulable. Está oculto visualmente y aparece sólo al recibir foco por teclado; salta directamente a `#main`.
- **Tamaño táctil:** los botones de lista de deseos (corazón, `.az-icon-btn`) pasaron de **36×36 px a 40×40 px**, acercándose al mínimo táctil recomendado.

---

## 4. Responsive — barra de filtros en tablet (769–1024 px)

**Problema:** en tablet, los 5 selects (Categoría, Marca, Precio, Valoración, Ordenar por) más los botones "Limpiar/Filtrar" se apretaban en una sola fila, cortando la etiqueta "Ordenar por → Relevancia".

**Solución:** en el breakpoint `max-width: 1024px`, la fila de filtros ahora se envuelve: los selects ocupan el ancho completo y las acciones "Limpiar/Filtrar" bajan a su propia línea, alineadas a la derecha.

```css
.az-pickup-row { flex-wrap: wrap; row-gap: 16px; }
.az-pickup-scroll { flex-basis: 100%; order: 1; }
.az-filter-actions { order: 2; width: 100%; justify-content: flex-end; margin-left: 0; }
```

---

## 5. Microcopy

- **Placeholder del buscador:** de `"Busca por Amazon........"` (puntos irregulares, preposición incorrecta) a `"Busca en Amazon…"` (elipsis tipográfica correcta).
- **Semántica del input:** el campo pasó de `type="text"` a `type="search"` y se le agregó `name="q"`, más apropiado para un buscador.

---

## 6. Sincronización del design system

Como los tokens son compartidos, se actualizaron también las referencias impresas del color **Price** en `amazon-redesign-design-system.html` para que no quedaran desincronizadas con el nuevo valor del token:

- Swatch de color y su etiqueta hex: `#4875CE` → `#3560BD` (con nota "AA 5.9:1").
- Ejemplo tipográfico de precio (color inline).
- Listado de tokens: `--az-price: #4875ce` → `#3560bd`.

---

## Verificación realizada

- **Contrastes:** calculados con la fórmula de luminancia relativa WCAG; los seis valores corregidos pasan 4.5:1 (o 3:1 para objetos gráficos).
- **Renderizado:** capturas en escritorio (1440 px), tablet (834 px) y móvil (390 px), antes y después.
- **Sin-JS:** captura con JavaScript desactivado confirmando que el contenido es visible.
- **Estructura:** un único `<main>` con apertura y cierre correctos; sin usos de azul como texto que fallen contraste.

## Sugerencias de siguiente paso (opcionales)

- Un **spec de handoff** para desarrollo (tokens, estados, breakpoints, componentes).
- Aplicar el mismo criterio de contraste y accesibilidad a las otras webs del portafolio (angie, catmi, gymstyle).
- Agrandar el área táctil de los puntos de los carruseles (dots) en móvil.
