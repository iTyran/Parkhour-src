
var ObjectManager = cc.Class.extend({
    spriteSheet:null,
    space:null,
    objects:[],

    /** Constructor
     * @param {cc.SpriteBatchNode *}
     * @param {cp.Space *}
     */
    ctor:function (spriteSheet, space) {
        this.spriteSheet = spriteSheet;
        this.space = space;
        // objects will keep when new ObjectManager();
        // we need clean here
        this.objects = [];
    },

    /** Calculating the coordinates of coins or rocks, which will add to the map
     * @param {cc.Class *}
     * @param {float}
     */
    initObjectOfMap:function (map, mapWidth) {
        var initCoinNum = 7;
        var jumpRockHeight = Runner.getCrouchContentSize().height + g_groundHight;
        var coinHeight = Coin.getContentSize().height + g_groundHight;

        //random the center point of 7 coins.
        var randomCoinFactor = Math.round(Math.random()*2+1);
        var randomRockFactor = Math.round(Math.random()*2+1);
        var jumpRockFactor = 0;

        var coinPoint_x = mapWidth/4 * randomCoinFactor+mapWidth*map;
        var RockPoint_x = mapWidth/4 * randomRockFactor+mapWidth*map;

        var coinWidth = Coin.getContentSize().width;
        var rockWith = Rock.getContentSize().width;
        var rockHeight =  Rock.getContentSize().height;

        var startx = coinPoint_x - coinWidth/2*11;
        var xIncrement = coinWidth/2*3;

        //add a rock
        var rock = new Rock(this.spriteSheet, this.space,
                cc.p(RockPoint_x, g_groundHight+rockHeight/2));
        rock.map = map;
        this.objects.push(rock);
        if(map == 0 && randomCoinFactor==1){
            randomCoinFactor = 2;
        }

        //add coins
        for(i = 0; i < initCoinNum; i++)
        {
            if((startx + i*xIncrement > RockPoint_x-rockWith/2)
                &&(startx + i*xIncrement < RockPoint_x+rockWith/2))
            {
                var coin1 = new Coin(this.spriteSheet, this.space,
                        cc.p(startx + i*xIncrement, coinHeight+rockHeight));
            } else{
                var coin1 = new Coin(this.spriteSheet, this.space,
                        cc.p(startx + i*xIncrement, coinHeight));
            }

            coin1.map = map;
            this.objects.push(coin1);
        }

        for(i=1;i<4;i++){
            if(i!=randomCoinFactor&&i!=randomRockFactor){
                jumpRockFactor = i;
            }
        }

        //add jump rock
        var JumpRockPoint_x = mapWidth/4 * jumpRockFactor+mapWidth*map;
        var jumpRock = new Rock(this.spriteSheet, this.space,
                cc.p(JumpRockPoint_x, jumpRockHeight+rockHeight/2));
        jumpRock.map = map;
        this.objects.push(jumpRock);
    },

    /** remove all objects of the map
     * @param {int}
     */
    recycleObjectOfMap:function (map) {
        while((function (obj, map) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i].map == map) {
                    obj[i].removeFromParent();
                    obj.splice(i, 1);
                    return true;
                }
            }
            return false;
        })(this.objects, map));
    },

    /** remove specified object
     * @param {cc.Class *} Coin or Rock
     */
    remove:function (obj) {
        obj.removeFromParent();
        // find and delete obj
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i] == obj) {
                this.objects.splice(i, 1);
                break;
            }
        }
    },

    getObjectByShape:function (shape) {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].getShape() == shape) {
                return this.objects[i];
            }
        }
        return nil;
    }
});

