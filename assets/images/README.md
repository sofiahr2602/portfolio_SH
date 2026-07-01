# Images

Place your project images here. Recommended format and naming:

## Format
- Use **WebP** for best compression + quality (fallback JPG)
- Max width: **1400px** for hero/full-width, **800px** for cards
- Target file size: under **300KB** per image

## Naming convention
project-[name]-[type].[ext]

Examples:
- project-banking-app-cover.webp
- project-brand-studio-cover.webp
- project-social-fashion-cover.webp
- about-photo.webp

## Free tools to compress & convert
- https://squoosh.app  (convert + compress in browser)
- https://tinypng.com  (PNG/JPG compression)

## How to use in index.html
Replace the Unsplash placeholder URLs with local paths:

```html
<!-- Before (placeholder) -->
<img src="https://images.unsplash.com/photo-xxx?w=700&q=80" alt="...">

<!-- After (your image) -->
<img src="assets/images/project-banking-app-cover.webp" alt="Mobile Banking App Redesign">
```
