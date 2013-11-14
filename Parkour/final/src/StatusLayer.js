var StatusLayer = cc.Layer.extend({
    labelCoin:null,
    labelMeter:null,
    coins:0,

    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        // PlayLayer will get StatusLayer by tag
        this.setTag(1);

        this.labelCoin = cc.LabelTTF.create("Coins:0", "Helvetica", 25);
        this.labelCoin.setPosition(cc.p(70, 300));
        this.addChild(this.labelCoin);

        this.labelMeter = cc.LabelTTF.create("0M", "Helvetica", 25);
        this.labelMeter.setPosition(cc.p(300, 300));
        this.addChild(this.labelMeter);
    },

    addCoin:function (num) {
        this.coins += num;
        this.labelCoin.setString("Coins:" + this.coins);
    },

    updateMeter:function (px) {
        this.labelMeter.setString(parseInt(px / 10) + "M");
    },
});

