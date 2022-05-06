import langs from './js/lang/index';
import { rowsMap } from './js/common';
import Keyboard from './js/Keyboard';

window.onload = () => {
  try {
    const keyboard = new Keyboard(rowsMap, langs);
    keyboard.init();
  } catch (error) {
    document.body.innerHTML = error.message;
  }
};
