var AnimationLayer = cc.Layer.extend({
    spriteSheet:null,
    runningAction:null,
    sprite:null,
    space:null,
    body:null,
    shape:null,

    ctor:function (space) {
        this._super();
        this.space = space;
        this.init();
    },

    init:function () {
        this._super();

        // create sprite sheet
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_runnerplist);
        this.spriteSheet = cc.SpriteBatchNode.create(s_runner);
        this.addChild(this.spriteSheet);

        // init runningAction
        var animFrames = [];
        for (var i = 0; i < 8; i++) {
            var str = "runner" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.create(animFrames, 0.1);
        this.runningAction = cc.RepeatForever.create(cc.Animate.create(animation));

        this.sprite = cc.PhysicsSprite.createWithSpriteFrameName("runner0.png");
        var contentSize = this.sprite.getContentSize();
        // init body
        this.body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
        this.body.p = cc.p(g_runnerStartX, g_groundHight + contentSize.height / 2);
        this.body.applyImpulse(cp.v(150, 0), cp.v(0, 0));//run speed
        this.space.addBody(this.body);
        //init shape
        this.shape = new cp.BoxShape(this.body, contentSize.width - 14, contentSize.height);
        this.shape.setCollisionType(SpriteTag.runner);
        this.space.addShape(this.shape);

        this.sprite.setBody(this.body);
        this.sprite.runAction(this.runningAction);
        this.spriteSheet.addChild(this.sprite);

        //Schedules the "update" method
        this.scheduleUpdate();
    },

    getEyeX:function () {
        return this.sprite.getPositionX() - g_runnerStartX;
    },

    update:function (dt) {
        var eyeX = this.sprite.getPositionX() - g_runnerStartX;
        var camera = this.getCamera();
        var eyeZ = cc.Camera.getZEye();
        camera.setEye(eyeX, 0, eyeZ);
        camera.setCenter(eyeX, 0, 0);
    }
});
