exports.level = function(){
    
    this.CellType = {
        Clear : 0,
        Wall  : 1,
        Laser : 2,
        
    };
    
    var cells;
    this.createEmpty = function(x, y){
        cells = [];
        var arr;
        while(var _x = 0; _x < x; ++x){
            cells.push(arr = []);
            while(var _y = 0; _y < y; ++y)
                arr.push({});
        };
    };
    
    
};
