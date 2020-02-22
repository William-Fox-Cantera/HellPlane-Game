import 'phaser';
import MainScene from './scenes/mainScene';
import PreloadScene from './scenes/preloadScene';
import GameConfig = Phaser.Types.Core.GameConfig;

export const DEFAULT_WIDTH = 256;
export const DEFAULT_HEIGHT = 272;
export const gameSettings = { // General settings for the game for better organization
    playerSpeed: 200
}

const config: GameConfig = {
    backgroundColor: "#ffffff",
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
    },
    scene: [PreloadScene, MainScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            //gravity: { y: 400 } // Makes player fall
        }
    }
};

window.addEventListener("load", () => {
    window["game"] = new Phaser.Game(config);
});