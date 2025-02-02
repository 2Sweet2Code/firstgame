// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for this game
            debug: false // Enable debug mode (optional)
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let projectiles;
let score = 0;
let scoreText;

function preload() {
    // Load assets
    this.load.spritesheet('player', 'assets/player.png', {
        frameWidth: 32, // Adjust based on your spritesheet
        frameHeight: 32 // Adjust based on your spritesheet
    });
    this.load.image('projectile', 'assets/fireball.png'); // Replace with your projectile image
    this.load.image('tile', 'assets/tile.png');
}

function create() {
    const tileWidth = 128; // Width of each tile
    const tileHeight = 128; // Height of each tile
    const background = this.add.tileSprite(
        0, 
        0, 
        window.innerWidth, 
        window.innerHeight, 
        'tile'
    ).setOrigin(0, 0);

    // Disable texture smoothing globally to keep pixel art sharp
    this.textures.list.player.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Create player
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 100, 'player');
    player.setCollideWorldBounds(true); // Prevent the player from leaving the screen
    player.setScale(6); // Scale up the player

    // Define animations
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
        frameRate: 1,
        repeat: -1
    });

    // Initialize keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Add projectiles group
    projectiles = this.physics.add.group();

    // Spawn projectiles periodically
    this.time.addEvent({
        delay: 1000, // Delay between spawns (in milliseconds)
        callback: spawnProjectile,
        callbackScope: this,
        loop: true
    });

    // Colliders
    this.physics.add.collider(player, projectiles, hitProjectile, null, this);

    // Score system
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
}

function update() {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-200); // Move left
        player.anims.play('run', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200); // Move right
        player.anims.play('run', true);
    } else {
        player.setVelocityX(0); // Stop moving
        player.anims.play('idle', true);
    }

     // Check if projectiles leave the screen
     projectiles.children.iterate((projectile) => {
        if (projectile && projectile.active && projectile.y > window.innerHeight) {
            // Increment score if the projectile exits the screen
            score += 3;
            scoreText.setText('Score: ' + score*37);

            // Destroy the projectile after it leaves the screen
            projectile.destroy();
        }
    });
}

function spawnProjectile() {
    // Create a new projectile at a random x position
    const projectile = projectiles.create(
        Phaser.Math.Between(0, window.innerWidth), // Random x position
        0, // Start at the top of the screen
        'projectile'
    );
    projectile.setVelocityY(200); // Set falling speed
    projectile.setScale(0.1); // Adjust size if needed
}

function hitProjectile(player, projectile) {
    console.log('Game Over!');
    this.scene.restart(); // Restart the game
}