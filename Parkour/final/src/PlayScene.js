if(typeof GameStat == "undefined") {
    var GameStat = {};
    GameStat.normal = 0;
    GameStat.over = 1;
};

var PlayLayer = cc.Layer.extend({
    //class member variable
    map:null,
    lastEyeX:0,
    runner:null,
    space:null,// chipmunk space
    recognizer:null,
    dollar:null,
    objectManager:null,
    shapesToRemove:[],
    gameStat:GameStat.normal,
    spriteSheet:null,

    // constructor
    ctor:function () {
        this._super();

        this.init();
    },

    init:function () {
        this._super();

        // objects will keep when new ObjectManager();
        // we need clean here
        this.shapesToRemove = [];

        this.setTag(0);
        this.initPhysics();

        // enable touch
        this.setTouchEnabled(true);
        // set touch mode to kCCTouchesOneByOne
        this.setTouchMode(1);
        
        this.dollar = new DollarRecognizer();
        this.recognizer = new SimpleRecognizer();

        this.map = new Map(this, this.space);

        // create sprite sheet of PlayLayer
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_plist_parkour);
        this.spriteSheet = cc.SpriteBatchNode.create(s_img_parkour);
        this.addChild(this.spriteSheet);

        this.runner = new Runner(this.spriteSheet, this.space);
        // The base class of runner is CC.Node, addChild to make its scheduleOnce() and onExit() be called.
        this.addChild(this.runner);

        this.objectManager = new ObjectManager(this.spriteSheet, this.space);
        this.objectManager.initObjectOfMap(1, this.map.getMapWidth());

        audioEngine.playMusic(s_music_background, true);

        //Schedules the "update" method
        this.scheduleUpdate();
    },

    onTouchBegan:function(touch, event) {
        var pos = touch.getLocation();
        this.recognizer.beginPoint(pos.x, pos.y);
        return true;
    },

    onTouchMoved:function(touch, event) {
        var pos = touch.getLocation();
        this.recognizer.movePoint(pos.x, pos.y);
    },

    onTouchEnded:function(touch, event) {
        var rtn = this.recognizer.endPoint();

        switch (rtn) {
            case "up":
                this.runner.jump();
                break;
            case "down":
                this.runner.crouch();
                break;
            case "not support":
            case "error":
                // try dollar Recognizer
                // 0:Use Golden Section Search (original) 
                // 1:Use Protractor (faster)
                var result = this.dollar.Recognize(this.recognizer.getPoints(), 1);
                cc.log(result.Name);
                if (result.Name == "circle") {
                    this.runner.incredibleHulk();
                }
                break;
        }
    },

    onTouchCancelled:function(touch, event) {
        cc.log("==onTouchCancelled");
    },

    // init space of chipmunk
    initPhysics:function() {
        this.space = new cp.Space();
        // Gravity
        this.space.gravity = cp.v(0, -350);
        // set up Walls
        var wallBottom = new cp.SegmentShape(this.space.staticBody,
                cp.v(0, g_groundHight),// start point
                cp.v(4294967295, g_groundHight),// MAX INT:4294967295
                0);// thickness of wall
        this.space.addStaticShape(wallBottom);
        // setup chipmunk CollisionHandler
        this.space.addCollisionHandler(SpriteTag.runner, SpriteTag.coin,
                this.collisionCoinBegin.bind(this), null, null, null);
        this.space.addCollisionHandler(SpriteTag.runner, SpriteTag.rock,
                this.collisionRockBegin.bind(this), null, null, null);
    },

    collisionCoinBegin:function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.shapesToRemove.push(shapes[1]);

        var statusLayer = this.getParent().getChildByTag(1);
        statusLayer.addCoin(1);

        audioEngine.playEffect(s_music_pickup_coin);
    },

    collisionRockBegin:function (arbiter, space) {
        var rtn = this.runner.meetRock();
        if (rtn == true) {
            this.gameStat = GameStat.over;
            var gameover = new GameOverLayer();
            this.getParent().addChild(gameover);

            audioEngine.stopMusic();
        } else {
            // break Rock
            var shapes = arbiter.getShapes();
            this.shapesToRemove.push(shapes[1]);
        }
    },

    // be called when the runner end it's incredible mode.
    cleanScreen:function () {
        this.objectManager.recycleObjectOfMap(this.map.getCurMap());
    },

    // game logic
    update:function (dt) {
        if (this.gameStat == GameStat.over) {
            return;
        }

        // chipmunk step
        this.space.step(dt);

        // Simulation cpSpaceAddPostStepCallback
        for(var i = 0; i < this.shapesToRemove.length; i++) {
            var shape = this.shapesToRemove[i];
            var obj = this.objectManager.getObjectByShape(shape);
            //TODO add remove animation
            this.objectManager.remove(obj);
        }
        this.shapesToRemove = [];

        // check and reload map
        if (true == this.map.checkAndReload(this.lastEyeX)) {
            this.objectManager.recycleObjectOfMap(this.map.getCurMap() - 1);
            this.objectManager.initObjectOfMap(this.map.getCurMap() + 1, this.map.getMapWidth());
            //level up
            this.runner.levelUp();
        }

        // runner step, to change animation
        this.runner.step(dt);

        // update meter display
        var statusLayer = this.getParent().getChildByTag(1);
        statusLayer.updateMeter(this.runner.getPositionX());

        // move Camera
        this.lastEyeX = this.runner.getPositionX() - this.runner.offsetPx;
        var camera = this.getCamera();
        var eyeZ = cc.Camera.getZEye();
        camera.setEye(this.lastEyeX, 0, eyeZ);
        camera.setCenter(this.lastEyeX, 0, 0);
    }
});

PlayLayer.scene = function () {
    var scene = cc.Scene.create();
    var layer = new PlayLayer();
    scene.addChild(layer);
    var statusLayer = new StatusLayer();
    scene.addChild(statusLayer);
    return scene;
};
