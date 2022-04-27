/* eslint-disable class-methods-use-this */
export default class {
  constructor(rowsMap, langs) {
    this.langs = langs;
    this.rowsMap = rowsMap;
    this.checkInitParams();
  }

  checkInitParams() {
    const codes = this.rowsMap.flat();
    if (!Array.from(this.langs).every(lang => codes.every(code => lang.find(key => key.code === code)))) {
      throw new Error("Keyboard rows map and language maps don't match!");
    }
  }

  init(lang = 'en') {
    const keyboardWrapper = this.createDomNode('div', '', 'keyboard__wrapper');
    this.rowsMap.forEach(row => {
      const keyboardRow = this.createDomNode('div', '', 'keyboard__row');
      row.forEach(code => {
        const btn = this.createDomNode('button', { 'data-code': code }, 'keyboard__key');
        const keyObj = this.langs[lang].find(el => el.code === code);
        if (keyObj) {
          btn.innerText = keyObj.key;
        }
        keyboardRow.append(btn);
      });
      keyboardWrapper.append(keyboardRow);
    });
    document.body.innerHTML = '';
    document.body.append(keyboardWrapper);
  }

  createDomNode(element, attributes, ...classes) {
    const node = document.createElement(element);
    node.classList.add(...classes);
    if (attributes) {
      Object.keys(attributes).forEach(key => {
        node.setAttribute(key, attributes[key]);
      });
    }
    return node;
  }
}
