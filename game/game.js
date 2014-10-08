var game = new Phaser.Game(700, 500, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

var kids;
var world;
var sound = [];
var score = 0;
var bestScore = 50;
var kid = [];
var player;
var bound;
var facing = 'left';
var cursors;
var jumpButton;
var bg;
var displayScore;

function preload() {
    game.load.spritesheet('dude', 'assets/kompot.png', 54, 154);
    game.load.spritesheet('kid', 'assets/kid.png', 27, 46);
    game.load.image('shoes', 'assets/shoes.png');

    game.load.image('nature', 'assets/nature.png');
    game.load.image('chicago', 'assets/chicago.png');

    game.load.audio('main', 'assets/main.ogg');
    game.load.audio('kick', 'assets/kick.ogg');
    game.load.audio('jump', 'assets/jump.ogg');
    game.load.audio('gameOver', 'assets/game_over.ogg');
    game.load.audio('gameStart', 'assets/game_start.ogg');
}

function create() {
    // game world settings
    game.stage.disableVisibilityChange = true;
    game.world.bounds.height = 430;
    game.world.bounds.x = -100; 
    game.world.bounds.width = 5000;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#000000';
    game.physics.arcade.gravity.y = 400;

    // background
    bg = game.add.tileSprite(0, 0, 800, 500, 'chicago');

    // display score
    displayScore = game.add.text(16, 16, '', { font: "18px Curier", fill: "#ffffff", align: "left" });

    // player
    player = game.add.sprite(100, 390, 'dude');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.animations.add('jump_left', [0], 1, false);
    player.animations.add('stand_left', [2], 1, false);
    player.animations.add('run_left', [2, 1], 10, false);
    player.animations.add('jump_right', [5], 1, false);
    player.animations.add('stand_right', [3], 20, false);
    player.animations.add('run_right', [3, 4], 5, false);

    // kids
    kids = game.add.group();
    var distance = game.rnd.integerInRange(500, 1500);
        for (var i = 0; i < 7; i++) {
            if (i == 0) {
                kid[i] = kids.create(700, 390, 'kid');
            } else {
                kid[i] = kids.create(distance+i*200, 390, 'kid');
            }

            game.physics.enable(kid[i], Phaser.Physics.ARCADE);
            kid[i].body.collideWorldBounds = true;
            kid[i].body.velocity.x = game.rnd.integerInRange(-300, -150);
            kid[i].animations.add('run', [0,1]);
            kid[i].play('run', 10, true);
    }


    // controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // shoes (left bound for check collision)
    bound = game.add.sprite(10, 390, 'shoes');
    bound.alpha = 0.7;
    game.physics.enable(bound, Phaser.Physics.ARCADE);
    bound.body.collideWorldBounds = true;

    // sounds
    sound['main'] = game.add.audio('main');
        sound['main'].play('', 0, 0.5, 1);
    sound['kick'] = game.add.audio('kick');
    sound['jump'] = game.add.audio('jump');
    sound['gameOver'] = game.add.audio('gameOver');
    sound['gameStart'] = game.add.audio('gameStart');

    world.stop();
    world.newGame();
    $('.loading').remove();
    $('canvas').css('opacity', 1);

}

// to control the game world
world  = { 
    isStopped: false,
    level: 1,
    popup: null,
    stop: function () {
        this.isStopped = true;
        game.world.alpha = 0.5;

        // hide objects
        player.visible = false;
        kids.forEach(function(kids) {
            kids.x = game.rnd.integerInRange(750, 2900);
            kids.body.velocity.x = 0;       
        });
    }, 

    start: function () {
        world.isStopped = false;
        sound['gameStart'].play();

        // load new background
        if (bg.key == 'chicago') {
            bg.loadTexture('nature');
        } else {
            bg.loadTexture('chicago');
        }

        game.world.alpha = 1;
        player.visible = true;
        bound.x = 10;
        bound.body.velocity.x = 0;
        player.x = 100;
        player.y = 390;
        score = 0;
        kids.forEach(function(kids) {
            kids.body.velocity.x = game.rnd.integerInRange(-300, -150);    
        });

        // update score on screen
        if (score < bestScore) {
            displayScore.text = score + '/' + bestScore + ' (' + (world.level-1) + ' yp.)';
        } else {
            displayScore.text = score + ' (' + (world.level-1) + ' yp.)';
        } 
    },
    newGame: function() {
        var newGamePopup = new Messi('Компот! Школота хочет украсть у тебя тот самый священный ботинок, который несёт справедливость.<br/><br/> Защити ботинок и убей всю школоту, прыгая на неё.<br/><br/>Управление: стрелочки и WASD для перемещения, пробел для прыжка и enter для новой игры.',
            {title: 'Привет, бродяга!', center: true, callback: world.start, width: 450, buttons: [{id: 0, label: 'Я готов!', val: 'X'}]});

    },

    showScore: function() {
        sound['gameOver'].play('', 0, 2.5);
        // update best score
        if (score > bestScore) {
            bestScore = score;
            var title = 'Новый рекорд!';
            var style = 'success';
            var label = 'Перейти на <strong>' + (world.level) + '</strong> уровень!';
            var btnClass = 'btn-success';
            var slevel = world.level;
            world.level++;
        } else {
            var title = 'Школота спиздила ботинок!';
            var style = '';
            var label = 'Попробовать ещё раз';
            var btnClass = '';
            var slevel = world.level;
        }
        var level = ['Настоящий Компот', 'Супер Компот', 'Мега Компот', 'Принц Компот', 'Компот Мудрец', 'Компотище', 'Компот Силач'];
        var rand = Math.floor( Math.random() * level.length );
        this.popup = new Messi('Ты старался, Компот.<br/><br/>Твой счёт: <strong>' + score + '</strong> <img src="kompot_icon.png" alt="" /><br/>Твой лучший счёт: <strong>' + bestScore + '</strong> <img src="kompot_icon.png" alt="" /><br/>Уровень: <strong>' + (slevel-1) + '</strong> (<i>' + level[rand] + '</i>)',
            {title: title, titleClass: style, center: true, callback: world.start, width: 300, buttons: [{id: 0, label: label, val: 'X', class: btnClass}]});
    }
};

function handleCollision(player, kids) {
    if (!player.body.onFloor()) {
        sound['kick'].play();
        kids.x = game.rnd.integerInRange(750, 2000);
        kids.body.velocity.x = game.rnd.integerInRange(-300, -150);
        score += 10;

        //

        // update score on screen
    if (score < bestScore) {
        displayScore.text = score + '/' + bestScore + ' (' + (world.level-1) + ' yp.)';
    } else {
        displayScore.text = score + ' (' + (world.level-1) + ' yp.)';
    } 

    } else {
        kids.body.velocity.x += kids.body.velocity.x/4;
        kids.x -= player.width/1.25;
    }
}

function update() {

    // start new game if score was shown
    if (world.isStopped == true && game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && world.popup != null) {
        world.popup.hide();
        world.start();
    }
    

    player.body.velocity.x = 0;

    // handle collision
    game.physics.arcade.collide(kids, player, handleCollision, null, this);

    // move tile and road
    //bg.tilePosition.x -= 1;
    //road.tilePosition.x -= 2;

    // loss if kid goes beyond the left bound
    game.physics.arcade.collide(kids, bound, function() {
        world.stop();
        world.showScore();
    }, null, this);


    // make player movable
    if ((cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) && player.x > 80)
    {
        player.body.velocity.x = -300;
            facing = 'left';
        
    }
    else if ((cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) && player.x < 600)
    {
        player.body.velocity.x = 100;

            facing = 'right';
        
    }

    if ((jumpButton.isDown || cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) && player.body.onFloor())
    {
        sound['jump'].play();
        player.body.velocity.y = -250;
    }

    //  jump animation
     if (!player.body.onFloor()) {
                player.animations.play('jump_' + facing);
    } else {
        if (player.body.velocity.x != 0) {
                player.animations.play('run_' + facing);       
        } else {
                player.animations.play('stand_' + facing);
        }
    }


}
