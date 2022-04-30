export default class Key {
  constructor({
    key, code, shift, classes = [],
  }) {
    this.key = key;
    this.code = code;
    this.shift = shift;
    this.classPrefix = 'keyboard__key-';
    this.classes = ['keyboard__key', ...classes.map((cl) => `${this.classPrefix}${cl}`)];
    this.init();
  }

  init() {
    switch (this.shift) {
      case '':
      case ' ':
        this.shift = this.key.toUpperCase();
        this.type = 'key';
        break;

      case null:
        this.type = 'fn';
        this.classes.push(`${this.classPrefix}fn`);
        break;

      default:
        this.type = 'double';
        this.classes.push(`${this.classPrefix}double`);
        break;
    }
  }
}
