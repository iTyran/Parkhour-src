var BackgroundLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        var map00 = cc.TMXTiledMap.create(s_map00);
        this.addChild(map00);
    }
});

