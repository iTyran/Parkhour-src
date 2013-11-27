var BackgroundLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        var centerPos = cc.p(winSize.width / 2, winSize.height / 2);
        var spriteBG = cc.Sprite.create(s_PlayBG);
        spriteBG.setPosition(centerPos);
        this.addChild(spriteBG);
    }
});

