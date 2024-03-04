import './lazy-module.component.scss';

export function LazyModuleComponent(props) {
  const { element } = props;
  const time = Math.floor(performance.now() / 100) / 10;
  console.log('LazyModuleComponent.onInit', time);
  element.querySelector('.guide__abstract').innerHTML = `LazyModuleComponent.onInit at ${time}s`;
  // element.querySelector('.guide__abstract').innerHTML = RelativeDateService.getRelativeTime();
}

LazyModuleComponent.meta = {
  selector: '[data-lazy-module-component]',
};
