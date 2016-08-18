var buildTree;

(function(){
    
    var _sample = {
        type : "List",
        id : "s0",
        list : [
            {
                id : "s1",
                type : "Action",
                name : "Move",
                data : "Left"
            },
            {
                id : "s3",
                type : "Loop",
                data : 2,
                list : 
                [
                    {
                        id : "s4",
                        type : "Action",
                        name : "Move",
                        data : "Down"
                    },
                    {
                        id : "NESTLOOP",
                        type : "Loop",
                        data : 2,
                        list : 
                        [
                            {
                                id : "nestloopitem",
                                type : "Action",
                                name : "Move",
                                data : "Up"
                            }
                        ]
                    }
                ]
            },
            {
                id : "s8",
                type : "If",
                name : "clear",
                data : "forward",
                list : [
                    {
                        id : "sX",
                        type : "Action",
                        name : "Move",
                        data : "if body"
                    }
                ]
            }
        ]
    };
   
    
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
        B.runCallApp("sendAction", [data.type, data.name, data.data]);
    };
    
    var tree, root, isReadyForExec = false;
    
    function _buildTree(data){
        
        data = JSON.parse(JSON.stringify(data));
        var root = true;
        
        function parseNode(node){
            
            giveProps(node);
            
            if(root)
                node.root = !(root = false);
            
            switch(node.type){
                case "List":
                case "If":    
                case "Loop":
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
            case "List":
            case "If":
                if(ended)
                    this.reset();
                return !ended;//Return true if can execute again
            case "Loop":
                if(ended){
                    if(this.loopCursor < this.data - 1){
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
        
        var node, executed;
        
        switch(this.type){
            case "If":
                if(this.conditionMet || checkCondition(this.name, this.data))
                    this.conditionMet = true;
                else 
                    return false;
            case "List":
            case "Loop":
                node = this.list[this.cursor];
                if(!node)
                    throw "Node does not exist!";
                
                if(node.executeNode())
                    return true;
                return this.incrementNode();
            
                break;
            case "Action":
                executeAction(this);
                return false;
            case "Flow":
                switch(this.name){
                    case "Restart":
                        executeAction(this);
                        tree.reset();
                        break;
                };
                return true;
        };
        return false;
    };
    
    buildTree = _buildTree;

    
})();