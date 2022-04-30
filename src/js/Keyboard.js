import { createDomNode } from './common';
import Key from './Key';

export default class Keyboard {
  constructor(rowsMap, langs) {
    this.langs = langs;
    this.rowsMap = rowsMap;
    this.keys = {};
    this.btns = [];
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
    this.createLangKeys();

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

  #createBtn(keyObj) {
    const btn = createDomNode('button', { 'data-code': keyObj.code }, ...keyObj.classes);
    const firstSpan = createDomNode('span', '', 'first');
    firstSpan.innerText = keyObj.key;
    const secondSpan = createDomNode('span', '', 'second');
    secondSpan.innerText = keyObj.type !== 'double' ? '' : keyObj.shift;
    btn.append(firstSpan, secondSpan);
    btn.code = keyObj.code;
    btn.onclick = (e) => this.eventListener(e);
    this.btns.push(btn);
    return btn;
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
        let cursorPos = document.querySelector('.keyboard__input').selectionStart;
        const cursorPosEnd = document.querySelector('.keyboard__input').selectionEnd;
        const left = this.keyboardInput.value.slice(0, cursorPos);
        const right = this.keyboardInput.value.slice(cursorPosEnd);

        if (btn.classList.contains('keyboard__key-toggle') && btn.classList.contains('active')) btn.classList.remove('active');
        else btn.classList.add('active');

        if (code === 'CapsLock') {
          this.state.caps = !this.state.caps;
          this.switchCase();
        }

        if (type === 'fn') {
          switch (code) {
            case 'Tab':
              this.keyboardInput.value = `${left}\t${right}`;
              cursorPos += 1;
              break;

            case 'Enter':
              this.keyboardInput.value = `${left}\n${right}`;
              cursorPos += 1;
              break;

            case 'Backspace':
              if (cursorPos === cursorPosEnd) {
                this.keyboardInput.value = `${left.slice(0, -1)}${right}`;
                cursorPos -= 1;
              } else {
                this.keyboardInput.value = `${left}${right}`;
              }
              break;

            case 'ControlLeft':
            case 'ControlRigth':
              this.state.ctrl = !this.state.ctrl;
              break;

            case 'AltLeft':
            case 'AltRight':
              this.state.alt = !this.state.alt;
              break;

            default:
              break;
          }
        }

        if (type === 'key') {
          this.keyboardInput.value = `${left}${this.state.shift !== this.state.caps ? shift : key}${right}`;
          cursorPos += 1;
        }
        if (type === 'double') {
          this.keyboardInput.value = `${left}${this.state.shift ? shift : key}${right}`;
          cursorPos += 1;
        }

        this.keyboardInput.setSelectionRange(cursorPos, cursorPos);
      }
      if (code === 'ShiftRight' || code === 'ShiftLeft') {
        this.state.shift = e.type === 'keydown';
        this.switchCase();
        this.switchDouble();
      }
      if (e.type === 'keyup' || e.target.classList.contains('keyboard__key')) {
        if (this.state.ctrl && this.state.alt) this.switchLanguage();

        if (type === 'fn') {
          switch (code) {
            case 'ControlLeft':
            case 'ControlRigth':
              this.state.ctrl = !this.state.ctrl;
              break;

            case 'AltLeft':
            case 'AltRight':
              this.state.alt = !this.state.alt;
              break;

            default:
              break;
          }
        }
        if (!btn.classList.contains('keyboard__key-toggle')) {
          btn.classList.remove('active');
        }
      }

      if (document.activeElement !== this.keyboardInput) {
        this.keyboardInput.focus();
      }
    }
  }

  createLangKeys() {
    Object.keys(this.langs).forEach((l) => {
      this.keys[l] = this.langs[l].map((key) => {
        const keyObj = new Key(key);
        const btn = this.btns.find((b) => b.code === keyObj.code);
        keyObj.btn = btn || this.#createBtn(keyObj);
        return keyObj;
      });
    });
  }

  switchCase() {
    const keys = this.keys[this.currentLang].filter((key) => key.type === 'key');
    keys.forEach((key, i) => {
      keys[i].btn.children[0].innerText = key[this.state.shift !== this.state.caps ? 'shift' : 'key'];
      keys[i].btn.children[1].innerText = '';
    });
  }

  switchDouble() {
    const doubles = this.keys[this.currentLang].filter((key) => key.type === 'double');
    doubles.forEach((key, i) => {
      doubles[i].btn.children[0].innerText = key[this.state.shift ? 'shift' : 'key'];
      doubles[i].btn.children[1].innerText = key[this.state.shift ? 'key' : 'shift'];
    });
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ru' : 'en';
    this.switchCase();
    this.switchDouble();
  }
}
