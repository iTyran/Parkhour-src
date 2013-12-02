var PlayScene = cc.Scene.extend({
    space:null,// chipmunk space

    onEnter:function () {
        this._super();

        this.initPhysics();
        this.addChild(new BackgroundLayer(), 0, TagOfLayer.background);
        this.addChild(new AnimationLayer(this.space), 0, TagOfLayer.Animation);
        this.addChild(new StatusLayer(), 0, TagOfLayer.Status);

        //Schedules the "update" method
        this.scheduleUpdate();
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
    },

    update:function (dt) {
        // chipmunk step
        this.space.step(dt);
    }
});

