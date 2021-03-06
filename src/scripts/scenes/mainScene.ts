import ExampleObject from '../objects/exampleObject';
import { gameSettings } from "../game";
import Beam from "../objects/beam";
import Explosion from "../objects/explosion";

export default class MainScene extends Phaser.Scene {
  // Don't break encapsulation
  // Onscreen Attributes
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
  private mainTrack: Phaser.Sound.BaseSound;
  private beamSound: Phaser.Sound.BaseSound;
  private cameraOne: Phaser.Cameras.Scene2D.Camera;
  private graphics: Phaser.GameObjects.Graphics;
  private healthBar: Phaser.GameObjects.Image;
  private victoryTrack: Phaser.Sound.BaseSound;
  private city_background: Phaser.GameObjects.TileSprite;
  private confetti: Phaser.GameObjects.Sprite;
  private explosionSound: Phaser.Sound.BaseSound;

  // Game Attributes
  private score: number;
  private mapSize: number = 7;
  private directionLeft: number = 90;
  private totalHealth: number = 2;
  private damageTaken: number = 0;
  private healthPercentage: number = 100;
  private heightAboveGround: number = 60;
  private playExplosion: boolean = false;

  /**
   * constructor, this is the constructor, calls super for extending the Phaser.Scene
   *              class.
   * 
   * Consumes: Nothing
   * Produces: Nothing
   */
  constructor() {
    super({ 
      key: 'MainScene' 
    });
  }

  create() {
    // Scene Setup
    this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "hell_bg");
    this.background.setOrigin(0, 0);
    this.background.setScrollFactor(0);

    this.city_background = this.add.tileSprite(0, 0, this.scale.width, 100, "city_bg");
    this.city_background.setOrigin(0, 0);
    this.city_background.setScrollFactor(0);
    this.city_background.y = 150;

    this.ground = this.add.tileSprite(0, 0, this.scale.width, 130, "ground_bg");
    this.ground.setOrigin(0, 0);
    this.ground.setScrollFactor(0);
    this.ground.y = 150;

    // Set the length of the map to be the size of the background times 10
    this.physics.world.setBounds(0, 20, this.scale.width * this.mapSize, this.scale.height-this.heightAboveGround);
    //*********************************************************************************************************

    // Add the player before the camera
    this.player = this.physics.add.sprite(this.scale.width/2 - 8, this.scale.height - 64, "player");
    this.player.play("thrust");
    this.cursorKeys = this.input.keyboard.createCursorKeys(); // Setup arrow keys
    this.player.setCollideWorldBounds(true); // Player collides with top bottom left right borders

    this.cameraOne = this.cameras.main; // Initalize camera
    this.cameraOne.setBounds(0, 0, this.scale.width * this.mapSize, this.scale.height);
    this.cameraOne.startFollow(this.player); // Make the camera follow the player

