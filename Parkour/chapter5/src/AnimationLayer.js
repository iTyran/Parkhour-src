var AnimationLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        var spriteRunner = cc.Sprite.create(s_runner);
        var runPos = cc.p(80, 64 + (spriteRunner.getContentSize().height / 2));
        spriteRunner.setPosition(runPos);
        var actionTo = cc.MoveTo.create(2, cc.p(300, runPos.y));
        spriteRunner.runAction(cc.Sequence.create(actionTo));
        this.addChild(spriteRunner);
    }
});