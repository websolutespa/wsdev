# 🔵 WsVite

## Theming

Boilerplates use an integrated and versatile theming system.
All the configurations happens on [theme.json](src/theme/theme.json) where all the properties will be converted to both scss vars and css vars.  

For example this object:

```json
{
  "color": {
    "neutral": {
      "100": "#fafafa"
    }
  }
},
```

will be converted to css var:

```css
--color-neutral-100: #fafafa;
```
and scss var:

```scss
$color-neutral-100: var(--color-neutral-100);
```

As extra, breakpoints and array size values will be automatically applied to your template vars.

## Breakpoints

Breakpoint is a special prop where you define your media queries breakpoints.

```json
"breakpoint": {
    "xs": 0,
    "sm": "768px",
    "md": "1024px",
    "lg": "1440px",
    "xl": "1600px"
},
```
Any further property could use those breakpoints to automatically generate media query for vars.

For example:

```json
"grid": {
  "default": {
    "columnGap": {
      "xs": "8px",
      "sm": "16px",
      "md": "24px",
      "lg": "32px",
      "xl": "40px"
    },
  }
},
```
generate this css var with media queries:

```css
--grid-colum-gap: 8px;

@media (min-width: 768px) {
  --grid-column-gap: 16px;
}

@media (min-width: 1024px) {
  --grid-column-gap: 24px;
}

...
```

## Fluid values

You can obtain automatically fluid values passing to the prop an array with a min and max.

```json
"propertyName": {
  "fontSize": [ 64, 80 ]
},
```

generating a precalculated fluid css rule based on your breakpoints as for the example:

```css
--property-name-font-size: max(64px, min(80px, 64px + (100vw - 768px) / 1152 * (80 - 64)));
```

## Spacing values

Spacing values automatically generates spacing classes with fluid values support.

For example this default margin property:

```json
"margin": {
  "default": [ 4, 8, 12, 16, 24, 32, [ 32, 40 ], [ 40, 48 ], [ 48, 64 ], [ 64, 80 ], [ 80, 96 ], [ 96, 128 ], [ 128, 160 ] ]
},
```
translates to

```css
:root {
  --m-4: 4px;
  --m-8: 8px;
  --m-12: 12px;
  --m-16: 16px;
  --m-24: 24px;
  --m-32: 32px;
  --m-40: max(32px, min(40px, 32px + (100vw - 768px) / 1152 * (40 - 32)));
  --m-48: max(40px, min(48px, 40px + (100vw - 768px) / 1152 * (48 - 40)));
  --m-64: max(48px, min(64px, 48px + (100vw - 768px) / 1152 * (64 - 48)));
  --m-80: max(64px, min(80px, 64px + (100vw - 768px) / 1152 * (80 - 64)));
  --m-96: max(80px, min(96px, 80px + (100vw - 768px) / 1152 * (96 - 80)));
  --m-128: max(96px, min(128px, 96px + (100vw - 768px) / 1152 * (128 - 96)));
  --m-160: max(128px, min(160px, 128px + (100vw - 768px) / 1152 * (160 - 128)));
}
```
Accordingly all the relative classes has been generated to use on your template:

`.mt-8`, `.mr-8`, `.mb-8`, `.ml-8`, `.my-8`, `.mx-8`, `.m-8`, `.mt-12`, etc...

---
#### What's next
[Templating Guide](TEMPLATING.md)   
[Icons Guide](ICONS.md)  
[Images Guide](IMAGES.md)  
[Accessibility Guide](ACCESSIBILITY.md)  

See [Contributing Guide](../../CONTRIBUTING.md)