    // This whole block is for adding a black box at the top of the screen
    this.graphics = this.add.graphics();
    this.graphics.fillStyle(0x000000, 1); // Black
    this.graphics.beginPath();
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(this.scale.width, 0);
    this.graphics.lineTo(this.scale.width, 20);
    this.graphics.lineTo(0, 20);
    this.graphics.lineTo(0, 0);
    this.graphics.closePath();
    this.graphics.fillPath();
    this.add.text(200, 0, "Will's Game", { // Adding some stationery text to the box
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

    // Adds a health bar to the top of the screen that follows the camera
    this.healthBar = this.add.image(90, 0, "health_bar");
    this.healthBar.setOrigin(0, 0);
    this.healthBar.setScrollFactor(0);

    // All audio is loaded in here
    this.mainTrack = this.sound.add("doom_audio"); // Main audio
    this.beamSound = this.sound.add("beam_audio"); // Laser sound effect
    this.victoryTrack = this.sound.add("victory_song"); // Victory song when at end
    this.explosionSound = this.sound.add("explosion_sound"); // Explosion sound for ending
    let musicConfig = { // Attributes for the main song that plays 
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    }
    this.mainTrack.play(musicConfig);

    // Adding in the three ship enemies and making them point towards the player
    this.ship1 = this.add.sprite(this.player.x + 125, this.scale.height/2, "ship");
    this.ship2 = this.add.sprite(this.scale.width/2, this.scale.height/2, "ship2");
    this.ship3 = this.add.sprite(this.scale.width/2 + 50, this.scale.height/2, "ship3");
    this.ship1.angle = this.directionLeft; // Looks like its flying left
    this.ship2.angle = this.directionLeft;
    this.ship3.angle = this.directionLeft;

    // Putting the enemies in a physics group for easier manipulation
    this.enemies = this.physics.add.group();
    this.enemies.add(this.ship1);
    this.enemies.add(this.ship2);
    this.enemies.add(this.ship3);
    
    // Plays the enemy ships jet animations
    this.ship1.play("ship1_anim");
    this.ship2.play("ship2_anim");
    this.ship3.play("ship3_anim");

    // Allows player to click on enemy ships to destroy them
    this.ship1.setInteractive();
    this.ship2.setInteractive();
    this.ship3.setInteractive();
    this.input.on("gameobjectdown", this.destroyShip, this)

    // Putting the power-up objects in a group for easier manipulation
    this.powerUps = this.physics.add.group();

    // Putting power-ups in the game at random locations
    let maxObjects: number = 4; // How many power-ups you want in the game
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
    
    // For handling collisions with the player, enemies, and projectiles
    this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, this.giveTrue, this); // For player hitting Powerups
    this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, this.giveTrue, this); // For enemies hitting player
    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, this.giveTrue, this); // For bullets hitting enemy
  }

  /**
   * giveTrue, the overlap methods need as an argument a method that returns a
   *           boolean, preferably a true one. So this methods just returns true.
   * 
   * Consumes: Nothing;
   * Produces: A boolean; 
   * Leaf-Function? Yes
   */
  giveTrue(): boolean {
    return true;
  }

  /**
   * zeroPad, makes a string of zero's. This string is added to based on the score
   *          the player cucrrently has. This method updates the string in accordance
   *          to the score. 
   * 
   * Consumes: A number, A String;
   * Produces: A string;
   * Leaf-Function? Yes
   */
  zeroPad(number, size): String {
    let stringNumber = String(number); // Cast the score to String
    while(stringNumber.length < (size || 2)) {
      stringNumber = "0" + stringNumber; // Replace the "0" Strings with the score while there is space
    }
    return stringNumber;
  }

  /**
   * hitEnemy, if an enemy ship is hit by a projectile, the projectile is destroyed,
   *           an explosion animation is generated, the score is updated, and the 
   *           enemy ship is reset by the resetShipPos method.
   * 
   * Consumes: A projectile (group), An enemy (sprite);
   * Produces: Nothing;
   * Leaf-Function? No
   */
  hitEnemy(projectile, enemy): void {
    let explosion = new Explosion(this, enemy.x, enemy.y);
    projectile.destroy(); // Get rid of projectile object on collision
    this.resetShipPos(enemy); // Reset enemy ship
    this.score += 15; // Update score
    let scoreFormated  = this.zeroPad(this.score, 6);
    this.scoreLabel.text = "SCORE " + scoreFormated;
  }

 /**
  * resetPlayer, if the player collides with an enemy ship, the player initially 
  *              loses health. If the health bar reaches zero, the players position
  *              is reset back to the beginning of the map, the players health is 
  *              reset, and a tween is played making the players alpha value decrease
  *              and making the player unable to move or shoot while an animation of 
  *              being respawned is played.
  * 
  * Consumes: Nothing;
  * Produces: Nothing;
  * Leaf-Function? Yes
  */
  resetPlayer(): void {
    let x = this.scale.width/2 - 8;
    let y = this.scale.height;
    this.player.enableBody(true, x, y, true, true);
    this.player.alpha = .5; // Small window of invulnerability
    let tween = this.tweens.add({ // Animation for respawning player
      targets: this.player,
      y: this.scale.height - 120,
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

  /**
   * hurtPlayer, if a player still has health, the health is decreased and an explosion 
   *             is generated. If the player is out of health, the players actions are 
   *             disabled and the player is reset to the start of the map with the help
   *             of the resetPlayer method.
   * 
   * Consumes: A player (sprite), An enemy (sprite);
   * Produces: Nothing;
   * Leaf-Function? No
   */
  hurtPlayer(player, enemy): void {
    this.resetShipPos(enemy);
    if (player.alpha == 1) { // If player has health remaining
      let explosion = new Explosion(this, player.x, player.y);
      this.healthPercentage -= 33;
      this.healthBar.setCrop(0, 0, this.healthPercentage, 17); 
      if (this.damageTaken < this.totalHealth) { // Else, reset to beginning
        this.damageTaken += 1;
        return
      }
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
  }

  /**
   * pickPowerUp, This method makes the power-up objects go away when collided with
   * 
   * Consumes: A player (sprite), A power-up (object);
   * Produces: A boolean;
   * Leaf-Function? Yes
   */
  pickPowerUp(player, powerUp): boolean {
    powerUp.disableBody(true, true);
    return true;
  }

  /**
   * moveShip, updates the enemy ships x position as they only move from left
   *           to right. If the ship goes to far past the players x position,
   *           its x position is reset by the resetShipPos method.
   * 
   * Consumes: A ship (sprite), A number;
   * Produces: Nothing;
   * Leaf-Function? No
   */
  moveShip(ship, speed): void {
    ship.x -= speed;
    if (ship.x < this.player.x - 125) {
      this.resetShipPos(ship);
    }
  }

  /**
   * resetShipPos, resets the enemy ship positions to a random y coordinate within
   *               the map boundaries and an x coordinate at a fixed location ahead
   *               of the players x coordinate.
   * 
   * Consumes: A ship (sprite);
   * Produces: Nothing;
   * Leaf-Function? Yes
   */
  resetShipPos(ship): void {
    ship.x = this.player.x + 125;
    let randomY = Phaser.Math.Between(20, this.scale.height-this.heightAboveGround); // Random position from top to ground 
    ship.y = randomY;
  }
  
  /**
   * destroyShip, if the player clicks on an enemy ship with the cursor, that 
   *              enemy ship is blown up and destroyed.
   * 
   * Consumes: A cursor, A ship (sprite);
   * Produces: Nothing;
   * Leaf-Function? Yes
   */
  destroyShip(pointer, ship): void {
    ship.setTexture("explosion");
    ship.play("explode");
  } 

  /**
   * shotBeam, if the players alpha is one (not respawning), this method plays the
   *           beam shooting sound and generates a beam object in game.
   * 
   * Consumes: Nothing;
   * Produces: Nothing;
   * Leaf-Function? Yes
   */
  shootBeam(): void {
    if (this.player.alpha == 1) { // Ensure player can't shoot while respawning
      this.beamSound.play();
      let beam = new Beam(this);
    }
  }

  /**
   * playEnding, When the player gets to the end of the map, the main music stops,
   *             all enemies are removed from the game, a confetti animation starts
   *             playing, victory text is displayed, and victory music starts playing.
   *             When the victory music stops, The confetti dissapears and the players 
   *             blows up with a very loud explosion sound.
   * 
   * Consumes: Nothing;
   * Produces: Nothing;
   * Leaf-Function? No
   */
  playEnding(): void { // Stops the main music, destroys enemies, and plays the victory song
    if (this.player.x >= (this.scale.width * this.mapSize-100) && this.mainTrack.isPlaying) {
      this.mainTrack.stop();
      this.victoryTrack.play(); // Final Fantasy victory song
      this.enemies.clear(true, true);
      this.add.text(this.player.x-100, this.player.y, "WINNER!!11!1!!1", {
        font: "20px Arial",
        bold: true,
        fill:"darkblue"});
      this.confetti = this.add.sprite(this.scale.width*this.mapSize-130, (this.scale.height/2)+125, "confetti");
      this.confetti.play("confetti_anim");
      this.playExplosion = true;
    }
    if (!this.victoryTrack.isPlaying && this.playExplosion) {
      let explosionConfig = { // Make the explosion very loud
        mute: false,
        volume: 10, // I SAID LOUD
        rate: 1,
        detune: 0,
        seek: 0,
        loop: false,
        delay: 0
      }
      this.confetti.destroy();
      this.explosionSound.play(explosionConfig);
      this.player.setTexture("explosion");
      this.player.play("explode");
      this.player.disableInteractive; // THE END
      this.playExplosion = false;
    }
  }

  /**
   * update, main game loop responsible for reading player input and moving enemy ships
   *         as well as making sure sub classes like the beam class and its movement is
   *         handled.
   * 
   * Consumes: Nothing;
   * Produces: Nothing;
   * Leaf-Function? No
   */
  update(): void {
    this.player.setVelocity(0); // Makes sure player stops moving after release of button
    this.background.tilePositionX = this.cameraOne.scrollX * .3;
    this.city_background.tilePositionX = this.cameraOne.scrollX * .6;
    this.ground.tilePositionX = this.cameraOne.scrollX;
    this.moveShip(this.ship1, 1);
    this.moveShip(this.ship2, 2);
    this.moveShip(this.ship3, 3);
    this.movePlayerManager();
    for (let i = 0; i < this.projectiles.getChildren().length; i++) {
      let beam = this.projectiles.getChildren()[i];
      beam.update(this);
    }
    this.playEnding();
  }

  /**
   * movePLayerManager, interprets player movement input. If the up, down, left,
   *                    or right arrow keys are pressed, the player moves in the 
   *                    respective direction. If the space bar is pressed, a new
   *                    beam projectile is shot.
   * 
   * Consumes: Nothing;
   * Produces: Nothing;
   * Leaf-Function? No
   */
  movePlayerManager(): void {
    if (this.player.alpha == 1) { // Ensure player can't move while respawning
      if (this.cursorKeys.left?.isDown) {
        this.player.angle = -this.directionLeft;
        this.player.setVelocityX(-gameSettings.playerSpeed);
      } else if (this.cursorKeys.right?.isDown) {
        this.player.angle = this.directionLeft;
        this.player.setVelocityX(gameSettings.playerSpeed);
      }
      if (this.cursorKeys.up?.isDown) {
        this.player.setVelocityY(-gameSettings.playerSpeed);
      } else if (this.cursorKeys.down?.isDown) {
        this.player.setVelocityY(gameSettings.playerSpeed);
      }
      // For shooting
      if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        if (this.player.active) {
          this.shootBeam();
        }
      }
    }
  }
}
