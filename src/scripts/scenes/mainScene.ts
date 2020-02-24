import ExampleObject from '../objects/exampleObject';
import { gameSettings } from "../game";
import Beam from "../objects/beam";
import Explosion from "../objects/explosion";

export default class MainScene extends Phaser.Scene {
  // Don't break encapsulation!!
  private background: Phaser.GameObjects.TileSprite;
  private ground: Phaser.GameObjects.TileSprite;
  private ship1: Phaser.GameObjects.Sprite;
  private ship2: Phaser.GameObjects.Sprite;
  private ship3: Phaser.GameObjects.Sprite;
  private powerUps: Phaser.Physics.Arcade.Group;
  private player: Phaser.Physics.Arcade.Sprite;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private projectiles: Phaser.GameObjects.Group;
  private spacebar: Phaser.Input.Keyboard.Key;
  private enemies: Phaser.Physics.Arcade.Group;
  private scoreLabel: Phaser.GameObjects.BitmapText;
  private score: number;
  private mainTrack: Phaser.Sound.BaseSound;
  private beamSound: Phaser.Sound.BaseSound;
  private cameraOne: Phaser.Cameras.Scene2D.Camera;
  private platforms: Phaser.Physics.Arcade.Group;
  private graphics: Phaser.GameObjects.Graphics;
  private healthBar: Phaser.GameObjects.Image;

