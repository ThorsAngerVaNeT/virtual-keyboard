import { createDomNode } from './common';

export default class Key {
  constructor({
    key, code, shift, classes = [],
  }) {
    this.key = key;
    this.code = code;
    this.shift = shift;
    this.classPrefix = 'keyboard__key-';
    this.classes = ['keyboard__key', ...classes];
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

  createBtn() {
    this.btn = createDomNode('button', '', ...this.classes);
    const firstSpan = createDomNode('span', '', 'first');
    firstSpan.innerText = this.key;
    const secondSpan = createDomNode('span', '', 'second');
    secondSpan.innerText = this.type !== 'double' ? '' : this.shift;
    this.btn.append(firstSpan, secondSpan);
    if (this.classes.includes('keyboard__key-toggle')) {
      const toggle = createDomNode('div', '', 'toggler');
      this.btn.append(toggle);
    }
    this.btn.code = this.code;
    return this.btn;
  }
}
