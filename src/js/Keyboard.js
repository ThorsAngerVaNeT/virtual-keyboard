import { createDomNode } from './common';
import Key from './Key';

export default class Keyboard {
  constructor(rowsMap, langs) {
    this.langs = langs;
    this.rowsMap = rowsMap;
    this.keys = {};
    this.btns = [];
    this.pressed = new Set();
    this.state = {
      alt: false, caps: false, ctrl: false, shift: false,
    };
    this.#checkInitParams();
  }

  #checkInitParams() {
    const codes = this.rowsMap.flat();
    if (!Array.from(this.langs)
      .every((lang) => codes.every((code) => lang.find((key) => key.code === code)))
    ) {
      throw new Error("Keyboard rows map and language maps don't match!");
    }
  }

  init() {
    const lang = window.localStorage.getItem('vk-lang') || 'en';
    console.log('lang: ', lang);
    console.log('vk-lang ', window.localStorage.getItem('vk-lang'));
    this.currentLang = lang;
    this.#renderKeyboard();
    this.#addListeners();
  }

  #addListeners() {
    document.onkeydown = (e) => this.#eventHandler(e);

    document.onkeyup = (e) => this.#eventHandler(e);

    window.onblur = () => {
      [...this.pressed].forEach((btn) => {
        btn.classList.remove('active');
        this.pressed.delete(btn);
      });
      this.state = {
        ...this.state, alt: false, ctrl: false, shift: false,
      };
      this.switchCase();
      this.switchDouble();
    };
  }

  #createBtn(keyObj) {
    const btn = createDomNode('button', '', ...keyObj.classes);
    const firstSpan = createDomNode('span', '', 'first');
    firstSpan.innerText = keyObj.key;
    const secondSpan = createDomNode('span', '', 'second');
    secondSpan.innerText = keyObj.type !== 'double' ? '' : keyObj.shift;
    btn.append(firstSpan, secondSpan);
    btn.code = keyObj.code;
    btn.onclick = (e) => this.#eventHandler(e, keyObj);
    this.btns.push(btn);
    return btn;
  }

  #eventHandler(e, clickedKey) {
    e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();

    const keyObj = clickedKey || this.keys[this.currentLang].find((key) => key.code === (e.code));
    if (keyObj) {
      const {
        btn, code, key, shift, type,
      } = keyObj;
      if (code.match(/Ctrl|Alt|Shift|Caps/) && e.repeat) return;
      if (e.type === 'keydown' || e.target.closest('.keyboard__key')) {
        this.pressed.add(btn);
        let cursorPos = this.keyboardInput.selectionStart;
        const cursorPosEnd = this.keyboardInput.selectionEnd;
        const left = this.keyboardInput.value.slice(0, cursorPos);
        const right = this.keyboardInput.value.slice(cursorPosEnd);

        btn.classList.add('active');

        if (code === 'CapsLock') {
          if (btn.classList.contains('toggled')) btn.classList.remove('toggled');
          else btn.classList.add('toggled');
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
              this.state.ctrl = true;
              break;

            case 'AltLeft':
            case 'AltRight':
              this.state.alt = true;
              break;

            default:
              break;
          }
        }
        if ((this.state.ctrl && this.state.alt)) this.switchLanguage();

        if (type === 'key') {
          this.keyboardInput.value = `${left}${this.state.shift !== this.state.caps ? shift : key}${right}`;
          cursorPos += 1;
        }
        if (type === 'double') {
          this.keyboardInput.value = `${left}${this.state.shift ? shift : key}${right}`;
          cursorPos += 1;
        }

        if (!['Shift', 'Ctrl', 'Alt', 'CapsLock'].includes(key)) { this.keyboardInput.setSelectionRange(cursorPos, cursorPos); }
      }
      if (code === 'ShiftRight' || code === 'ShiftLeft') {
        this.state.shift = e.type === 'keydown';
        this.switchCase();
        this.switchDouble();
      }

      if (e.type === 'keyup' || e.type === 'click') {
        if (code === 'ControlLeft' || code === 'ControlRigth') {
          this.state.ctrl = false;
        }
        if (code === 'AltLeft' || code === 'AltRight') {
          this.state.alt = false;
        }

        this.pressed.delete(btn);
        btn.classList.remove('active');
      }

      this.keyboardInput.focus();
    }
  }

  #createLangKeys() {
    Object.keys(this.langs).sort((a) => (a === this.currentLang ? -1 : 1)).forEach((l) => {
      this.keys[l] = this.langs[l].map((key) => {
        const keyObj = new Key(key);
        const btn = this.btns.find((b) => b.code === keyObj.code);
        keyObj.btn = btn || this.#createBtn(keyObj);
        return keyObj;
      });
    });
  }

  #renderKeyboard() {
    const h1 = createDomNode('h1', '', 'title');
    h1.innerText = 'Virtual Keyboard';

    const desc = createDomNode('p', '', 'desc');
    desc.innerText = 'Created in Windows. Press Ctrl+Alt to switch language.';

    this.keyboardInput = createDomNode(
      'textarea',
      { rows: 15, cols: 100, placeholder: 'Click Here to activate keyboard!' },
      'keyboard__input',
    );

    const keyboardWrapper = createDomNode('div', '', 'keyboard__wrapper');

    this.#createLangKeys();

    this.rowsMap.forEach((row) => {
      const keyboardRow = createDomNode('div', '', 'keyboard__row');
      let currentHalfContainer;
      row.forEach((code) => {
        const keyObj = this.keys[this.currentLang].find((el) => el.code === code);
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

    const author = createDomNode('div', '', 'author');
    const github = createDomNode('a', { href: 'https://github.com/ThorsAngerVaNeT', title: 'GitHub' }, 'link');
    github.innerText = 'Vadzim Antonau © 2022';
    author.append(github);

    document.body.innerHTML = '';
    document.body.append(h1, desc, this.keyboardInput, keyboardWrapper, author);
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
      key.btn.classList.add('keyboard__key-double');
      doubles[i].btn.children[0].innerText = key[this.state.shift ? 'shift' : 'key'];
      doubles[i].btn.children[1].innerText = key[this.state.shift ? 'key' : 'shift'];
    });
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ru' : 'en';
    window.localStorage.setItem('vk-lang', this.currentLang);
    this.switchCase();
    this.switchDouble();
  }
}
