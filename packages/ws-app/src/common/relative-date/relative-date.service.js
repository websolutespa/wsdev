export class RelativeDateService {

  static language = window.navigator.userLanguage || window.navigator.language;
  static formatter = new Intl.RelativeTimeFormat(RelativeDateService.language, { numeric: 'auto' });

  static getRelativeTime() {
    const time = - performance.now() / 1000;
    let scale = 'second';
    const formatter = this.formatter;
    const formattedTime = formatter.format(time, scale);
    console.log('RelativeDateService.getRelativeTime', formattedTime);
    return formattedTime;
  }

}
