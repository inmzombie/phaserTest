var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'resources/assets/sky.png');
    game.load.image('ground', 'resources/assets/platform.png');
    game.load.image('star', 'resources/assets/star.png');
    game.load.spritesheet('dude', 'resources/assets/dude.png', 32, 48);
}
var extend = function (sub, base) {
    for (var property in base) {
        if (base.hasOwnProperty(property)) {
            sub[property] = base[property];
        }
    }

    var Proxy = function () {};
    Proxy.prototype = base.prototype;
    sub.prototype = new Proxy();
    sub.prototype.constructor = sub;
    sub.base = base.prototype;
};

var Platforms = function(game) {
    this.__proto__ = game.add.group();
    this.__proto__.enableBody = true;
    var selfContext = this;
    this.addElements = function(elements) {
        return (elements.constructor !== Array)||elements.forEach(this.constructElement);
    }
    this.constructElement = function(element) {
        obejectElement = selfContext.__proto__.create(element.width, element.height, element.name);
        element.scale?obejectElement.scale.setTo(element.scale.x, element.scale.y):'';
        element.immovable?obejectElement.body.immovable=element.immovable:'';
    }
}
var PlayerBuild = function(game) {
    this.spriteObject = game.add.sprite(32, game.world.height - 150, 'dude');
    this.applyConfig = function(playerConfig) {
        this.spriteObject.body.bounce.y = playerConfig.body.bounce.y;
        this.spriteObject.body.gravity.y = playerConfig.body.gravity.y;
        this.spriteObject.body.collideWorldBounds = playerConfig.body.collideWorldBounds;
        this.addAnimations(playerConfig.animations);
    }
    this.addAnimations = function(animations) {
        animations.forEach(this.addAnimation.bind(this));
    }
    this.addAnimation = function(animation) {
        this.spriteObject.animations.add(animation.name, animation.frames, animation.frameRate, animation.loop);
    }
    this.left = function() {
        this.spriteObject.body.velocity.x = -150;
        this.spriteObject.animations.play('left');
    }
    this.right = function() {
        this.spriteObject.body.velocity.x = 150;
        this.spriteObject.animations.play('right');
    }
    this.stop = function() {
        this.spriteObject.animations.stop();
        this.spriteObject.frame = 4;
    }
    this.jump = function() {
        this.spriteObject.body.velocity.y = -350;
    }
}

var platforms;
var playerBuild;
var cursors;

function create() {
    var elements = [
    {width: 0, height: game.world.height-64, name: 'ground', immovable: true, scale: {x: 2, y: 2}},
    {width: 400, height: 400, name: 'ground', immovable: true},
    {width: -150, height: 250, name: 'ground', immovable: true}
    ];
    var playerConfig = {
        body: {
            bounce: {
                y: 0.2,
            },
            gravity: {
                y: 300
            },
            collideWorldBounds: true
            },
        animations:[
                {name: 'left', frames:[0,1,2,3], frameRate:10, loop: true},
                {name: 'right', frames:[5,6,7,8], frameRate:10, loop: true}]
        };
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0, 0, 'sky');
    platforms = new Platforms(game);
    platforms.addElements(elements);
    playerBuild = new PlayerBuild(game);
    game.physics.arcade.enable(playerBuild.spriteObject);
    playerBuild.applyConfig(playerConfig);
    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    game.physics.arcade.collide(playerBuild.spriteObject, platforms);
    if (cursors.left.isDown) {
        playerBuild.left();
    } else if (cursors.right.isDown) {
        playerBuild.right();
    } else {
        playerBuild.stop();
    }
    if (cursors.up.isDown && playerBuild.spriteObject.body.touching.down) {
        playerBuild.jump();
    }
}
