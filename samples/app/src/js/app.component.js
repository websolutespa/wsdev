import { useEvent, useState } from '@websolutespa/ws-app';

function getRandomItems() {
  const count = 5 + Math.floor(Math.random() * 21);
  const items = new Array(count).fill(0).map((x, i) => {
    const char = String.fromCharCode(65 + i);
    return {
      id: i + 1,
      name: char,
      title: `I’m the char “${char}”`,
    };
  });
  return items;
}

function getRandomItem(items) {
  const item = items[Math.floor(items.length * Math.random())];
  return item;
}

export function AppComponent(props) {
  const { node } = props;
  const items = getRandomItems();
  const item = getRandomItem(items);

  const state = useState(node, {
    items,
    item,
    doSelect: (item) => {
      console.log('AppComponent.doSelect', item);
      state.item = item;
    },
  });

  useEvent(props, (event) => {
    console.log('AppComponent.event$', event);
    switch (event.type) {
      case 'modal':
        // openModal('Hello world!');
        break;
      case 'randomize':
        state.items = getRandomItems();
        state.item = getRandomItem(state.items);
        break;
      case 'alert':
        alert(event.type);
        break;
    }
  });
}

AppComponent.meta = {
  selector: '[data-app]',
};
