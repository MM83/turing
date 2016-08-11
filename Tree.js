(function(){
    
    var _sample = {
        type : "list",
        id : "s0",
        list : [
            {
                id : "s1",
                type : "action",
                name : "move",
                data : "left"
            },
            {
                id : "s3",
                type : "loop",
                loopCount : 5,
                list : 
                [
                    {
                        id : "s4",
                        type : "action",
                        name : "move",
                        data : "down"
                    },
                    {
                        id : "NESTLOOP",
                        type : "loop",
                        loopCount : 3,
                        list : 
                        [
                            {
                                id : "nestloopitem",
                                type : "action",
                                name : "move",
                                data : "up"
                            }
                        ]
                    }
                ]
            },
            {
                id : "s8",
                type : "if",
                name : "clear",
                data : "forward",
                list : [
                    {
                        id : "sX",
                        type : "action",
                        name : "move",
                        data : "if body"
                    }
                ]
            }
        ]
    };
    
    /*
        The TreeNode has a getNextNode method. If this returns null, move
        on to the next node.
    */
    
    function reset(){
        this.conditionMet = false;
        this.cursor = 0;
        this.loopCursor = 0;
        this.finished = false;
        this.resetChildren();
    };
    
    function resetChildren(){
        var l = this.list;
        if(l)
            for(var i in l)
                if(l[i].reset)
                    l[i].reset();
    };
    
    function giveProps(node){
        node.reset = reset;
        node.executeNode = executeNode;
        node.incrementNode = incrementNode;
        node.resetChildren = resetChildren;
        node.reset();
    };
    
    function executeAction(data){
        console.log("EXECUTING", data.name, data.data);
    };
    
    var tree, root, isReadyForExec = false;
    
    function buildTree(data){
        
        data = JSON.parse(JSON.stringify(data));
        var root = true;
        
        function parseNode(node){
            
            giveProps(node);
            
            if(root)
                node.root = !(root = false);
            
            switch(node.type){
                case "list":
                case "if":    
                case "loop":
                    for(var i in node.list)
                        parseNode(node.list[i]);
            }
            
        };
        
        parseNode(data);
        isReadyForExec = true;
        return tree = node = data;
        
    };
    
    function checkCondition(cond){
        return true;
    };
    
    function incrementNode(){
        //Convenience method for iterating various node types
        ++this.cursor;
        
        
        var ended = this.cursor >= this.list.length;
        
        switch(this.type){
            case "list":
            case "if":
                if(ended)
                    this.reset();
                return !ended;//Return true if can execute again
            case "loop":
                if(ended){
                    console.log("loop ended");
                    if(this.loopCursor < this.loopCount){
                        ++this.loopCursor;
                        this.cursor = 0;
                        this.resetChildren();
                        return true;
                    } else {
                        this.reset();
                        return false;
                    }
                }
                return true;
        };
    };
    
    function executeNode(){
//        console.log("exec", this.id, this.type);
        var node, executed;
        
        switch(this.type){
            case "if":
                if(this.conditionMet || checkCondition(this.name, this.data)){
                    if(!this.conditionMet)
                        console.log("condition met");
                    this.conditionMet = true;
                } else {
                    return false;
                }
            case "list":
            case "loop": 
                node = this.list[this.cursor];
                if(!node)
                    throw "Node does not exist!";
                
                if(node.executeNode())
                    return true;
                return this.incrementNode();
            
                break;
            case "action":
                console.log("ACTION", this.name, this.data, this.id);
                return false;
        };
        return false;
    };
    
    /*
    It is relied upon that every node exists.
    
    */
    
    buildTree(_sample);

  //  while(tree.executeNode());
    
    window.addEventListener("mousedown", function(){
        if(!tree.executeNode())
            console.log("STREAM ENDED, RESETTING");
        
    });
    
    
})();