  private mapSize: number = 10;
  private groundHeight: number = 130;
  private directionLeft: number = 90;
  private totalHealth: number = 2;
  private damageTaken: number = 0;
  private healthPercentage: number = 100;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Scene Setup
    this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "hell_bg");
    this.background.setOrigin(0, 0);
    this.background.setScrollFactor(0);

    this.ground = this.add.tileSprite(0, 0, this.scale.width, this.groundHeight, "ground_bg");
    this.ground.setOrigin(0, 0);
    this.ground.setScrollFactor(0);
    this.ground.y = 150;

    // Set the length of the map to be the size of the background times 10
    this.physics.world.setBounds(0, 0, this.scale.width * this.mapSize, this.scale.height)
    //*********************************************************************************************************

    // Add the player before the camera
    this.player = this.physics.add.sprite(this.scale.width/2 - 8, this.scale.height - 64, "player");
    this.player.play("thrust");
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.player.setCollideWorldBounds(true);

    this.cameraOne = this.cameras.main; // Set world boundaries
    this.cameraOne.setBounds(0, 0, this.scale.width * this.mapSize, this.scale.height);
    this.cameraOne.startFollow(this.player); // Make the camera follow the player

    this.graphics = this.add.graphics();
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(this.scale.width, 0);
    this.graphics.lineTo(this.scale.width, 20);
    this.graphics.lineTo(0, 20);
    this.graphics.lineTo(0, 0);
    this.graphics.closePath();
    this.graphics.fillPath();
    this.add.text(200, 0, "Will's Game", {
      font: "10px Arial", 
      fill:"cyan"});
    this.add.text(90, 100, "GET TO\nTHE END\n>>>>>>>>", {
      font: "20px Arial",
      bold: true,
      fill:"black"});
    this.score = 0;
    this.scoreLabel = this.add.bitmapText(10, 5, "pixel_font", "SCORE ", 16);
    this.graphics.setScrollFactor(0);
    this.scoreLabel.setScrollFactor(0);

    // Adds a health bar that follows you
    this.healthBar = this.add.image(90, 0, "health_bar");
    this.healthBar.setOrigin(0, 0);
    this.healthBar.setScrollFactor(0);

    this.mainTrack = this.sound.add("doom_audio"); // Main audio
    this.beamSound = this.sound.add("beam_audio");
    let musicConfig = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    }
    this.mainTrack.play(musicConfig);

    this.ship1 = this.add.sprite(this.player.x + 125, this.scale.height/2, "ship");
    this.ship2 = this.add.sprite(this.scale.width/2, this.scale.height/2, "ship2");
    this.ship3 = this.add.sprite(this.scale.width/2 + 50, this.scale.height/2, "ship3");
    this.ship1.angle = this.directionLeft; // Looks like its flying left
    this.ship2.angle = this.directionLeft;
    this.ship3.angle = this.directionLeft;

    this.enemies = this.physics.add.group();
    this.enemies.add(this.ship1);
    this.enemies.add(this.ship2);
    this.enemies.add(this.ship3);
    
    this.ship1.play("ship1_anim");
    this.ship2.play("ship2_anim");
    this.ship3.play("ship3_anim");

    this.ship1.setInteractive();
    this.ship2.setInteractive();
    this.ship3.setInteractive();

    this.input.on("gameobjectdown", this.destroyShip, this)

    this.powerUps = this.physics.add.group();

    let maxObjects: number = 4;
    for (let i = 0; i <= maxObjects; i++) {
      let powerUp = this.physics.add.sprite(16, 16, "power-up");
      this.powerUps.add(powerUp);
      powerUp.setRandomPosition(0, 0, this.scale.width, this.scale.height);
      Math.random() > .5 ? powerUp.play("red") : powerUp.play("gray"); // 50 50 chance for red or gray powerups
      powerUp.setVelocity(100, 100); // Speed of the power-up
      powerUp.setCollideWorldBounds(true); // Confine the power-ups to within the map borders
      powerUp.setBounce(1); // Have the power-ups bounce off the boundaries, higher number mean more bounce
    }

    // Adds spacecbar for shooting laser
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // Puts all projectiles shot from player into group
    this.projectiles = this.add.group();
    // Adds collision between players shots and powerups, causing them to bounce
    this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp) {
      projectile.destroy();
    });
  
    this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, this.giveTrue, this); // For player hitting Powerups
    this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, this.giveTrue, this); // For enemies hitting player
    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, this.giveTrue, this); // For bullets hitting enemy
  }

  giveTrue() { // Becuase the linter won't let me use null
    return true;
  }

  zeroPad(number, size) {
    let stringNumber = String(number);
    while(stringNumber.length < (size || 2)) {
      stringNumber = "0" + stringNumber;
    }
    return stringNumber;
  }

  hitEnemy(projectile, enemy) {
    let explosion = new Explosion(this, enemy.x, enemy.y);

    projectile.destroy();
    this.resetShipPos(enemy);
    this.score += 15;
    let scoreFormated  = this.zeroPad(this.score, 6);
    this.scoreLabel.text = "SCORE " + scoreFormated;
  }

  resetPlayer() {
    let x = this.scale.width/2 - 8;
    let y = this.scale.height;
    this.player.enableBody(true, x, y, true, true);
    this.player.alpha = .5; // Small window of invulnerability

    // Remove invulnerability
    let tween = this.tweens.add({
      targets: this.player,
      y: this.scale.height - 64,
      ease: "Power1",
      duration: 1500, 
      repeat: 0,
      onComplete: () => {
        this.player.alpha = 1; 
      },
      callbackscope: this,
    });
    this.damageTaken = 0; // Reset health
    this.healthBar.setCrop(); // Resets the health bar image
    this.healthPercentage = 100;
  }

  hurtPlayer(player, enemy) {
    this.resetShipPos(enemy);
    let explosion = new Explosion(this, player.x, player.y);
    this.healthPercentage -= 33;
    this.healthBar.setCrop(0, 0, this.healthPercentage, 17); 
    if (this.damageTaken < this.totalHealth) {
      this.damageTaken += 1;
      return
    }

    if (this.player.alpha < 1) {
      return;
    }

    player.disableBody(true, true);
    
    // Wait before respawning player
    this.time.addEvent ({
      delay: 1000,
      callback: this.resetPlayer,
      callbackScope: this,
      loop: false
    });
    return true;
  }

  pickPowerUp(player, powerUp) {
    powerUp.disableBody(true, true);
    return true;
  }

  moveShip(ship, speed) {
    ship.x -= speed;
    if (ship.x < this.player.x - 125) {
      this.resetShipPos(ship);
    }
  }

  resetShipPos(ship) {
    ship.x = this.player.x + 125;
    let randomY = Phaser.Math.Between(20, this.scale.height-40); // Random position from top to ground 
    ship.y = randomY;
  }
  
  destroyShip(pointer, gameObject) {
    gameObject.setTexture("explosion");
    gameObject.play("explode");
  } 

  shootBeam() {
    if (this.player.alpha == 1) { // Ensure player can't shoot while respawning
      this.beamSound.play();
      let beam = new Beam(this);
    }
  }

  update() {
    this.player.setVelocity(0); // Makes sure player stops moving after release of button
    this.background.tilePositionX = this.cameraOne.scrollX * .3;
    this.ground.tilePositionX = this.cameraOne.scrollX;
    this.moveShip(this.ship1, 1);
    this.moveShip(this.ship2, 2);
    this.moveShip(this.ship3, 3);
    this.movePlayerManager();

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      if (this.player.active) {
        this.shootBeam();
      }
    }

    for (let i = 0; i < this.projectiles.getChildren().length; i++) {
      let beam = this.projectiles.getChildren()[i];
      beam.update(this);
    }
  }

  movePlayerManager() {
    if (this.player.alpha == 1) { // Ensure player can't move while respawning
      if (this.cursorKeys.left?.isDown) {
        this.player.angle = -this.directionLeft;
        this.player.setVelocityX(-gameSettings.playerSpeed);
      } else if (this.cursorKeys.right?.isDown) {
        this.player.angle = this.directionLeft;
        this.player.setVelocityX(gameSettings.playerSpeed);
      }

      if (this.cursorKeys.up?.isDown && this.player.y > 20) {
        this.player.setVelocityY(-gameSettings.playerSpeed);
      } else if (this.cursorKeys.down?.isDown && !(this.player.y > 200)) {
        this.player.setVelocityY(gameSettings.playerSpeed);
      }
    }
  }
}
