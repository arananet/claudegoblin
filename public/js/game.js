'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────

const GAME_W = 384;
const GAME_H = 216;
const WORLD_W = 3840;
const TILE = 16;
const GROUND_TOP = GAME_H - 48; // y=168, top of ground surface

// Player (matches Godot src/characters/player.gd)
const PLAYER_SPEED = 120;
const JUMP_VEL = -400;
const INVINCIBILITY_MS = 2000;

// Projectile (matches src/items/projectile.gd)
const PROJ_SPEED = 280;
const PROJ_RANGE = 400;

// Enemies
const ZOMBIE_SPEED = 50;
const KNIGHT_SPEED = 60;
const KNIGHT_AMP = 40;
const KNIGHT_FREQ = 2.0;

// Scoring
const ZOMBIE_PTS = 100;
const KNIGHT_PTS = 200;
const WIN_BONUS = 1000;

// ── BootScene ─────────────────────────────────────────────────────────────────

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
        // Background parallax layers
        this.load.image('bg_sky',    'assets/bg/sky.png');
        this.load.image('bg_clouds', 'assets/bg/clouds.png');
        this.load.image('bg_far',    'assets/bg/far.png');
        this.load.image('bg_near',   'assets/bg/near.png');

        // Ground & fill tiles
        this.load.image('tile_gl', 'assets/tiles/ground_left.png');
        this.load.image('tile_gm', 'assets/tiles/ground_mid.png');
        this.load.image('tile_gr', 'assets/tiles/ground_right.png');
        this.load.image('tile_fl', 'assets/tiles/fill_left.png');
        this.load.image('tile_fm', 'assets/tiles/fill_mid.png');
        this.load.image('tile_fr', 'assets/tiles/fill_right.png');

        // Armored player (6 idle, 8 run, 2 jump, 10 attack, 2 fall — all 32x32)
        this.load.spritesheet('char_idle',   'assets/char/idle.png',   { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('char_run',    'assets/char/run.png',    { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('char_jump',   'assets/char/jump.png',   { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('char_attack', 'assets/char/attack.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('char_fall',   'assets/char/fall.png',   { frameWidth: 32, frameHeight: 32 });

        // Unarmored player (no attack sheet)
        this.load.spritesheet('nkd_idle',  'assets/char/nosword/idle.png',  { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('nkd_run',   'assets/char/nosword/run.png',   { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('nkd_jump',  'assets/char/nosword/jump.png',  { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('nkd_fall',  'assets/char/nosword/fall.png',  { frameWidth: 32, frameHeight: 32 });

        // Enemies (6 walk, 7 death — all 32x32)
        this.load.spritesheet('slime_walk',  'assets/slime/walk.png',  { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('slime_death', 'assets/slime/death.png', { frameWidth: 32, frameHeight: 32 });

        // Decor — trees (80×112 each, 7 variants) and rocks (48×32, 4 variants)
        this.load.spritesheet('trees', 'assets/decor/trees.png', { frameWidth: 80, frameHeight: 112 });
        this.load.spritesheet('rocks', 'assets/decor/rocks.png', { frameWidth: 48, frameHeight: 32  });

        // Cave/dungeon tileset — 16×16 tiles, 8 cols × 13 rows
        this.load.spritesheet('tileset', 'assets/tiles/tileset.png', { frameWidth: 16, frameHeight: 16 });

        // Audio (sourced from arananet/claude_jump)
        this.load.audio('bgm',     'music/bgm.mp3');
        this.load.audio('sfx_jump',    'music/jump.wav');
        this.load.audio('sfx_collect', 'music/collect.wav');
        this.load.audio('sfx_die',     'music/die.wav');
    }

    create() {
        const a = this.anims;

        // Armored animations
        a.create({ key: 'armored_idle',   frames: a.generateFrameNumbers('char_idle',   { start: 0, end: 5 }), frameRate: 8,  repeat: -1 });
        a.create({ key: 'armored_run',    frames: a.generateFrameNumbers('char_run',    { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        a.create({ key: 'armored_jump',   frames: a.generateFrameNumbers('char_jump',   { start: 0, end: 1 }), frameRate: 6,  repeat: -1 });
        a.create({ key: 'armored_fall',   frames: a.generateFrameNumbers('char_fall',   { start: 0, end: 1 }), frameRate: 6,  repeat: -1 });
        a.create({ key: 'armored_attack', frames: a.generateFrameNumbers('char_attack', { start: 0, end: 9 }), frameRate: 16, repeat: 0  });

        // Unarmored animations
        a.create({ key: 'naked_idle',  frames: a.generateFrameNumbers('nkd_idle',  { start: 0, end: 5 }), frameRate: 8,  repeat: -1 });
        a.create({ key: 'naked_run',   frames: a.generateFrameNumbers('nkd_run',   { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        a.create({ key: 'naked_jump',  frames: a.generateFrameNumbers('nkd_jump',  { start: 0, end: 1 }), frameRate: 6,  repeat: -1 });
        a.create({ key: 'naked_fall',  frames: a.generateFrameNumbers('nkd_fall',  { start: 0, end: 1 }), frameRate: 6,  repeat: -1 });

        // Enemy animations
        a.create({ key: 'slime_walk',  frames: a.generateFrameNumbers('slime_walk',  { start: 0, end: 5 }), frameRate: 8,  repeat: -1 });
        a.create({ key: 'slime_death', frames: a.generateFrameNumbers('slime_death', { start: 0, end: 6 }), frameRate: 10, repeat: 0  });

        this.scene.start('Title');
    }
}

// ── TitleScene ────────────────────────────────────────────────────────────────

class TitleScene extends Phaser.Scene {
    constructor() { super('Title'); }

    create() {
        this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0d0624);

        // Decorative stars
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, GAME_W);
            const y = Phaser.Math.Between(0, GAME_H * 0.6);
            this.add.rectangle(x, y, 1, 1, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
        }

        this.add.text(GAME_W / 2, 50, 'CLAUDEGOBLIN', {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#ff9933',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(GAME_W / 2, 76, "A Ghost 'n Goblins tribute", {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#888888',
        }).setOrigin(0.5);

        // Claude idle sprite
        this.add.sprite(GAME_W / 2, 130, 'char_idle').play('armored_idle');

        this.add.text(GAME_W / 2, 160, 'CONTROLS', {
            fontSize: '7px', fontFamily: 'monospace', color: '#aaaaaa',
        }).setOrigin(0.5);
        this.add.text(GAME_W / 2, 170, 'ARROWS / WASD  move & jump     Z / X  throw lance', {
            fontSize: '6px', fontFamily: 'monospace', color: '#666666',
        }).setOrigin(0.5);

        const prompt = this.add.text(GAME_W / 2, 195, 'TAP  OR  PRESS ENTER', {
            fontSize: '7px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.tweens.add({ targets: prompt, alpha: 0, duration: 500, yoyo: true, repeat: -1 });

        const start = () => {
            // Request fullscreen on mobile — must happen inside a user gesture
            if (!this.scale.isFullscreen) {
                this.scale.startFullscreen();
            }
            this.scene.start('Game');
        };
        this.input.keyboard.once('keydown-ENTER', start);
        this.input.keyboard.once('keydown-SPACE', start);
        this.input.once('pointerup', start);
    }
}

// ── GameScene ─────────────────────────────────────────────────────────────────

class GameScene extends Phaser.Scene {
    constructor() { super('Game'); }

    create() {
        // ── Game state ──────────────────────────────────────────────────────
        this.armored = true;
        this.lives = 3;
        this.score = 0;
        this.invincible = false;
        this.facingRight = true;
        this.isAttacking = false;
        this.isDead = false;
        this.levelComplete = false;
        this.projectileActive = false;
        this.knights = []; // flying knights (plain sprites, manual physics)
        // touch state — populated each frame by _pollTouchZones()
        this.touch = { left: false, right: false, jumpPending: false, _prevUp: false, _prevAtk: false };

        // ── Procedural textures ─────────────────────────────────────────────
        this._makeTextures();

        // ── World & camera ──────────────────────────────────────────────────
        this.physics.world.setBounds(0, 0, WORLD_W, GAME_H + 200); // extra height for pit falls
        this.cameras.main.setBounds(0, 0, WORLD_W, GAME_H);

        // ── Parallax background (fixed to camera, scroll via tilePositionX) ─
        this.bgSky    = this.add.tileSprite(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 'bg_sky')   .setScrollFactor(0).setDepth(-10);
        this.bgClouds = this.add.tileSprite(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 'bg_clouds').setScrollFactor(0).setDepth(-9);
        this.bgFar    = this.add.tileSprite(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 'bg_far')   .setScrollFactor(0).setDepth(-8);
        this.bgNear   = this.add.tileSprite(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 'bg_near')  .setScrollFactor(0).setDepth(-7);

        // ── Level geometry ──────────────────────────────────────────────────
        this.platforms = this.physics.add.staticGroup();
        this._buildLevel();

        // ── Player ──────────────────────────────────────────────────────────
        this.player = this.physics.add.sprite(100, GROUND_TOP - 32, 'char_idle');
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(980);
        this.player.play('armored_idle');

        this.player.on('animationcomplete-armored_attack', () => {
            this.isAttacking = false;
        });

        // ── Projectiles ─────────────────────────────────────────────────────
        this.projectiles = this.add.group();

        // ── Enemies ─────────────────────────────────────────────────────────
        this.zombies = this.physics.add.group();
        this._spawnEnemies();

        // ── Armor pickup ────────────────────────────────────────────────────
        this._createArmorPickup();

        // ── Physics colliders / overlaps ─────────────────────────────────────
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.zombies, this.platforms);

        this.physics.add.overlap(
            this.projectiles, this.zombies,
            this._onProjHitZombie, null, this
        );

        // ── Camera ──────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.player, true, 0.12, 1);

        // ── HUD ─────────────────────────────────────────────────────────────
        this._createHUD();

        // ── Input ───────────────────────────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // ── Virtual touch controls ───────────────────────────────────────────
        this._createVirtualControls();

        // ── Audio ────────────────────────────────────────────────────────────
        this.sfxJump    = this.sound.add('sfx_jump',    { volume: 0.6 });
        this.sfxCollect = this.sound.add('sfx_collect', { volume: 0.7 });
        this.sfxDie     = this.sound.add('sfx_die',     { volume: 0.8 });
        this.bgm        = this.sound.add('bgm',         { loop: true, volume: 0.4 });
        this.bgm.play();
    }

    // ── Procedural textures ────────────────────────────────────────────────────

    _makeTextures() {
        // Invisible white tile for static physics bodies
        if (!this.textures.exists('white')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, TILE, TILE);
            g.generateTexture('white', TILE, TILE);
            g.destroy();
        }

        // Lance / thrown projectile
        if (!this.textures.exists('lance')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0xffd700, 1);  // gold shaft
            g.fillRect(0, 2, 10, 2);
            g.fillStyle(0xff8800, 1);  // orange tip
            g.fillRect(9, 0, 3, 6);
            g.generateTexture('lance', 12, 6);
            g.destroy();
        }

        // Chest / armor pickup
        if (!this.textures.exists('chest')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0x8b4513, 1);   // brown body
            g.fillRect(0, 2, 16, 11);
            g.fillStyle(0x5c2d00, 1);   // dark lid
            g.fillRect(0, 0, 16, 4);
            g.fillStyle(0xffd700, 1);   // gold latch
            g.fillRect(6, 4, 4, 4);
            g.generateTexture('chest', 16, 13);
            g.destroy();
        }
    }

    // ── Level building ─────────────────────────────────────────────────────────

    _buildLevel() {
        // Ground segments separated by pits the player must jump over
        const segs = [
            { x: 0,    w: 520 },
            { x: 620,  w: 480 },
            { x: 1220, w: 580 },
            { x: 1920, w: 520 },
            { x: 2560, w: 480 },
            { x: 3160, w: 680 },
        ];
        this._groundSegs = segs;

        for (const seg of segs) {
            this._buildGroundSeg(seg.x, seg.w);
        }

        // Dark abyss in each pit gap
        for (let i = 0; i < segs.length - 1; i++) {
            const pitX = segs[i].x + segs[i].w;
            const pitW = segs[i + 1].x - pitX;
            const cx   = pitX + pitW / 2;
            this.add.rectangle(cx, GROUND_TOP + 28, pitW, 60, 0x0a0320).setDepth(1);
            this.add.rectangle(cx, GROUND_TOP + 52, pitW, 8, 0x1a0010, 0.45).setDepth(1);
        }

        // Elevated platforms — positioned to span pits as safe crossing points
        const platDefs = [
            { x:  560, y: 128, tiles: 8 },
            { x: 1060, y: 112, tiles: 6 },
            { x: 1760, y: 128, tiles: 8 },
            { x: 2400, y: 112, tiles: 8 },
            { x: 2980, y: 128, tiles: 6 },
            { x: 3300, y: 112, tiles: 8 },
        ];
        for (const def of platDefs) {
            this._makePlatform(def.x, def.y, def.tiles);
        }

        // Decorations (trees + rocks)
        this._addDecor(segs);

        // Goal flag
        const flagX = WORLD_W - 60;
        this.add.rectangle(flagX, GROUND_TOP - 24, 2, 48, 0xffffff).setDepth(1);
        this.add.triangle(
            flagX + 2, GROUND_TOP - 48,
            flagX + 2, GROUND_TOP - 32,
            flagX + 18, GROUND_TOP - 40,
            0xff4444
        ).setDepth(1);
        this.add.text(flagX - 20, GROUND_TOP - 60, 'GOAL', {
            fontSize: '8px', fontFamily: 'monospace', color: '#ffff00',
        }).setDepth(1);

        this.levelEndX = flagX;
    }

    _buildGroundSeg(segX, segW) {
        const body = this.platforms.create(segX + segW / 2, GROUND_TOP + 24, 'white');
        body.setDisplaySize(segW, 48).setAlpha(0).refreshBody();

        this.add.tileSprite(segX + segW / 2, GROUND_TOP + 8,  segW, TILE, 'tile_gm').setDepth(0);
        this.add.tileSprite(segX + segW / 2, GROUND_TOP + 24, segW, TILE, 'tile_fm').setDepth(0);
        this.add.tileSprite(segX + segW / 2, GROUND_TOP + 40, segW, TILE, 'tile_fm').setDepth(0);
    }

    _addDecor(segs) {
        const inSeg = (x) => segs.some(s => x >= s.x + 12 && x < s.x + s.w - 12);

        // Trees — 7 variants, placed as mid-ground scenery behind player
        const treeXs = [
            70, 250, 420,                       // seg 0
            680, 860, 1040,                     // seg 1
            1280, 1460, 1640, 1770,             // seg 2
            1980, 2160, 2360,                   // seg 3
            2620, 2790, 2980,                   // seg 4
            3220, 3420, 3600, 3760,             // seg 5
        ];
        treeXs.forEach((x, i) => {
            if (!inSeg(x)) return;
            const img = this.add.image(x, GROUND_TOP - 52, 'trees', i % 7);
            img.setScale(0.75).setDepth(-2).setAlpha(0.82);
            const tints = [0xaaddaa, 0x88bb66, 0x99cc88];
            img.setTint(tints[i % 3]);
        });

        // Rocks — 4 variants, placed at ground level as foreground props
        const rockData = [
            [150, 0], [350, 2], [700, 1], [1000, 3],
            [1320, 0], [1600, 2], [2020, 1], [2280, 3],
            [2660, 0], [2900, 2], [3280, 1], [3500, 3], [3720, 0],
        ];
        for (const [x, frame] of rockData) {
            if (!inSeg(x)) continue;
            this.add.image(x, GROUND_TOP - 6, 'rocks', frame).setScale(0.85).setDepth(1);
        }
    }

    _makePlatform(px, py, tileCount) {
        const w = tileCount * TILE;

        // Invisible physics body
        const body = this.platforms.create(px + w / 2, py + TILE / 2, 'white');
        body.setDisplaySize(w, TILE).setAlpha(0).refreshBody();

        // Visual: left cap + middle tiles + right cap
        this.add.image(px + TILE / 2, py + TILE / 2, 'tile_gl').setDepth(0);
        for (let t = 1; t < tileCount - 1; t++) {
            this.add.image(px + t * TILE + TILE / 2, py + TILE / 2, 'tile_gm').setDepth(0);
        }
        if (tileCount > 1) {
            this.add.image(px + (tileCount - 1) * TILE + TILE / 2, py + TILE / 2, 'tile_gr').setDepth(0);
        }
    }

    // ── Enemy spawning ─────────────────────────────────────────────────────────

    _spawnEnemies() {
        const zombieXs = [200, 800, 1500, 2100, 2750, 3450];
        for (const x of zombieXs) {
            const z = this.zombies.create(x, GROUND_TOP - 16, 'slime_walk');
            z.setCollideWorldBounds(true);
            z.body.setGravityY(980);
            z.play('slime_walk');
            z.alive = true;
        }

        // Flying specters — purple, upside-down, larger than ground zombies
        const knightDefs = [
            { x: 900,  y: 80 },
            { x: 2100, y: 70 },
            { x: 3300, y: 90 },
        ];
        for (const def of knightDefs) {
            const k = this.add.sprite(def.x, def.y, 'slime_walk');
            k.play('slime_walk');
            k.setTint(0xcc22ff);  // deep purple
            k.setScale(1.4);
            k.setFlipY(true);     // upside-down bat-like silhouette
            k.alive = true;
            k.startY = def.y;
            k.time = Phaser.Math.FloatBetween(0, Math.PI * 2);
            this.knights.push(k);
        }
    }

    // ── Armor pickup ───────────────────────────────────────────────────────────

    _createArmorPickup() {
        this.armorPickup = this.physics.add.sprite(1500, GROUND_TOP - 8, 'chest');
        this.armorPickup.body.setAllowGravity(false);
        this.armorPickup.body.setImmovable(true);
        this.armorPickup.alive = true;

        // Gentle bob animation
        this.tweens.add({
            targets: this.armorPickup,
            y: GROUND_TOP - 14,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.physics.add.overlap(this.player, this.armorPickup, this._onPickupArmor, null, this);
    }

    // ── HUD ────────────────────────────────────────────────────────────────────

    _createHUD() {
        const style = { fontSize: '8px', fontFamily: 'monospace', color: '#ffffff' };

        this.hudLives = this.add.text(8, 8, '', style).setScrollFactor(0).setDepth(100);
        this.hudScore = this.add.text(GAME_W - 8, 8, '', style)
            .setOrigin(1, 0).setScrollFactor(0).setDepth(100);
        this.hudArmor = this.add.text(8, 19, '', {
            fontSize: '7px', fontFamily: 'monospace', color: '#ff9933',
        }).setScrollFactor(0).setDepth(100);

        this._updateHUD();
    }

    _updateHUD() {
        const hearts = '♥'.repeat(this.lives) + '♡'.repeat(Math.max(0, 3 - this.lives));
        this.hudLives.setText(hearts);
        this.hudScore.setText('SCORE ' + String(this.score).padStart(6, '0'));
        this.hudArmor.setText(this.armored ? 'ARMORED' : '');
    }

    // ── Main update ────────────────────────────────────────────────────────────

    update(time, delta) {
        if (this.isDead || this.levelComplete) return;

        const dt = delta / 1000;

        // Parallax scroll
        const sx = this.cameras.main.scrollX;
        this.bgSky.tilePositionX    = sx * 0.05;
        this.bgClouds.tilePositionX = sx * 0.15;
        this.bgFar.tilePositionX    = sx * 0.35;
        this.bgNear.tilePositionX   = sx * 0.65;

        this._pollTouchZones();
        this._handleMovement();
        this._handleAttackInput();
        this._updateProjectiles();
        this._updateZombies();
        this._updateKnights(dt);
        this._checkPlayerEnemyContact();
        this._checkProjKnightCollisions();

        if (this.player.y > GAME_H + 20) {
            this._pitDeath();
            return;
        }

        if (this.player.x >= this.levelEndX) {
            this._triggerLevelComplete();
        }
    }

    // ── Player movement ────────────────────────────────────────────────────────

    _handleMovement() {
        const onFloor = this.player.body.blocked.down;

        let dir = 0;
        if (this.cursors.left.isDown || this.keyA.isDown || this.touch.left) {
            dir = -1;
            this.facingRight = false;
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.keyD.isDown || this.touch.right) {
            dir = 1;
            this.facingRight = true;
            this.player.setFlipX(false);
        }

        // Ghost 'n Goblins: direction locked mid-air
        if (onFloor) {
            this.player.setVelocityX(dir * PLAYER_SPEED);
        }

        const keyJump =
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keyW) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space);
        const touchJump = this.touch.jumpPending;
        if (touchJump) this.touch.jumpPending = false;

        if ((keyJump || touchJump) && onFloor) {
            this.player.setVelocityY(JUMP_VEL);
            this.sfxJump.play();
        }

        // Animate (skip during armored attack)
        if (!this.isAttacking || !this.armored) {
            this._updatePlayerAnim(onFloor);
        }
    }

    _updatePlayerAnim(onFloor) {
        const prefix = this.armored ? 'armored' : 'naked';
        const vy = this.player.body.velocity.y;
        const vx = Math.abs(this.player.body.velocity.x);

        let key;
        if (!onFloor) {
            key = vy < 0 ? `${prefix}_jump` : `${prefix}_fall`;
        } else if (vx > 1) {
            key = `${prefix}_run`;
        } else {
            key = `${prefix}_idle`;
        }

        if (this.player.anims.currentAnim?.key !== key) {
            this.player.play(key);
        }
    }

    // ── Attack / projectile ────────────────────────────────────────────────────

    _handleAttackInput() {
        const justAttacked =
            Phaser.Input.Keyboard.JustDown(this.keyZ) ||
            Phaser.Input.Keyboard.JustDown(this.keyX);

        if (justAttacked) this._throwProjectile();
    }

    _throwProjectile() {
        if (this.projectileActive) return;

        const dir = this.facingRight ? 1 : -1;
        const ox  = this.facingRight ? 20 : -20;

        const proj = this.physics.add.image(
            this.player.x + ox,
            this.player.y,
            'lance'
        );
        proj.setFlipX(!this.facingRight);
        proj.body.setAllowGravity(false);
        proj.setVelocityX(dir * PROJ_SPEED);
        proj.startX = proj.x;
        proj.isProjectile = true;
        this.projectiles.add(proj);

        this.projectileActive = true;

        // Attack animation (armored only)
        if (this.armored && !this.isAttacking) {
            this.isAttacking = true;
            this.player.play('armored_attack');
        }
    }

    _updateProjectiles() {
        this.projectiles.getChildren().forEach(proj => {
            if (Math.abs(proj.x - proj.startX) >= PROJ_RANGE) {
                this._destroyProjectile(proj);
            }
        });
    }

    _destroyProjectile(proj) {
        proj.destroy();
        this.projectileActive = false;
    }

    // ── Zombie AI ──────────────────────────────────────────────────────────────

    _updateZombies() {
        this.zombies.getChildren().forEach(z => {
            if (!z.alive) return;
            if (z.y > GAME_H + 20) {
                z.alive = false;
                z.body.setEnable(false);
                z.destroy();
                return;
            }
            const dir = this.player.x < z.x ? -1 : 1;
            z.setVelocityX(dir * ZOMBIE_SPEED);
            z.setFlipX(dir < 0);
        });
    }

    // ── Flying knight AI ───────────────────────────────────────────────────────

    _updateKnights(dt) {
        for (const k of this.knights) {
            if (!k.alive) continue;
            k.time += dt;
            const dir = this.player.x < k.x ? -1 : 1;
            k.x += dir * KNIGHT_SPEED * dt;
            k.y  = k.startY + Math.sin(k.time * KNIGHT_FREQ) * KNIGHT_AMP;
            k.setFlipX(dir < 0);
        }
    }

    // ── Collision detection ────────────────────────────────────────────────────

    _checkPlayerEnemyContact() {
        if (this.invincible || this.isDead) return;

        // Zombie contact (physics overlap already set via staticGroup, but
        // zombies are dynamic — check distance manually for simplicity)
        this.zombies.getChildren().forEach(z => {
            if (!z.alive) return;
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x, z.y) < 22) {
                this._playerTakeHit();
            }
        });

        // Knight contact
        for (const k of this.knights) {
            if (!k.alive) continue;
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, k.x, k.y) < 22) {
                this._playerTakeHit();
            }
        }
    }

    _onProjHitZombie(proj, zombie) {
        if (!zombie.alive) return;
        this._killZombie(zombie);
        this._destroyProjectile(proj);
    }

    _checkProjKnightCollisions() {
        const projs = this.projectiles.getChildren();
        for (const k of this.knights) {
            if (!k.alive) continue;
            for (const proj of [...projs]) {
                if (Phaser.Math.Distance.Between(proj.x, proj.y, k.x, k.y) < 20) {
                    this._killKnight(k);
                    this._destroyProjectile(proj);
                    break;
                }
            }
        }
    }

    // ── Kill / hit handlers ────────────────────────────────────────────────────

    _killZombie(zombie) {
        zombie.alive = false;
        zombie.body.setEnable(false);
        zombie.setVelocity(0, 0);
        zombie.play('slime_death');
        zombie.once('animationcomplete', () => zombie.destroy());
        this.score += ZOMBIE_PTS;
        this._updateHUD();
    }

    _killKnight(knight) {
        knight.alive = false;
        knight.play('slime_death');
        knight.once('animationcomplete', () => knight.destroy());
        this.score += KNIGHT_PTS;
        this._updateHUD();
    }

    _onPickupArmor(player, pickup) {
        if (this.armored || !pickup.alive) return;
        pickup.alive = false;
        pickup.destroy();
        this.armored = true;
        this.sfxCollect.play();
        this._updateHUD();
    }

    _playerTakeHit() {
        if (this.invincible || this.isDead) return;

        if (this.armored) {
            // First hit: lose armor, brief invincibility
            this.armored = false;
            this._updateHUD();
            this._startInvincibility();
        } else {
            // Second hit: lose a life
            this.lives--;
            this._updateHUD();
            if (this.lives <= 0) {
                this._gameOver();
            } else {
                this.armored = true;
                this._respawnPlayer();
                this._updateHUD();
                this._startInvincibility();
            }
        }
    }

    _startInvincibility() {
        this.invincible = true;
        this.tweens.add({
            targets: this.player,
            alpha: 0.35,
            duration: 80,
            yoyo: true,
            repeat: 12,
            onComplete: () => {
                this.player.setAlpha(1);
                this.invincible = false;
            },
        });
    }

    _respawnPlayer() {
        this.player.setPosition(80, GROUND_TOP - 32);
        this.player.setVelocity(0, 0);
    }

    _pitDeath() {
        if (this.invincible || this.isDead) return;
        this.player.setVelocity(0, 0);
        this._playerTakeHit();
        if (!this.isDead) {
            this.player.setPosition(80, GROUND_TOP - 32);
            this.player.setVelocity(0, 0);
        }
    }

    // ── Game over / level complete ─────────────────────────────────────────────

    _gameOver() {
        this.isDead = true;
        this.player.setVelocity(0, 0);
        this.bgm.stop();
        this.sfxDie.play();

        this._showOverlay(
            'GAME OVER',
            '#ff3333',
            `SCORE  ${String(this.score).padStart(6, '0')}`,
            'TAP  OR  PRESS ENTER TO RETRY',
            () => this.scene.restart()
        );
    }

    _triggerLevelComplete() {
        this.levelComplete = true;
        this.score += WIN_BONUS;
        this._updateHUD();
        this.bgm.stop();
        this.sfxCollect.play();

        this._showOverlay(
            'LEVEL COMPLETE!',
            '#00ff88',
            `SCORE  ${String(this.score).padStart(6, '0')}   (+${WIN_BONUS} BONUS)`,
            'TAP  OR  PRESS ENTER TO PLAY AGAIN',
            () => this.scene.restart()
        );
    }

    _showOverlay(title, titleColor, body, prompt, onConfirm) {
        // Dim background
        this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.65)
            .setScrollFactor(0).setDepth(190);

        this.add.text(GAME_W / 2, GAME_H / 2 - 30, title, {
            fontSize: '18px', fontFamily: 'monospace',
            color: titleColor,
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.add.text(GAME_W / 2, GAME_H / 2, body, {
            fontSize: '9px', fontFamily: 'monospace', color: '#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        const blink = this.add.text(GAME_W / 2, GAME_H / 2 + 30, prompt, {
            fontSize: '7px', fontFamily: 'monospace', color: '#ffff00',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.tweens.add({ targets: blink, alpha: 0, duration: 500, yoyo: true, repeat: -1 });

        // Delay touch handler to avoid accidental trigger from last tap
        this.time.delayedCall(400, () => {
            this.input.keyboard.once('keydown-ENTER', onConfirm);
            this.input.keyboard.once('keydown-SPACE', onConfirm);
            this.input.once('pointerup', onConfirm);
        });
    }

    // ── Virtual touch controls ─────────────────────────────────────────────────
    //
    // Layout (game coordinates):
    //
    //        [ ▲ UP  ]          — x:17–51, y:173–200 (visual); zone x:0–102
    //   [◄ LEFT][► RIGHT]       — LEFT x:0–34, RIGHT x:68–102, y:200–227
    //                  [Z ATK]  — x:GAME_W-57 to GAME_W, y:183–217
    //
    // Input is read by _pollTouchZones() every frame — no event handlers
    // for movement/jump, so multi-touch diagonal movement always works.

    _createVirtualControls() {
        const D     = 150;
        const ALPHA = 0.50;
        const BW    = 34;
        const BH    = 27;
        const LBL   = { fontSize: '13px', fontFamily: 'monospace', color: '#ffffff' };

        // D-pad positions: LEFT center=17, RIGHT center=85, UP center=51
        // (CX=51 so LEFT's left edge is at x=0, fully on-screen)
        const CX    = 51;
        const ROW_Y = 204;
        const UP_Y  = ROW_Y - BH;  // 177

        const makePad = (x, y, w, h, label) => {
            const bg = this.add.rectangle(x, y, w, h, 0x111111, ALPHA).setScrollFactor(0).setDepth(D);
            this.add.rectangle(x, y, w + 2, h + 2, 0x000000, 0.55).setScrollFactor(0).setDepth(D - 1);
            this.add.text(x, y, label, LBL).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
            return bg;
        };

        this._btnUp    = makePad(CX,          UP_Y,  BW,      BH, '▲');
        this._btnLeft  = makePad(CX - BW,     ROW_Y, BW,      BH, '◄');
        this._btnRight = makePad(CX + BW,     ROW_Y, BW,      BH, '►');
        this._btnAtk   = makePad(GAME_W - 30, ROW_Y, BW + 20, BH + 7, 'Z');
    }

    // ── Zone-based multi-touch polling ─────────────────────────────────────────
    //
    // Reading pointer positions each frame (instead of event callbacks) means
    // any combination of fingers — including diagonal jump — is handled correctly.

    _pollTouchZones() {
        const CX    = 51;
        const BW    = 34;
        const ROW_Y = 204;
        const UP_Y  = ROW_Y - BW;   // 170

        // Touch detection zones (slightly larger than visuals for usability)
        const Z = {
            left:  { x1: 0,             y1: ROW_Y - BW/2, x2: CX,             y2: GAME_H },
            right: { x1: CX + BW/2,     y1: ROW_Y - BW/2, x2: CX + BW*2,      y2: GAME_H },
            up:    { x1: 0,             y1: UP_Y  - BW/2, x2: CX + BW*2,      y2: ROW_Y - BW/2 },
            atk:   { x1: GAME_W - 60,  y1: GAME_H - 50,  x2: GAME_W,          y2: GAME_H },
        };

        const hit = (px, py, z) => px >= z.x1 && px <= z.x2 && py >= z.y1 && py <= z.y2;

        let left = false, right = false, up = false, atk = false;
        for (const ptr of this.input.manager.pointers) {
            if (!ptr.isDown) continue;
            if (hit(ptr.x, ptr.y, Z.left))  left  = true;
            if (hit(ptr.x, ptr.y, Z.right)) right = true;
            if (hit(ptr.x, ptr.y, Z.up))    up    = true;
            if (hit(ptr.x, ptr.y, Z.atk))   atk   = true;
        }

        this.touch.left  = left;
        this.touch.right = right;

        // Jump: rising-edge only (one jump per press)
        if (up && !this.touch._prevUp) this.touch.jumpPending = true;
        this.touch._prevUp = up;

        // Attack: rising-edge only
        if (atk && !this.touch._prevAtk) this._throwProjectile();
        this.touch._prevAtk = atk;

        // Visual feedback
        if (this._btnLeft)  this._btnLeft.setAlpha(left  ? 0.9 : 0.5);
        if (this._btnRight) this._btnRight.setAlpha(right ? 0.9 : 0.5);
        if (this._btnUp)    this._btnUp.setAlpha(up    ? 0.9 : 0.5);
        if (this._btnAtk)   this._btnAtk.setAlpha(atk   ? 0.9 : 0.5);
    }
}

// ── Phaser game config ────────────────────────────────────────────────────────

new Phaser.Game({
    type: Phaser.AUTO,
    pixelArt: true,
    backgroundColor: '#0d0624',
    scale: {
        parent: 'game-container',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_W,
        height: GAME_H,
    },
    input: {
        activePointers: 4, // support multi-touch for simultaneous button presses
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // applied per-body so knights stay airborne
            debug: false,
        },
    },
    scene: [BootScene, TitleScene, GameScene],
});
