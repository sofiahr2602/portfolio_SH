# Projects — Individual Case Study Pages

Each project gets its own HTML file here.

## Naming convention
[category]-[project-name].html

Examples:
- ux-banking-app.html
- ui-design-system.html
- graphic-brand-studio.html
- social-fashion-campaign.html
- video-reel-2024.html

## Linking from index.html
In index.html, update the data-url of the project card:

```html
<!-- External link (Behance, live site, etc.) -->
<div class="project-item" data-category="ux ui"
     data-url="https://www.behance.net/gallery/YOUR-PROJECT"
     data-title="Your Project Name">

<!-- Internal page (case study HTML) -->
<div class="project-item" data-category="ux ui"
     data-url="projects/ux-banking-app.html"
     data-title="Banking App Redesign">
```

## Template
Copy this starter template for each new case study page and save it in this folder.
See: projects/template.html

## Proyectos UX/UI con 3 sub-páginas (Design System / Brand Book / Página Web)

Para proyectos UX/UI completos (como Angie), el estándar es una card con **3 botones**
en vez de un solo link. Ejemplo real: la card de Angie en `index.html`.

1. Crea 3 archivos HTML en esta carpeta con el naming `[proyecto]-design-system.html`,
   `[proyecto]-brand-book.html`, `[proyecto]-website.html`.
2. En `index.html`, el `.project-item` **no lleva `data-url`** (así el card completo
   no es clickeable como bloque único) y agrega dentro un bloque `.project-links`
   con los 3 botones:

```html
<div class="project-item" data-category="ux ui" data-title="Nombre del Proyecto">
  <div class="project-card bg-gray-100">
    <img src="..." alt="Nombre del Proyecto">
    <div class="card-overlay">
      <span class="text-xs font-semibold tracking-widest uppercase mb-1" style="color:var(--lilac-light)">UX · UI</span>
      <h3 class="text-white text-lg font-semibold leading-snug">Nombre del Proyecto</h3>
      <p class="text-white/65 text-sm mb-1">Brand book · Design system · Website</p>
    </div>
    <span class="absolute top-4 left-4 px-3 py-1 bg-white/90 text-gray-700 text-xs font-semibold rounded-full">UX / UI</span>
  </div>
  <div class="project-links">
    <a class="project-link-btn" href="projects/[proyecto]-design-system.html" target="_blank" rel="noopener">Design System</a>
    <a class="project-link-btn" href="projects/[proyecto]-brand-book.html" target="_blank" rel="noopener">Brand Book</a>
    <a class="project-link-btn" href="projects/[proyecto]-website.html" target="_blank" rel="noopener">Página Web</a>
  </div>
</div>
```

No hace falta tocar `main.js`: el script ya ignora los `.project-item` sin `data-url`,
así que los 3 botones funcionan como links normales sin conflicto con el click del card.
