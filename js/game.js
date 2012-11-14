function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}

function App(){
	this.player = 1;
	this.drawBoard();
}

App.prototype = {
	//The current player. 1 is user, 2 is AI.
	player: 0,
	
	board: [
	    [0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0],
	    [0, 0, 0, 0, 0, 0]
	],
	
	drawBoard: function(){
		
		var table = $("<table>");
		table.attr("id", "eltable");
		for(var i = 0; i < 6; i++){
			var tr = $("<tr>");
			tr.addClass("row");
			for(var j = 0; j < 7; j++){
				var td = $("<td>");
				td.attr("thei", j);
				td.addClass("item");
				td.append($("<div>").addClass("mask"));
				tr.append(td);
			}
			table.append(tr);
		}
		$("#main").html(table);
		
		function remap(from){
			return ([5,4,3,2,1,0])[from];
		}
		
		for(var i = 0; i < 6; i++){
			for(var j = 0; j < 7; j++){
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("mouseover", (function(inSender){
					if(!this.blocked && !this.winner){
						var col = inSender.srcElement.getAttribute("thei");
						if(this.canDrop(col)){
							var item = remap(this.dropOnIndex(col));
							var hover = $(table.children()[0].childNodes[item].childNodes[col]);
							hover.addClass("ihover");
							hover.addClass(this.player === 1 ? "one" : "two");
						}
					}
				}).bind(this));
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("mouseout", (function(inSender){
					if(!this.blocked && !this.winner){
						var col = inSender.srcElement.getAttribute("thei");
						if(this.canDrop(col)){
							var item = remap(this.dropOnIndex(col));
							var hover = $(table.children()[0].childNodes[item].childNodes[col]);
							hover.removeClass("ihover");
							hover.removeClass("one");
							hover.removeClass("two");
						}
					}
				}).bind(this));
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("click", (function(inSender){
					if(!this.blocked && !this.winner){
						var col = inSender.srcElement.getAttribute("thei");
						if(this.canDrop(col)){
							this.block(true);
							this.uiDrop(col, (function(){
								//Computer's turn, mother fucker:
								this.doComputer();
							}).bind(this));
						}
					}
				}).bind(this));
			}
		}
	},
	
	reset: function(){
		this.player = 1;
		this.board =  [
		    [0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0],
		    [0, 0, 0, 0, 0, 0]
		];
		this.columns = [];
		this.winner = false;
		this.stale = false;
		this.block(false);
		this.drawBoard();
	},
	
	//Drops a piece in the board, and adds the UI to match:
	uiDrop: function(col, callback){
		function remap(from){
			return ([5,4,3,2,1,0])[from];
		}
		if(this.canDrop(col)){
			var item = remap(this.dropOnIndex(col));
			var drop = $($("#eltable").children()[0].childNodes[item].childNodes[col]);
			var piece = $("<div>");
			piece.addClass(this.player === 1 ? "playerOne" : "playerTwo");
			piece.css("top", "-1000px");
			piece.css("top", "-500px");
			piece.css("top", "-700px");
			drop.append(piece);
			drop.removeClass("ihover");
			this.drop(col);
			piece.animate({
				top: "0"
			}, 700, "easeOutBounce", (function(){
				if(this.winner){
					this.playerWon();
				}else if(callback){
					callback();
				}
			}).bind(this))
		}
	},
	
	block: function(direction){
		this.blocked = direction;
	},
	
	doComputer: function(){
		//Block user input
		this.block(true);
		//Change player to the AI:
		this.flipPlayer();
		//Generate the best move:
		var ai = new AI(this);
		//Drop the best move:
		this.uiDrop(ai.bestMove, (function(){
			//Change player back to user:
			this.flipPlayer();
			//Unblock user interaction with the UI:
			this.block(false);
		}).bind(this));
	},
	
	canDrop: function(column, board){
		var eb = board || this.board;
		return (eb[column].indexOf(0) > -1);
	},
	dropOnIndex: function(column, board){
		var eb = board || this.board;
		return eb[column].indexOf(0);
	},
	simulateDrop: function(column, board, player){
		var sboard = board || this.board;
		var splayer = player || this.player;
		//Clone the board:
		if(this.canDrop(column)){
			var clone = deepCopy(sboard);
			var row = clone[column].indexOf(0);
			clone[column][row] = splayer;
			return {board: clone, x: column, y: row}
		}else{
			return false;
		}
	},
	drop: function(column){
		var drop = this.simulateDrop(column);
		this.board = drop.board;
		if(this.isVictory(drop.board, drop.x, drop.y)){
			this.winner = true;
		}else if(this.isStalemate(drop.board)){
			this.winner = true;
			this.stale = true;
		}
		return drop;
	},
	
	playerWon: function(){
		if(this.stale){
			alert("Game was a stalemate.");
		}else{
			alert("Player " + this.player + " Won!");
		}
		this.reset();
	},
	
	flipPlayer: function(){
		if(this.player === 1){
			this.player = 2;
		}else{
			this.player = 1;
		}
		return this.player;
	},
	isStalemate: function(board){
		var stale = true;
		for(var i = 0; i < board.length; i++){
			if(board[i].indexOf(0) > -1){
				stale = false;
				break;
			}
		}
		return stale;
	},
	isVictory: function(pieces, placedX, placedY) {
		return (this.inARow(pieces, placedX, placedY) >= 4)
	},
	inARow: function(pieces, placedX, placedY) {
		var directions = [
	      { x: 0, y: 1  }, // North-South
	      { x: 1, y: 0  }, // East-West
	      { x: 1, y: 1  }, // Northeast-Southwest
	      { x: 1, y: -1 }  // Southeast-Northwest
	    ];
	    
	    var us = pieces[placedX][placedY];
	    
	    var counts = [];
	    
	    for(i = 0; i < directions.length; i++){
	    	//Easier reference to the direction:
	    	var dir = directions[i];
	    	//Count in a row:
	    	var count = 1;
	    	//One-way flags to stop directional searching when a conflict has been found
	    	var pos = true;
	    	var neg = true;
	    	//Loop though four levels
	    	for(var j = 1; j < 5; j++){
	    		if(pos){
	    			var x = placedX + (dir.x * j);
	    			var y = placedY + (dir.y * j);
	    			if(pieces[x] && pieces[x][y] && pieces[x][y] === us){
	    				count++;
	    			}else{
	    				pos = false;
	    			}
	    		}
	    		if(neg){
	    			var x = placedX + (-1*(dir.x * j));
	    			var y = placedY + (-1*(dir.y * j));
	    			if(pieces[x] && pieces[x][y] && pieces[x][y] === us){
	    				count++;
	    			}else{
	    				neg = false;
	    			}
	    		}
	    	}
	    	counts.push(count);
	    }
	    //Most in a row:
		return counts.sort().reverse()[0];
	}
}

