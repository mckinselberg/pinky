export default function setupCursors(_this: Phaser.Scene) {
  const keyboard = _this.input.keyboard;
  const cursors = keyboard ? keyboard.createCursorKeys() : null;
  return cursors;
}