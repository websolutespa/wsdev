# 🔵 WsVite

## Accessibility

The accessible plugin uses [AxeCore](https://www.deque.com/axe/) accessibility testing tools to perform a document [a11y](https://www.a11yproject.com/) validation.

### Usage

Simply import the `virtual:accessible` assets in your `main.js` to automatically perform a document [a11y](https://www.a11yproject.com/) validation on your browser console.

***src/js/main.js***
```js
import 'virtual:accessible';
```

***The validation scripts will be loaded and executed only in `dev` mode.***

By default only violations will be logged on console.

To log passed tests also configure `accessible` plugin as follow.

***vite.config.js***
```js

export default wsVite({
  ...
  accessible: {
    // level: 0, // inapplicable
    level: 1, // passes 
    // level: 2, // incomplete
    // level: 3, // violations
  },
  ...
});
```

---
#### ↩ back to [Introduction](INTRODUCTION.md) 

See [Contributing Guide](../CONTRIBUTING.md)
