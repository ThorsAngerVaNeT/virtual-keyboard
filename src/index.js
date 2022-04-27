import langs from './js/lang/index';
import rowsMap from './js/common';
import Keyboard from './js/Keyboard';

window.onload = () => {
  const keyboard = new Keyboard(rowsMap, langs);
  keyboard.init();
};
