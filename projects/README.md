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
