import './section.component.scss';

export function SectionComponent(node, data, unsubscribe$) {
  const time = Math.floor(performance.now() / 100) / 10;
  // console.log('SectionComponent.onInit', time);
  node.querySelector('.section__time').innerHTML = `SectionComponent.onInit at ${time}s`;
  // node.querySelector('.section__time').innerHTML = RelativeDateService.getRelativeTime();
}

SectionComponent.meta = {
  selector: '[data-section]',
};
