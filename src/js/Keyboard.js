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
      caps: false, arrowswitch: false,
    };
    this.#setACSState(false);
    this.#checkInitParams();
  }

  #setACSState(value) {
    ['alt', 'ctrl', 'shift'].forEach((b) => {
      this.#setState(b, value);
    });
  }

  #setState(key, value) {
    this.state[key] = value;
    this.state[`${key}left`] = value;
    this.state[`${key}right`] = value;
  }

  #checkInitParams() {
    const codes = this.rowsMap.flat().filter((b) => b !== 'Lang');
    const langs = Object.entries(this.langs);
    if (!codes.length || !langs.length) throw new Error('Rows map or languages object are empty!');
    langs
      .every((lang) => codes.every((code) => {
        if (!lang[1].find((key) => key.code === code)) throw new Error(`Keyboard rows map and language maps don't match!<br/>Language: ${lang[0]}, rows map code not found: ${code}`);
        else return true;
      }));
  }

  init() {
    let storageLang = window.localStorage.getItem('vk-lang');

    if (!storageLang || !this.langs[storageLang]) {
      storageLang = 'en';
      window.localStorage.setItem('vk-lang', storageLang);
    }

    this.currentLang = storageLang;
    this.#renderKeyboard();
    this.#addListeners();
  }

  #addListeners() {
    document.onkeydown = (e) => this.#eventHandler(e);

    document.onkeyup = (e) => this.#eventHandler(e);

    window.onblur = () => {
      this.#resetAllBtns();
      this.#setACSState(false);
      this.switchCase();
      this.switchDouble();
    };
  }

  #createLangKeys() {
    Object.keys(this.langs).sort((a) => (a === this.currentLang ? -1 : 1)).forEach((l) => {
      this.keys[l] = this.langs[l].map((key) => {
        const keyObj = new Key(key);
        let btn = this.btns.find((b) => b.code === keyObj.code);
        if (!btn) {
          btn = keyObj.createBtn();
          btn.onmousedown = (e) => this.#eventHandler(e, keyObj);
          btn.onmouseup = (e) => this.#eventHandler(e, keyObj);
          btn.onmouseleave = (e) => this.#eventHandler(e, keyObj);
          this.btns.push(btn);
        }
        keyObj.btn = btn;
        return keyObj;
      });
    });
  }

  #eventHandler(e, clickedKey) {
    if (e.stopPropagation) e.stopPropagation();

    const keyObj = this.keys[this.currentLang]
      .find((key) => key.code === (e.code || clickedKey.code));
    if (keyObj) {
      const {
        btn, code, key, shift, type,
      } = keyObj;
      if (!(this.state.ctrl)) e.preventDefault();
      if (key.match(/Alt|Caps|Ctrl|Shift/) && e.repeat) return;

      if (e.type === 'keydown' || e.type === 'mousedown' || (window.navigator.userAgent.match(/Macintosh/) && e.type === 'keyup' && code === 'CapsLock')) {
        let cursorPos = this.keyboardInput.selectionStart;
        const cursorPosEnd = this.keyboardInput.selectionEnd;
        const left = this.keyboardInput.value.slice(0, cursorPos);
        const right = this.keyboardInput.value.slice(cursorPosEnd);

        if (code === 'CapsLock') {
          if (btn.classList.contains('toggled')) btn.classList.remove('toggled');
          else btn.classList.add('toggled');
          this.state.caps = !this.state.caps;
          this.switchCase();
        }

        if (code === 'ShiftRight' || code === 'ShiftLeft') {
          this.state[code.toLowerCase()] = true;
          this.state.shift = this.state[`${key.toLowerCase()}left`] || this.state[`${key.toLowerCase()}right`];
          this.switchCase();
          this.switchDouble();
        }

        if (e.type === 'mousedown' && code.match(/Alt|Control|Shift|ArrowSwitch/) && btn.classList.contains('active')) {
          this.state[code.toLowerCase()] = false;
          this.state[key.toLowerCase()] = this.state[`${key.toLowerCase()}left`] || this.state[`${key.toLowerCase()}right`];
          this.#resetBtn(btn);
          this.switchCase();
          this.switchDouble();
        } else {
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

              case 'Delete':
                if (cursorPos === cursorPosEnd) {
                  this.keyboardInput.value = `${left}${right.slice(1)}`;
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

              case 'ArrowSwitch':
                this.state.arrowswitch = true;
                break;

              case 'LangSwitch':
                this.switchLanguage();
                break;

              default:
                break;
            }
          }
          this.pressed.add(btn);
          btn.classList.add('active');

          if (!this.state.caps && window.navigator.userAgent.match(/Macintosh/) && code === 'CapsLock') {
            btn.classList.remove('active');
          }
        }

        if ((this.state.shift && key === 'Alt') || (this.state.alt && key === 'Shift')) {
          this.switchLanguage();
          if (e.type === 'mousedown') {
            this.state.shift = false;
            this.state.alt = false;
            this.switchCase();
            this.btns.filter((b) => b.code.startsWith('Shift') || b.code.startsWith('Alt')).forEach((b) => {
              this.#resetBtn(b);
            });
          }
        }

        if (type === 'key' && !(this.state.ctrl || this.state.alt)) {
          this.keyboardInput.value = `${left}${this.state.shift !== this.state.caps ? shift : key}${right}`;
          cursorPos += 1;
        }
        if (type === 'double' && !(this.state.ctrl || this.state.alt)) {
          this.keyboardInput.value = `${left}${this.state.shift ? shift : key}${right}`;
          cursorPos += 1;
        }

        if (!code.match(/Alt|Arrow|Caps|Control|Shift/) && !(this.state.ctrl || this.state.alt)) {
          this.keyboardInput.setSelectionRange(cursorPos, cursorPos);
          this.selectionPos = null;
        }
        if (code.match(/ArrowUp|ArrowRight|ArrowDown|ArrowLeft/)) {
          if (this.state.arrowswitch) {
            let newPos;
            const lines = this.getTextLines();
            const {
              currentLineIndex, posInCurrentLine, prevLinesLength, nextLinesLength,
            } = this.getPosInfo(lines);

            if (code === 'ArrowUp') {
              if (currentLineIndex === 0) {
                newPos = 0;
              } else {
                const newLineLength = lines[currentLineIndex - 1].length;
                const pos = (this.selectionPos || posInCurrentLine);
                if (newLineLength < pos) {
                  this.selectionPos = pos;
                  newPos = prevLinesLength - 1;
                } else {
                  newPos = prevLinesLength - newLineLength + pos;
                  this.selectionPos = null;
                }
              }
            }

            if (code === 'ArrowDown') {
              if (currentLineIndex === lines.length - 1) {
                newPos = nextLinesLength;
              } else {
                const newLineLength = lines[currentLineIndex + 1].length;
                const pos = (this.selectionPos || posInCurrentLine);
                if (newLineLength < pos) {
                  this.selectionPos = pos;
                  newPos = nextLinesLength - 1;
                } else {
                  newPos = nextLinesLength - newLineLength + pos;
                  this.selectionPos = null;
                }
              }
            }

            if (code === 'ArrowLeft' || code === 'ArrowRight') {
              const posInc = code === 'ArrowLeft' ? -1 : 1;
              newPos = this.keyboardInput.selectionStart + posInc;
              this.selectionPos = null;
            }

            this.keyboardInput.setSelectionRange(newPos, newPos);
          } else {
            this.keyboardInput.value = `${left}${key}${right}`;
            cursorPos += 1;
            this.keyboardInput.setSelectionRange(cursorPos, cursorPos);
          }
        }
      }

      if (e.type === 'keyup' || e.type === 'mouseup' || e.type === 'mouseleave') {
        if (e.type === 'keyup') {
          if (code === 'ControlLeft' || code === 'ControlRigth') {
            this.state.ctrl = false;
          }
          if (code === 'AltLeft' || code === 'AltRight') {
            this.state.alt = false;
          }
          if (code === 'ShiftRight' || code === 'ShiftLeft') {
            this.state[code.toLowerCase()] = false;
            this.state.shift = this.state[`${key.toLowerCase()}left`] || this.state[`${key.toLowerCase()}right`];
            this.switchCase();
            this.switchDouble();
          }
        }
        if (!((e.type === 'mouseup' || e.type === 'mouseleave') && code.match(/Alt|Control|Shift|ArrowSwitch/))) {
          this.#resetBtn(btn);
        }
      }

      this.keyboardInput.focus();
    }
  }

  getPosInfo(lines) {
    const currentPos = this.keyboardInput.selectionStart;
    let currentLineIndex = 0;
    let counter = 0;
    while (counter <= currentPos) {
      counter += lines[currentLineIndex].length;
      currentLineIndex += 1;
    }
    currentLineIndex -= 1;

    const prevLinesLength = counter - (currentLineIndex > 0
      ? lines[currentLineIndex].length : lines[0].length);

    const nextLinesLength = counter + (currentLineIndex < (lines.length - 1)
      ? lines[currentLineIndex + 1].length : 0);

    const posInCurrentLine = (currentPos >= lines[0].length
      ? currentPos - prevLinesLength : currentPos);

    return {
      currentPos, currentLineIndex, posInCurrentLine, prevLinesLength, nextLinesLength,
    };
  }

  getTextLines() {
    const linesByBreaker = this.keyboardInput.value.split('\n').map((line) => `${line} `);
    const cols = this.keyboardInput.cols + 2;
    const lines = linesByBreaker.map((line) => {
      if (line.length <= cols) return line;

      const words = line.split(' ');
      const splittedLines = [];
      let gluedLine = '';
      words.forEach((word, i) => {
        if (gluedLine.length + word.length + 1 <= cols && i !== words.length - 1) {
          gluedLine += `${word} `;
        } else {
          let tmp = word;
          if (gluedLine !== '') splittedLines.push(gluedLine);
          while (tmp.length >= cols) {
            splittedLines.push(tmp.slice(0, cols - 1));
            tmp = tmp.slice(cols - 1);
          }
          gluedLine = `${tmp} `;
        }
      });
      return splittedLines;
    }).flat();

    return lines;
  }

  #renderKeyboard() {
    const h1 = createDomNode('h1', '', 'title');
    h1.innerText = 'Virtual Keyboard';

    const desc = createDomNode('p', '', 'desc');
    desc.innerText = 'Created in Windows. Press Shift+Alt to switch language.\n';
    const icon = createDomNode('span', '', 'material-icons-outlined');
    icon.innerText = 'compare_arrows';
    desc.append(icon);
    desc.innerHTML += ' - click to switch arrow keys behavior';

    this.keyboardInput = createDomNode(
      'textarea',
      {
        rows: 16,
        cols: 80,
        placeholder: `Additional features
  1) Arrow behavior switcher:
    - arrow keys insert arrow symbols by default;
    - arrow keys navigate caret when the arrow switcher is enabled (yes, it's not perfect, but works well in normal test cases).
  2) Alt, Ctrl, Shift can be toggled and save toggle state by mouse click. Another click turns off toggle state. This behavior make possible to switch language, type shifted symbols only by mouse.
  3) Toggled/pressed keys losing those states when the window loses focus (Alt+Tab).
  4) macOS Caps Lock behavior is handled.
  5) Multiple language support. EN, RU, BY languages are provided. You can copy language file, update it, import in "src/lang/index.js" and everything will work the same way.
  6) Language switch button was added to display current language, it also switch language at mouse click.
  
Please keep in mind
  1) If you run ESLint check in my repo at your computer and "Expected linebreaks to be LF but found CRLF linebreak-style" errors appear, it's your git have wrong 'autocrlf' setting and it's your git replaces all LF in my sources to CRLF.
  2) "Error with Permissions-Policy header: Origin trial controlled feature not enabled: 'interest-cohort'." warning in console is normal behavior at GitHub Pages. This warning about Chrome settings and not connected with my app and code.
  3) Right Alt (AltGraph) simultaneously triggers events for right Alt and left Ctrl when your system keyboard layout is RU. It's normal behavior.`,
        spellcheck: false,
      },
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
    const github = createDomNode('a', { href: 'https://github.com/ThorsAngerVaNeT', target: '_blank', title: 'GitHub' }, 'link');
    github.innerText = 'Vadzim Antonau © 2022';
    author.append(github);

    document.body.innerHTML = '';
    document.body.append(h1, desc, this.keyboardInput, keyboardWrapper, author);
  }

  #resetAllBtns() {
    [...this.pressed].forEach((btn) => {
      if (btn.code !== 'ArrowSwitch') this.#resetBtn(btn);
    });
  }

  #resetBtn(btn) {
    if (!this.pressed.has(btn) && btn.code.match(/Shift/)) {
      const anotherShift = this.btns.find((b) => b.code.match(/Shift/) && b !== btn);
      if (this.pressed.has(anotherShift)) {
        this.#setState('shift', false);
        this.#resetBtn(anotherShift);
        this.switchCase();
        this.switchDouble();
      }
    }
    this.pressed.delete(btn);
    btn.classList.remove('active');
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
    const langs = Object.keys(this.langs);
    const currentLangIndex = langs.indexOf(this.currentLang);
    const nextLangIndex = (currentLangIndex + 1) % langs.length;
    this.currentLang = langs[nextLangIndex];
    this.btns.find((b) => b.code === 'LangSwitch').children[0].innerText = this.currentLang.toUpperCase();
    window.localStorage.setItem('vk-lang', this.currentLang);
    this.switchCase();
    this.switchDouble();
  }
}
