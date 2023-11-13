# 🔵 WsVite

## Icons

Svg sprite map generation with [SVG Optimizer](https://github.com/svg/svgo) tool for optimizing SVG vector graphics files.  

### Generating spritemap

Simply put your svg icons in the `src/assets/icons` folder.  

Then import the `virtual:spritemap` assets in your `main.js` to automatically generate an svg spritemap with optimized svg symbols at the end of your document body.

***src/js/main.js***
```js
import 'virtual:spritemap';
```

### Helpers

You can write your svg with `use` `xlink:href` manually
or use the `icon` template helper.

for example this `twig` helper:  

```twig
{{icon('websolute')}}
```

will be converted to `svg` tag with correspondent `xlink:href`:

```html
<svg class="icon icon--websolute" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" xmlnsxlink="http://www.w3.org/1999/xlink">
  <use xlink:href="#icon-websolute"></use>
</svg>
```

---
#### What's next
[Images Guide](IMAGES.md)  
[Accessibility Guide](ACCESSIBILITY.md) 

See [Contributing Guide](../CONTRIBUTING.md)
