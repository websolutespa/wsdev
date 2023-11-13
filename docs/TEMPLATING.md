# 🔵 WsVite

## Templating

The templating system uses [Vituum](https://vituum.dev/) plugin to allow [Vite](https://vitejs.dev/) to handle multiple document entry points. 

Available templating engines are [twig](../samples/twig/README.md) and [liquid](../samples/liquid/README.md).  

### Helpers

Available custom helpers are:

|helper                     | description                                                   |
|:--------------------------|:--------------------------------------------------------------|
|[classNames](#classNames)  |helper for class names based on conditions                     |
|[icon](#icon)              |icon svg helper                                                |
|[image](#image)            |image helper for srcset, sizes and source image optimization   |
|[json](#json)              |a json parser                                                  |
|[toJson](#toJson)          |a json serializer                                              |
|[style](#style)            |a style helper for conversion between object to style notation |

#### classNames

```twig
<div class="{{classNames({ active: i === 0 })}}">
```

#### icon

```twig
{{icon('websolute')}}
```

#### image

```twig
{{image({ src: '/assets/img/picture.jpg', width: 1440, height: 540, alt: 'Picture' })}}
```

#### toJson

```twig
{{json({ "item": 1 })}}
```

#### style

```twig
{{toJson(item)}}
```

---
#### What's next
[Icons Guide](ICONS.md)  
[Images Guide](IMAGES.md)  
[Accessibility Guide](ACCESSIBILITY.md)  

See [Contributing Guide](../CONTRIBUTING.md)
