function handleplayerIsHiding(_this, player, trees, playerIsHiding) {
  const overlap = _this.physics.overlap(player, trees);
  playerIsHiding.value = overlap;
}

export default handleplayerIsHiding;