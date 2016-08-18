exports.level = function Level(scene, blipp){
    
    var sampleData = {
        playerPos : [0, 0],
        playerFacing : 1,
        cells : [
            [0, 0, 1, 0, 0, 0, 0, 0],
            [5, 0, 1, 0, 0, 0, 0, 0],
            [1, 2, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 3, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 1],
            [0, 0, 0, 0, 0, 5, 0, 1],
            [0, 0, 0, 0, 0, 1, 4, 4]
        ]
    };
    
    this.scene = scene;
    this.blipp = blipp;
    
    Level.CellTypes = {
        Wall : 0, 
        Path : 1, 
        Lava : 2, 
        Switch : 3, 
        DoorOpen : 4, 
        DoorClosed : 5,
        Door : 6
    };
    
    function log(){
        var str = arguments[0];
        for(var i = 1; i < arguments.length; ++i)
            str += ", " + arguments[i];    
        console.log(str);
    };
    
    
    this.init = function(){
        
        player = scene.addMesh("Cube.md2").setColor("#fab917");
        player.setHidden(false).setScale(0.20, 0.20, 0.05).setTexture("bot.png");
        //TODO - Anim in etc
        this.buildLevel();
        
        log(this.checkCell(0));
        log(this.checkCell(1));
        log(this.checkCell(2));
        log(this.checkCell(3));
        
    };
    
    
    this.checkCell = function(facing){
        
        var x = 0, y = -1;
        var ang = (playerFacing + facing - 1) * Math.PI / 2;
        x = Math.round(Math.sin(ang)) + playerPos[0];
        y = Math.round(Math.cos(ang)) + playerPos[1];
        
        var xl = cells.length;
        
        
        if(x < 0 || y < 0 || x >= xl || y >= yl)
            return "Out of Bounds";
        
        var cell = cells[x][y];
        
        
        log("CHECK COORDS", x, y, cell.type);
        
        switch(cell.type){
            case Level.CellTypes.Wall:
            case Level.CellTypes.DoorClosed:
                return "Blocked";
            case Level.CellTypes.Switch:
            case Level.CellTypes.Path:
            case Level.CellTypes.DoorOpen:
                return "Clear";
            case Level.CellTypes.Lava:
                return "Danger";
        };
        
        
    };
  
    
    scene.sendAction = function(type, name, data){
        switch(name){
            case "Move":
                if(name == "Forward"){
                    
                } else {
                    
                }
                break;
            case "Turn":
                if(name == "Right"){
                    playerFacing = ++playerFacing % 4;
                } else {
                    if(--playerFacing < 0)
                        playerFacing += 4;
                }
                break;
            case "Press":
                break;
        };
        
//        setTimeout(500, function(){
//            blipp.callJavascript("blippCallback(20);");
//        });
    };
    
    
    var player, cells, playerPos, playerFacing, levelData, basePlane, xl, yl;
    
    var gridDim = 100, scaleMult = 4;
    
    
    function randHex(){
        var str = "#", i = 3;
        while(--i > -1)
            str += Math.floor(Math.random() * 256).toString(16);
        return str;
    };
    
    this.buildLevel = function(data){
        
        //TODO Destroy previous nodes
        
        cells = [];
        
        levelData = data || sampleData;
        
        this.killQueue();
        
        var map = levelData.cells;
        var xArr;
        xl = map.length;
        
        for(var i = 0; i < xl; ++i){
            xArr = map[i];
            yl = xArr.length;
            cells[i] = [];
            for(var j = 0; j < yl; ++j){
                var node = this.buildCell(i, j, map[i][j], xl, yl);
                cells[i][j] = node;
            }
        }
        
        var xPos = ((levelData.playerPos[0] / xl) * gridDim - gridDim / 2) * scaleMult;
        var yPos = -((levelData.playerPos[1] / yl) * gridDim - gridDim / 2) * scaleMult;
        player.setTranslation(xPos, yPos, 0);
        
        playerPos = levelData.playerPos.concat();
        playerFacing = levelData.playerFacing;
        player.setRotation(0, 0, playerFacing * -90 + 180);
        
    //    basePlane = scene.addSprite().setScale(400, 400, 1).setTranslation(0, 0, -30);
        
    };

    this.buildCell = function(x, y, type, xl, yl){
        
        var xPos = ((x / xl) * gridDim - gridDim / 2) * scaleMult;
        var yPos = -((y / yl) * gridDim - gridDim / 2) * scaleMult;
        var zPos = -30;
        var zScale = 0.1;
        var cellColour = "#000000";
        var node = this.scene.addMesh("Cube.md2");
        
        var cell = {
            node : node,
            pos : [x, y],
            type : type
        }
        
        switch(type){
            case Level.CellTypes.Wall:
                zScale = 0.25;
                break;
            case Level.CellTypes.Path:
                cellColour = "#eeeeee";
    //            node.setHidden(true);
                break;
            case Level.CellTypes.Lava:
                cellColour = "#fcaa53";
                break;
            case Level.CellTypes.Switch:
                cellColour = "#2266fa";
                zScale = 0.18;
                break;
            case Level.CellTypes.DoorOpen:
                cellColour = "#1d3b7b";
                zScale = 0.25;
                zPos = 30;
                break;
            case Level.CellTypes.DoorClosed:
                cellColour = "#1d3b7b";
                zScale = 0.25;
                break;
        };
        
        node.setScale(0.25, 0.25, zScale).setColor(cellColour).setTranslation(xPos, yPos, zPos);
        
        return cell;
    };
    
    function cycleBoard(){
        
    };
    
    
    this.checkCondition = function(cond){
        return true;
    };
    
    var _qint, _q = [];
    this.killQueue = function(){
        _q = [];
    };
    this.addToQueue = function(item){
        console.log("ADD ZONE");
        _q.push(item);
        if(!_qint)
            _qint = setInterval(tickQ, (_q.length == 1) ? 10 : 1000);
    };
    
    function tickQ(){
        console.log("tick q");
        var item = _q.shift();
        if(!_q.length){
            console.log("clearing q");
            clearInterval(_qint);    
        }
    };
    
    
    
    
};
