var AnimationLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        var centerPos = cc.p(80, 85);
        var spriteBG = cc.Sprite.create(s_runner);
        spriteBG.setPosition(centerPos);
        var actionTo = cc.MoveTo.create(2, cc.p(300, 85));
        spriteBG.runAction(cc.Sequence.create(actionTo));
        this.addChild(spriteBG);
    }
});