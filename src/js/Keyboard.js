import { createDomNode } from './common';
import Key from './Key';

export default class Keyboard {
  constructor(rowsMap, langs) {
    this.langs = langs;
    this.rowsMap = rowsMap;
    this.keys = {};
    this.state = {
      alt: false, caps: false, ctrl: false, shift: false,
    };
    this.checkInitParams();
  }

  checkInitParams() {
    const codes = this.rowsMap.flat();
    if (!Array.from(this.langs)
      .every((lang) => codes.every((code) => lang.find((key) => key.code === code)))
    ) {
      throw new Error("Keyboard rows map and language maps don't match!");
    }
  }

  init(lang = 'en') {
    this.currentLang = lang;
    this.keyboardInput = createDomNode(
      'textarea',
      { rows: 15, cols: 100, placeholder: 'Click Here to activate keyboard!' },
      'keyboard__input',
    );

    this.keyboardInput.onkeydown = (e) => this.eventListener(e);

    this.keyboardInput.onkeyup = (e) => this.eventListener(e);

    const keyboardWrapper = createDomNode('div', '', 'keyboard__wrapper');
    Object.keys(this.langs).forEach((l) => {
      this.createLangKeys(l, this.langs[l]);
    });
    this.rowsMap.forEach((row) => {
      const keyboardRow = createDomNode('div', '', 'keyboard__row');
      let currentHalfContainer;
      row.forEach((code) => {
        const keyObj = this.keys[lang].find((el) => el.code === code);
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

  eventListener(e) {
    e.preventDefault();
    const keyObj = this.keys[this.currentLang].find((key) => key.code === (e.code || e.target.getAttribute('data-code')));
    if (keyObj) {
      const {
        btn, code, key, shift, type,
      } = keyObj;
      if (type === 'fn' && e.repeat) return;
      if (e.type === 'keydown' || e.target.classList.contains('keyboard__key')) {
        if (btn.classList.contains('keyboard__key-toggle') && btn.classList.contains('active')) btn.classList.remove('active');
        else btn.classList.add('active');
        if (code === 'CapsLock') {
          this.state.caps = !this.state.caps;
          this.switchCase();
        }
      }
      if (code === 'ShiftRight' || code === 'ShiftLeft') {
        this.state.shift = e.type === 'keydown';
        this.switchCase();
        this.switchDouble();
      }
      if (e.type === 'keyup' || e.target.classList.contains('keyboard__key')) {
        if (type === 'fn') {
          switch (code) {
            case 'Tab':
              this.keyboardInput.value += '\t';
              break;

            case 'Enter':
              this.keyboardInput.value += '\n';
              break;

            case 'Backspace':
              this.keyboardInput.value += '\n';
              break;

            default:
              break;
          }
        }
        if (type === 'key') this.keyboardInput.value += this.state.shift !== this.state.caps ? shift : key;
        if (type === 'double') this.keyboardInput.value += this.state.shift ? shift : key;
        if (!btn.classList.contains('keyboard__key-toggle')) btn.classList.remove('active');
      }
      if (document.activeElement !== this.keyboardInput) this.keyboardInput.focus();
    }
  }

  createLangKeys(lang, keys) {
    this.keys[lang] = keys.map((key) => {
      const keyObj = new Key(key);
      keyObj.btn.onclick = (e) => this.eventListener(e);
      return keyObj;
    });
  }

  switchCase() {
    const keys = this.keys[this.currentLang].filter((key) => key.type === 'key');
    keys.forEach((key, i) => {
      keys[i].btn.innerText = key[this.state.shift !== this.state.caps ? 'shift' : 'key'];
    });
  }

  switchDouble() {
    const doubles = this.keys[this.currentLang].filter((key) => key.type === 'double');
    doubles.forEach((key, i) => {
      doubles[i].btn.children[0].innerText = key[this.state.shift ? 'shift' : 'key'];
      doubles[i].btn.children[1].innerText = key[this.state.shift ? 'key' : 'shift'];
    });
  }
}
