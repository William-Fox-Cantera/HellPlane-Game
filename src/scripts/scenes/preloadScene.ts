export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.load.image("hell_bg", "assets/images/hell.png");
    this.load.image("ground_bg", "assets/images/ground.png")
    this.load.image("laser_beam", "assets/images/laser.png")
    this.load.image("health_bar", "assets/images/healthBar.png")
    this.load.image("city_bg", "assets/images/fireCity.png")

    this.load.spritesheet("ship", "assets/spritesheets/ship.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("ship2", "assets/spritesheets/ship2.png", {
      frameWidth: 32,
      frameHeight: 16
    });
    this.load.spritesheet("ship3", "assets/spritesheets/ship3.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("power-up", "assets/spritesheets/power-up.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("player", "assets/spritesheets/player.png", {
      frameWidth: 16,
      frameHeight: 24 
    });
    this.load.spritesheet("beam", "assets/spritesheets/beam.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("confetti", "assets/spritesheets/confetti.png", {
      frameWidth: 800,
      frameHeight: 800
    });

    this.load.bitmapFont("pixel_font", "assets/font/font.png", "assets/font/font.xml");
    this.load.audio("doom_audio", "assets/audio/TheOnlyThingTheyFearIsYou.mp3");
    this.load.audio("beam_audio", "assets/audio/beam.mp3");
    this.load.audio("victory_song", "assets/audio/victory.mp3")
    this.load.audio("explosion_sound", "assets/audio/explosionSound.mp3")
  }

  create() {
    this.scene.start('MainScene'); // Start the main scene
    // Animations for onscreen objects
    this.anims.create({
      key: "ship1_anim",
      frames: this.anims.generateFrameNumbers("ship", { start: 0, end: 1 }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "ship2_anim",
      frames: this.anims.generateFrameNumbers("ship2", { start: 0, end: 1 }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "ship3_anim",
      frames: this.anims.generateFrameNumbers("ship3", { start: 0, end: 1 }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion" , { start: 0, end: 4 }),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true
    });
    this.anims.create({
      key: "red",
      frames: this.anims.generateFrameNumbers("power-up", { start: 0, end: 1 }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "gray",
      frames: this.anims.generateFrameNumbers("power-up", { start: 2, end: 3 }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "thrust",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "beam_anim",
      frames: this.anims.generateFrameNumbers("beam", { start: 0, end: 1 }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "confetti_anim",
      frames: this.anims.generateFrameNumbers("confetti", { start: 0, end: 47 }),
      frameRate: 10,
      repeat: -1
    });
  }
}
