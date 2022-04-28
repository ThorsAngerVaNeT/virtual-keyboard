/* eslint-disable no-param-reassign */
import { createDomNode } from './common';
import Key from './Key';

export default class Keyboard {
  constructor(rowsMap, langs) {
    this.langs = langs;
    this.rowsMap = rowsMap;
    this.keys = {};
    this.state = { alt: false, caps: false, ctrl: false, shift: false };
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
    this.keyboardInput = createDomNode('textarea', { rows: 20, cols: 100 }, 'keyboard__input');
    this.keyboardInput.onkeydown = e => {
      e.preventDefault();
      const keyObj = this.keys[this.currentLang].find(key => key.code === e.code);
      if (keyObj.type === 'fn' && e.repeat) return;
      if (keyObj) {
        const { btn } = keyObj;
        if (btn.classList.contains('keyboard__key-toggle') && btn.classList.contains('active')) btn.classList.remove('active');
        else btn.classList.add('active');
        if (keyObj.code === 'ShiftRight' || keyObj.code === 'ShiftLeft') {
          this.state.shift = true;
          this.switchCase();
          this.switchDouble();
        }
        if (keyObj.code === 'CapsLock') {
          this.state.caps = !this.state.caps;
          this.switchCase();
        }
      }
    };

    this.keyboardInput.onkeyup = e => {
      e.preventDefault();
      const keyObj = this.keys[this.currentLang].find(key => key.code === e.code);
      if (keyObj) {
        const { btn, code, key, shift, type } = this.keys[this.currentLang].find(k => k.code === e.code);
        if (code === 'ShiftRight' || code === 'ShiftLeft') {
          this.state.shift = false;
          this.switchCase();
          this.switchDouble();
        }
        if (type === 'key') this.keyboardInput.value += this.state.shift !== this.state.caps ? shift : key;
        if (type === 'double') this.keyboardInput.value += this.state.shift ? shift : key;
        if (!btn.classList.contains('keyboard__key-toggle')) btn.classList.remove('active');
      }
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
    document.body.append(this.keyboardInput, keyboardWrapper);
  }

  langKeys(lang, keys) {
    this.keys[lang] = keys.map(key => new Key(key));
  }

  switchCase() {
    this.keys[this.currentLang]
      .filter(key => key.type === 'key')
      .forEach(key => {
        key.btn.innerText = key[this.state.shift !== this.state.caps ? 'shift' : 'key'];
      });
  }

  switchDouble() {
    this.keys[this.currentLang]
      .filter(key => key.type === 'double')
      .forEach(key => {
        key.btn.children[0].innerText = key[this.state.shift ? 'shift' : 'key'];
        key.btn.children[1].innerText = key[this.state.shift ? 'key' : 'shift'];
      });
  }
}
