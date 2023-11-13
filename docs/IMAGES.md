# 🔵 WsVite

## Images

High performance image processing with ♯[Sharp.js](https://sharp.pixelplumbing.com/).  

Use namespace `/@image:` to initiate image processing.  

The default output format is `.webp`, you can change it with `f` parameter.  

eg.

```html
<img src="/@image:/assets/img/picture.jpg?w=1920&h=540&f=jpg" alt="Picture">
```

### Helpers

You can build the url manually or use the image template helper.  
Available helper parameters are `src`, `width`, `height`, `format`, `loading`, `alt`.  
The default loading method is `lazy`.  

for example this `twig` helper:  

```twig
{{image({ src: '/assets/img/picture.jpg', width: 1440, height: 540, alt: 'Picture' })}}
```

will be converted to `img` tag:

```html
<img
  src="/@image:/assets/img/picture.jpg?w=1440&h=540&f=webp"
  width="1440"
  height="540"
  loading="lazy"
  alt="Picture"
>
```

### Srcset

You can use a `srcset` array with the helper to generate a list of srcset images.  

for example this `twig` helper:  
```twig
{{image({ src: '/assets/img/picture.jpg', srcset: [810, 1080, 1440], alt: 'Picture' })}}
```

will be converted to `img` tag with `srcset` and `sizes` attributes:

```html
<img
  srcset="/@image:/assets/img/picture.jpg?w=810&f=webp 810w,
  /@image:/assets/img/picture.jpg?w=1080&f=webp 1080w,
  /@image:/assets/img/picture.jpg?w=1440&f=webp 1440w"
  sizes="(max-width: 1024px) 810px, (max-width: 1440px) 1080px, 1440px"
  src="/@image:/assets/img/picture.jpg?w=1440&f=webp"
  width="1440"
  height="auto"
  loading="lazy"
  alt="Picture"
>
```

### Picture media query

You can use `src` as array to generate a list of source images with different ratios associated to the query breakpoints.  

Use `down` of `up` property with `breakpoint` to generate the media queries.  

for example this `twig` helper:

```twig
<picture>
{{image({ src: [
  { src: '/assets/img/picture.jpg', width: 768,  height: 614, down: 'xs' },
  { src: '/assets/img/picture.jpg', width: 1024, height: 682, down: 'sm' },
  { src: '/assets/img/picture.jpg', width: 1440, height: 822, down: 'md' },
  { src: '/assets/img/picture.jpg', width: 1600, height: 800, up: 'lg' },
})}}
</picture>
```

will be converted to picture `sources` and default `img` tag:

```html
<picture>
  <source media="(max-width: 767.80px)" srcset="/@image:/assets/img/picture.jpg?w=768&h=614&f=webp" width="768" height="614">
  <source media="(max-width: 1023.80px)" srcset="/@image:/assets/img/picture.jpg?w=1024&h=682&f=webp" width="1024" height="682">
  <source media="(max-width: 1439.80px)" srcset="/@image:/assets/img/picture.jpg?w=1440&h=822&f=webp" width="1440" height="822">
  <img src="/@image:/assets/img/picture.jpg?w=1600&h=800&f=webp" width="1600" height="800" loading="lazy" alt="picture">
</picture>
```

### Placehold

You can use the wildcard `placehold` to generate image placeholder.  

An image placeholder appear also if `src` image is missing.  

```html
<img src="/@image:placehold?w=1440&h=540" alt="Picture">
```

---
#### What's next
[Accessibility Guide](ACCESSIBILITY.md) 

See [Contributing Guide](../CONTRIBUTING.md)
