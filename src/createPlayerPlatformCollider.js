const createPlayerPlatformCollider = (_this, player, platforms) => {
  _this.physics.add.collider(player, platforms);
}

export default createPlayerPlatformCollider;