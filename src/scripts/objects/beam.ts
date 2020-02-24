export default class Beam extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;

    constructor (scene) {
        let x = scene.player.x;
        let y = scene.player.y; 
        super(scene, x, y, "laser_beam");
        scene.add.existing(this);

        scene.physics.world.enableBody(this);
        this.body.velocity.x = scene.player.angle == 90 ? 500 : -500; // For shooting left and right
        scene.projectiles.add(this); 
    }

    update(scene) { // Destroy the beams after they have traveled a 125 pixels (x direction) from the players location
        if ((this.body.x > scene.player.x + 125) || (this.body.x < scene.player.x - 125)) {
            this.destroy();
        }
    }
}