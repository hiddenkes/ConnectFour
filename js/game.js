function isVictory(pieces, placedX, placedY) {
  var i, j, x, y, maxX, maxY, steps, count = 0,
    directions = [
      { x: 0, y: 1  }, // North-South
      { x: 1, y: 0  }, // East-West
      { x: 1, y: 1  }, // Northeast-Southwest
      { x: 1, y: -1 }  // Southeast-Northwest
    ];
    
  // Check all directions
  outerloop:
  for (i = 0; i < directions.length; i++, count = 0) {
    // Set up bounds to go 3 pieces forward and backward
    x =     Math.min(Math.max(placedX - (3 * directions[i].x), 0), pieces.length    - 1);
    y =     Math.min(Math.max(placedY - (3 * directions[i].y), 0), pieces[0].length - 1);
    maxX =  Math.max(Math.min(placedX + (3 * directions[i].x),     pieces.length    - 1), 0);
    maxY =  Math.max(Math.min(placedY + (3 * directions[i].y),     pieces[0].length - 1), 0);
    steps = Math.max(Math.abs(maxX - x), Math.abs(maxY - y));
    
    for (j = 0; j < steps; j++, x += directions[i].x, y += directions[i].y) {
      if (pieces[x][y] == pieces[placedX][placedY]) {
        // Increase count
        if (++count >= 4) {
          break outerloop;
        }
      } else {
        // Reset count
        count = 0;
      }
    }
  }
  
  return count >= 4;
}

// Keep in mind that these board are technically "sideways"
var testVertical = [
    [1, 1, 1, 0, 0, 0],
    [1, 2, 2, 2, 2, 1], // Last placed piece is the last "2" [1][4]
    [2, 1, 2, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
];

var testDiagonal = [
    [1, 1, 1, 2, 2, 0],
    [1, 1, 2, 1, 2, 0],
    [2, 1, 2, 2, 0, 0],
    [1, 2, 2, 0, 0, 0], // Last placed piece is the last "2" [3][2]
    [1, 2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0]
];

var testNoVictory = [
    [1, 1, 1, 2, 2, 0],
    [1, 1, 1, 1, 2, 0],
    [2, 1, 2, 1, 0, 0],
    [1, 2, 2, 0, 0, 0], // Last placed piece is the last "2" [3][2]
    [2, 2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0]
];

document.write('Vertical Win: ' + (isVictory(testVertical, 1, 4) ? "You win!" : "Not yet") + "<br />");
document.write('Diagonal Win: ' + (isVictory(testDiagonal, 3, 2) ? "You win!" : "Not yet") + "<br />");
document.write('No Victory: ' + (isVictory(testNoVictory, 3, 2) ? "You win!" : "Not yet") + "<br />");

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
	
	columns: [],
	
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
		$(document.body).append(table);
		
		function remap(from){
			return ([5,4,3,2,1,0])[from];
		}
		
		for(var i = 0; i < 6; i++){
			for(var j = 0; j < 7; j++){
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("mouseover", (function(inSender){
					var col = inSender.srcElement.getAttribute("thei");
					if(this.canDrop(col)){
						var item = remap(this.dropOnIndex(col));
						var hover = $(table.children()[0].childNodes[item].childNodes[col]);
						hover.addClass("ihover");
					}
				}).bind(this));
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("mouseout", (function(inSender){
					var col = inSender.srcElement.getAttribute("thei");
					if(this.canDrop(col)){
						var item = remap(this.dropOnIndex(col));
						var hover = $(table.children()[0].childNodes[item].childNodes[col]);
						hover.removeClass("ihover");
					}
				}).bind(this));
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("click", (function(inSender){
					var col = inSender.srcElement.getAttribute("thei");
					if(this.canDrop(col)){
						this.uiDrop(col, (function(){
							//Computer's turn, mother fucker:
							this.doComputer();
						}).bind(this));
					}
				}).bind(this));
			}
		}
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
			}, 700, "easeOutBounce", function(){
				callback();
			})
		}
	},
	
	block: function(direction){
		
	},
	
	doComputer: function(){
		//Block user input
		this.block(true);
		//Change player to the AI:
		this.flipPlayer();
		//Generate the best move:
		var ai = new AI(this);
		//Drop the best move:
		this.uiDrop(ai.bestMove);
		//Change player back to user:
		this.flipPlayer();
		//Unblock user interaction with the UI:
		this.block(false);
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
		
		return drop;
	},
	flipPlayer: function(){
		if(this.player === 1){
			this.player = 2;
		}else{
			this.player = 1;
		}
		return this.player;
	},
	isVictory: function(pieces, placedX, placedY) {
		var i, j, x, y, maxX, maxY, steps, count = 0,
		directions = [
			{ x: 0, y: 1 }, // North-South
			{ x: 1, y: 0 }, // East-West
			{ x: 1, y: 1 }, // Northeast-Southwest
			{ x: 1, y: -1 }  // Southeast-Northwest
		];
		outerloop:
		for (i = 0; i < directions.length; i++, count = 0) {
			// Set up bounds to go 3 pieces forward and backward
			x = Math.min(Math.max(placedX - (3 * directions[i].x), 0), pieces.length - 1);
			y = Math.min(Math.max(placedY - (3 * directions[i].y), 0), pieces[0].length - 1);
			maxX = Math.max(Math.min(placedX + (3 * directions[i].x), pieces.length - 1), 0);
			maxY = Math.max(Math.min(placedY + (3 * directions[i].y), pieces[0].length - 1), 0);
			steps = Math.max(Math.abs(maxX - x), Math.abs(maxY - y));
			
			for (j = 0; j < steps; j++, x += directions[i].x, y += directions[i].y) {
				if (pieces[x] && pieces[placedX] && (pieces[x][y] == pieces[placedX][placedY])) {
			    	// Increase count
			    	if (++count >= 4) {
			    		break outerloop;
			    	}
				} else {
					// Reset count
					count = 0;
				}
			}
		}
		  
		return count >= 4;
	},
	inARow: function(pieces, placedX, placedY) {
		var i, j, x, y, maxX, maxY, steps, count = 0,
		directions = [
			{ x: 0, y: 1  }, // North-South
			{ x: 1, y: 0  }, // East-West
			{ x: 1, y: 1  }, // Northeast-Southwest
			{ x: 1, y: -1 }  // Southeast-Northwest
		];
		
		var counts = [];
		
		outerloop:
		for (i = 0; i < directions.length; i++, count = 0) {
			// Set up bounds to go 3 pieces forward and backward
			x = Math.min(Math.max(placedX - (3 * directions[i].x), 0), pieces.length - 1);
			y = Math.min(Math.max(placedY - (3 * directions[i].y), 0), pieces[0].length - 1);
			maxX = Math.max(Math.min(placedX + (3 * directions[i].x), pieces.length - 1), 0);
			maxY = Math.max(Math.min(placedY + (3 * directions[i].y), pieces[0].length - 1), 0);
			steps = Math.max(Math.abs(maxX - x), Math.abs(maxY - y));
			
			for (j = 0; j < steps; j++, x += directions[i].x, y += directions[i].y) {
				if (pieces[x] && pieces[placedX] && (pieces[x][y] == pieces[placedX][placedY])) {
			    	// Increase count
			    	count++;
				} else {
					counts.push(count);
					// Reset count
					count = 0;
				}
			}
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