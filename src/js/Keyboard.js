/* eslint-disable no-param-reassign */
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
    this.currentLang = lang;
    const keyboardInput = createDomNode('textarea', { rows: 20, cols: 100 }, 'keyboard__input');
    keyboardInput.onkeydown = e => {
      const { btn } = this.keys[this.currentLang].find(key => key.code === e.code);
      if (btn.classList.contains('keyboard__key-toggle') && btn.classList.contains('active')) btn.classList.remove('active');
      else btn.classList.add('active');
      if (e.code === 'ShiftRight' || e.code === 'ShiftLeft') {
        this.switchCase(true, e);
      }
    };
    
    keyboardInput.onkeyup = e => {
      if (e.code === 'ShiftRight' || e.code === 'ShiftLeft') {
        this.switchCase(false, e);
      }
      const { btn } = this.keys[this.currentLang].find(key => key.code === e.code);
      if (!btn.classList.contains('keyboard__key-toggle')) btn.classList.remove('active');
    };

    const keyboardWrapper = createDomNode('div', '', 'keyboard__wrapper');
    Object.keys(this.langs).forEach(l => {
      this.langKeys(l, this.langs[l]);
    });
    this.rowsMap.forEach(row => {
      const keyboardRow = createDomNode('div', '', 'keyboard__row');
      let currentHalfContainer;
      row.forEach(code => {
        const keyObj = this.keys[lang].find(el => el.code === code);
        if (keyObj.classes.includes('keyboard__key-half')) {
          if (!currentHalfContainer) {
            currentHalfContainer = createDomNode('div', '', 'keyboard__key-half-container');
          }
          currentHalfContainer.append(keyObj.btn);
          if (currentHalfContainer.children.length === 2) {
            keyboardRow.append(currentHalfContainer);
            currentHalfContainer = null;
          }
        } else {
          keyboardRow.append(keyObj.btn);
        }
      });
      keyboardWrapper.append(keyboardRow);
    });
    document.body.innerHTML = '';
    document.body.append(keyboardInput, keyboardWrapper);
  }

  langKeys(lang, keys) {
    this.keys[lang] = keys.map(key => new Key(key));
  }

  switchCase(state, e) {
    this.keys[this.currentLang]
      .filter(key => key.type !== 'fn')
      .forEach(key => {
        if (key.type === 'double') {
          key.btn.children[0].innerText = key[state ? 'shift' : 'key'];
          key.btn.children[1].innerText = key[state ? 'key' : 'shift'];
        } else key.btn.innerText = key[state ? 'shift' : 'key'];
      });
  }
}
