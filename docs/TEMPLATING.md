# 🔵 WsVite

## Templating

The templating system uses [Vituum](https://vituum.dev/) plugin to allow [Vite](https://vitejs.dev/) to handle multiple document entry points. 

Available templating engines are [twig](../samples/twig/README.md) and [liquid](../samples/liquid/README.md).  

### Helpers

Available custom helpers are:

|helper                          | description                                                   |
|:-------------------------------|:--------------------------------------------------------------|
|[classNames](#classNames)       |helper for class names based on conditions                     |
|[htmlDecode](#htmlDecode)       |an html decoder                                                |
|[htmlEncode](#htmlEncode)       |an html encoder                                                |
|[icon](#icon)                   |icon svg helper                                                |
|[image](#image)                 |image helper for srcset, sizes and source image optimization   |
|[jsonParse](#jsonParse)         |a json parser                                                  |
|[jsonStringify](#jsonStringify) |a json serializer                                              |
|[style](#style)                 |a style helper for conversion between object to style notation |

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

#### jsonParse

```twig
{{jsonParse({ "item": 1 })}}
```

#### jsonStringify

```twig
{{jsonStringify(item)}}
```

#### style

```twig
{{style(item)}}
```

---
#### What's next
[Icons Guide](ICONS.md)  
[Images Guide](IMAGES.md)  
[Accessibility Guide](ACCESSIBILITY.md)  

See [Contributing Guide](../CONTRIBUTING.md)
