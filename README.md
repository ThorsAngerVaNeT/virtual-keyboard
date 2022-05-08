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
  1) that If you run ESLint check in my repo at your computer and `Expected linebreaks to be LF but found CRLF linebreak-style` errors appear, it's your git have wrong `autocrlf` setting and it's your git replaces all LF in my sources to CRLF.
  2) Right Alt (AltGraph) simultaneously triggers events for right Alt and left Ctrl when your system keyboard layout is  RU. It's normal behavior.

## Additional features
  1) Arrow behavior switcher:
    - arrow keys insert arrow symbols by default;
    - arrow keys navigate caret when arrow switcher enabled (yes, it's not perfect, but works well in normal test cases).
  2) Alt, Ctrl, Shift can be toggled and save toggled state by clicking mouse. Another click turn off toggled state. This behavior make possible to switch language, type shifted symbols only by mouse.
  3) Toggled/pressed keys loosing those states when window loosing focus (Alt+Tab).
  4) macOS Caps Lock handling.