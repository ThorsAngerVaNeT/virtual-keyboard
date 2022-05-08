# Virtual-Keyboard
["Virtual Keyboard" RS School task](https://github.com/rolling-scopes-school/tasks/blob/master/tasks/virtual-keyboard/virtual-keyboard-en.md)

## Deploy 
   https://thorsangervanet.github.io/virtual-keyboard/

## Downloading

```
git clone https://github.com/ThorsAngerVaNeT/virtual-keyboard
```

## Switch branch

```
git checkout -q dev
```

## Installing NPM modules

```
npm install
```

## Run ESLint check

```
npm run lint
```

## Run Webpack Dev Server

```
npm start
```

## Build to prod

```
npm run build
```

## Please keep in mind
  1) If you run ESLint check in my repo at your computer and "Expected linebreaks to be LF but found CRLF linebreak-style" errors appear, it's your git have wrong 'autocrlf' setting and it's your git replaces all LF in my sources to CRLF.
  2) "Error with Permissions-Policy header: Origin trial controlled feature not enabled: 'interest-cohort'." warning in console is normal behavior at GitHub Pages. This warning about Chrome settings and not connected with my app and code.
  3) Right Alt (AltGraph) simultaneously triggers events for right Alt and left Ctrl when your system keyboard layout is RU. It's normal behavior.

## Additional features
  1) Arrow behavior switcher:
    - arrow keys insert arrow symbols by default;
    - arrow keys navigate caret when the arrow switcher is enabled (yes, it's not perfect, but works well in normal test cases).
  2) Alt, Ctrl, Shift can be toggled and save toggle state by mouse click. Another click turns off toggle state. This behavior make possible to switch language, type shifted symbols only by mouse.
  3) Toggled/pressed keys losing those states when the window loses focus (Alt+Tab).
  4) macOS Caps Lock behavior is handled.
  5) Multiple language support. EN, RU, BY languages are provided. You can copy language file, update it, import in `src/lang/index.js` and everything will work the same way.
  6) Language switch button was added to display current language, it also switch language at mouse click.