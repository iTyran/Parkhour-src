var HelloLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        director = cc.Director.getInstance();
        winSize = director.getWinSize();
        var centerPos = cc.p(winSize.width / 2, winSize.height / 2);

        var spriteBG = cc.Sprite.create(s_HelloBG);
        spriteBG.setPosition(centerPos);
        this.addChild(spriteBG);

        cc.MenuItemFont.setFontSize(60);
        var menuItemPlay = cc.MenuItemSprite.create(
            cc.Sprite.create(s_start_n),
            cc.Sprite.create(s_start_s),
            this.onPlay, this);
        var menu = cc.Menu.create(menuItemPlay);
        menu.setPosition(centerPos);
        this.addChild(menu);
    },

    // on play button clicked
    onPlay:function (sender) {
        cc.log("==onPlay clicked");
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloLayer();
        layer.init();
        this.addChild(layer);
    }
});

