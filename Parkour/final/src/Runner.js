// define enum for runner status

if(typeof RunnerStat == "undefined") {
    var RunnerStat = {};
    RunnerStat.running = 0;
    RunnerStat.jumpUp = 1;
    RunnerStat.jumpDown = 2;
    RunnerStat.crouch = 3;
    RunnerStat.incredible = 4;
};

// runner class
var Runner = cc.Node.extend({
    sprite:null,
    runningSize:null,
    crouchSize:null,
    space:null,
    body:null,// current chipmunk body
    shape:null,// current chipmunk shape
    stat:RunnerStat.running,// init with running status
    runningAction:null,
    jumpUpAction:null,
    jumpDownAction:null,
    crouchAction:null,
    spriteSheet:null,
    _emitter:null,
    get offsetPx() {return 100;},

    /** Constructor
     * @param {cc.SpriteBatchNode *}
     * @param {cp.Space *}
     */
    ctor:function (spriteSheet, space) {
        this._super();

        this.spriteSheet = spriteSheet;
        this.space = space;
        this.init();
    },

    init:function () {
        this._super();

        this.sprite = cc.PhysicsSprite.createWithSpriteFrameName("runner0.png");
        this.runningSize = this.sprite.getContentSize();

        // init crouchSize
        var tmpSprite = cc.PhysicsSprite.createWithSpriteFrameName("runnerCrouch0.png");
        this.crouchSize = tmpSprite.getContentSize();

        this.initAction();
        this.initBody();
        // start with running shape
        this.initShape("running");

        this.sprite.setBody(this.body);
        this.sprite.runAction(this.runningAction);
        this.spriteSheet.addChild(this.sprite, 1);
        this.stat = RunnerStat.running;
    },

    onExit:function() {
        this.runningAction.release();
        this.jumpUpAction.release();
        this.jumpDownAction.release();
        this.crouchAction.release();
        
        this._super();
    },

    initAction:function () {
        // init runningAction
        var animFrames = [];
        // num equal to spriteSheet
        for (var i = 0; i < 8; i++) {
            var str = "runner" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.create(animFrames, 0.1);
        this.runningAction = cc.RepeatForever.create(cc.Animate.create(animation));
        this.runningAction.retain();
        
        // init jumpUpAction
        animFrames = [];
        for (var i = 0; i < 4; i++) {
            var str = "runnerJumpUp" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.create(animFrames, 0.2);
        this.jumpUpAction = cc.Animate.create(animation);
        this.jumpUpAction.retain();

        // init jumpDownAction
        animFrames = [];
        for (var i = 0; i < 2; i++) {
            var str = "runnerJumpDown" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.create(animFrames, 0.3);
        this.jumpDownAction = cc.Animate.create(animation);
        this.jumpDownAction.retain();

        // init crouchAction
        animFrames = [];
        for (var i = 0; i < 1; i++) {
            var str = "runnerCrouch" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.create(animFrames, 0.3);
        this.crouchAction = cc.Animate.create(animation);
        this.crouchAction.retain();
    },

    initBody:function () {
        // create chipmunk body
        this.body = new cp.Body(1, cp.momentForBox(1,
                    this.runningSize.width, this.runningSize.height));
        this.body.p = cc.p(this.offsetPx, g_groundHight + this.runningSize.height / 2);
        this.body.applyImpulse(cp.v(150, 0), cp.v(0, 0));
        this.space.addBody(this.body);
    },

    levelUp:function () {
        // run faster
        this.body.applyImpulse(cp.v(10, 0), cp.v(0, 0));
    },

    initShape:function (type) {
        if (this.shape) {
            this.space.removeShape(this.shape);
        }
        if (type == "running") {
            this.shape = new cp.BoxShape(this.body,
                    this.runningSize.width - 14, this.runningSize.height);
        } else {
            // crouch
            this.shape = new cp.BoxShape(this.body,
                    this.crouchSize.width, this.crouchSize.height);
        }
        this.shape.setCollisionType(SpriteTag.runner);
        this.space.addShape(this.shape);
    },

    getPositionX:function () {
        return this.sprite.getPositionX();
    },

    runningHulk:function () {
        // slow down
        this.body.applyImpulse(cp.v(-400, 0), cp.v(0, 0));
        this.stat = RunnerStat.running;
        this.sprite.stopAllActions();
        this.sprite.runAction(this.runningAction);
        // clean screen, to avoid rock
        this.getParent().cleanScreen();
        this.unschedule(this.incredibleEmitter);
        this._emitter.removeFromParent();
    },

    incredibleHulk:function () {
        this.stat = RunnerStat.incredible;
        // run faster
        this.body.applyImpulse(cp.v(400, 0), cp.v(0, 0));
        this.scheduleOnce(this.runningHulk, 3.0);

        this._emitter = cc.ParticleFlower.create();
        var myTexture = cc.TextureCache.getInstance().addImage(s_star);
        this._emitter.setTexture(myTexture);
        this._emitter.setPosition(this.sprite.getPositionX(), this.sprite.getPositionY());
        this.addChild(this._emitter, 10);
        this.schedule(this.incredibleEmitter, 0.1);
    },

    incredibleEmitter:function(){
        //emitter
        this._emitter.setPosition(this.sprite.getPositionX(), this.sprite.getPositionY());
    },

    // return:
    //      true for die
    //      flase for alive
    meetRock:function () {
        if (this.stat == RunnerStat.incredible) {
            return false;
        } else {
            this.sprite.stopAllActions();
            //TODO: player die animation
            return true;
        }
    },

    jump:function () {
        if (this.stat == RunnerStat.running) {
            this.body.applyImpulse(cp.v(0, 250), cp.v(0, 0));
            this.stat = RunnerStat.jumpUp;
            this.sprite.stopAllActions();
            this.sprite.runAction(this.jumpUpAction);

            audioEngine.playEffect(s_music_jump);
        }
    },
    
    crouch:function () {
        if (this.stat == RunnerStat.running) {
            this.initShape("crouch");
            this.sprite.stopAllActions();
            this.sprite.runAction(this.crouchAction);
            this.stat = RunnerStat.crouch;
            // after time turn to running stat
            this.scheduleOnce(this.loadNormal, 1.5);

            audioEngine.playEffect(s_music_crouch);
        }
    },

    loadNormal:function (dt) {
        this.initShape("running");
        this.sprite.stopAllActions();
        this.sprite.runAction(this.runningAction);
        this.stat = RunnerStat.running;
    },

    step:function (dt) {
        var vel = this.body.getVel();
        if (this.stat == RunnerStat.jumpUp) {
            if (vel.y < 0.1) {
                this.stat = RunnerStat.jumpDown;
                this.sprite.stopAllActions();
                this.sprite.runAction(this.jumpDownAction);
            }
            return;
        }
        if (this.stat == RunnerStat.jumpDown) {
            if (vel.y == 0) {
                this.stat = RunnerStat.running;
                this.sprite.stopAllActions();
                this.sprite.runAction(this.runningAction);
            }
            return;
        }
    },
});

var gRunnerCrouchContentSize = null;
Runner.getCrouchContentSize = function () {
    if (null == gRunnerCrouchContentSize) {
        var sprite = cc.PhysicsSprite.createWithSpriteFrameName("runnerCrouch0.png");
        gRunnerCrouchContentSize = sprite.getContentSize();
    }
    return gRunnerCrouchContentSize;
};