function AI(game){
	//create reference to the game calling us:
	this.parent = game;
	//Copy the board:
	this.board = deepCopy(this.parent.board);
	this.bestMove = this.findBestMove();
}
AI.prototype = {
	findBestMove: function(){
		this.bestMoves = this.calculateMoves();
		return this.bestMoves.indexOf(Math.max.apply(this, this.bestMoves));
	},
	calculateMoves: function(){
		var bestMoves = [0, 0, 0, 0, 0, 0, 0];
		
		for(var i = 0; i < 7; i++){
			if(this.parent.canDrop(i)){
				var simdrop2 = this.parent.simulateDrop(i, this.board, 2);
				var simdrop1 = this.parent.simulateDrop(i, this.board, 1);
				if(this.parent.isVictory(simdrop2.board, simdrop2.x, simdrop2.y)){
					//NOTE: We could return here, because this is always the best move. But we wont.
					bestMoves[i] += 1000;
				}
				if(this.parent.isVictory(simdrop1.board, simdrop1.x, simdrop1.y)){
					bestMoves[i] += 100;
				}
				var row = this.parent.inARow(simdrop2.board, simdrop2.x, simdrop2.y)
				bestMoves[i] += row;
				var row = this.parent.inARow(simdrop1.board, simdrop1.x, simdrop1.y)
				bestMoves[i] += row/2;
			}
		}
		return bestMoves;
	}
}