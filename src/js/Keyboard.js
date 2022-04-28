/* eslint-disable class-methods-use-this */
import { createDomNode } from './common';
import Key from './Key';

export default class Keyboard {
  constructor(rowsMap, langs) {
    this.langs = langs;
    this.rowsMap = rowsMap;
    this.keys = {};
    this.checkInitParams();
  }

  checkInitParams() {
    const codes = this.rowsMap.flat();
    if (!Array.from(this.langs).every(lang => codes.every(code => lang.find(key => key.code === code)))) {
      throw new Error("Keyboard rows map and language maps don't match!");
    }
  }

  init(lang = 'en') {
    const keyboardWrapper = createDomNode('div', '', 'keyboard__wrapper');
    Object.keys(this.langs).forEach(l => {
      this.langKeys(l, this.langs[l]);
    });
    this.rowsMap.forEach(row => {
      const keyboardRow = createDomNode('div', '', 'keyboard__row');
      let currentHalfContainer;
      row.forEach(code => {
        const keyObj = this.keys[lang].find(el => el.code === code);
        const btn = keyObj.render();
        if (keyObj.classes.includes('keyboard__key-half')) {
          if (!currentHalfContainer) {
            currentHalfContainer = createDomNode('div', '', 'keyboard__key-half-container');
          }
          currentHalfContainer.append(btn);
          if (currentHalfContainer.children.length === 2) {
            keyboardRow.append(currentHalfContainer);
            currentHalfContainer = null;
          }
        } else {
          keyboardRow.append(btn);
        }
      });
      keyboardWrapper.append(keyboardRow);
    });
    document.body.innerHTML = '';
    document.body.append(keyboardWrapper);
  }

  langKeys(lang, keys) {
    this.keys[lang] = keys.map(key => new Key(key));
  }
}
