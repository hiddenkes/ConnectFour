/*
 * TODO:
 * Change the styling on the winner overlay to something more visually appealing. Play around with covering the entire screen.
 * Maybe a radial gradient would add some spice to the winner dialog.
 * Add the two player toggler in the appmenu, along with on-the-fly difficulty changing (mid-game, even). Also add a "restart game" option.
 * Turn indicators would be nice.
 * In options, you should be able to set who goes first (Computer, You, Random).
 */


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
	//Set the player.
	//TODO: This should pull in from settings so we can set who goes first:
	this.player = 1;
	
	//Draw the board.
	this.drawBoard();
	
	//Add the event listener for the "New Game" button on the winner page:
	document.getElementById("newGameWinner").addEventListener("click", this.reset.bind(this), false);

	//Unit testing for 
	if(this.twoplayer === "computer"){
		this.doComputer();
	}
}

App.prototype = {
	//The current player. 1 is user, 2 is AI. Zero initially. We can actually set who goes first.
	player: 0,
	
	twoplayer: false,
	
	difficulty: "extreme",
	
	theme: "standard",
	
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
				td.append($("<div>").addClass("mask").addClass(this.theme));
				tr.append(td);
			}
			table.append(tr);
		}
		//TODO: Change the ID to whatever we are actually dumping the HTML into.
		$("#gameboard").html(table);
		
		$("#host").addClass(this.theme);
		$("#masker").addClass(this.theme);
		$("#eltable").addClass(this.theme);
		
		function remap(from){
			return ([5,4,3,2,1,0])[from];
		}

		var that = this;
		
		for(var i = 0; i < 6; i++){
			for(var j = 0; j < 7; j++){
				//iterate over the child nodes and add our event listeners.
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("mouseover", (function(inSender){
					if(!that.blocked && !that.winner){
						var col = $(this).attr("thei");
						col = parseInt(col);
						if(that.canDrop(col)){
							var item = remap(that.dropOnIndex(col));
							var hover = $(table.children()[0].childNodes[item].childNodes[col]);
							hover.addClass("ihover");
							hover.addClass(that.player === 1 ? "one" : "two");
							hover.addClass(that.theme);
						}
					}
				}));
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("mouseout", (function(inSender){
					if(!that.blocked && !that.winner){
						var col = $(this).attr("thei");
						col = parseInt(col);
						if(that.canDrop(col)){
							var item = remap(that.dropOnIndex(col));
							var hover = $(table.children()[0].childNodes[item].childNodes[col]);
							hover.removeClass("ihover");
							hover.removeClass("one");
							hover.removeClass("two");
						}
					}
				}));
				(table.children()[0].childNodes[i].childNodes[j]).addEventListener("click", (function(inSender){
					if(!that.blocked && !that.winner){
						var col = $(this).attr("thei");
						col = parseInt(col);
						if(that.canDrop(col)){
							that.block(true);
							that.uiDrop(col, (function(){
								if(!that.twoplayer){
									//Computer's turn, mother fucker:
									that.doComputer();
								}else{
									that.flipPlayer();
									that.block(false);
								}
							}));
						}
					}
				}));
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
		this.winner = false;
		this.stale = false;
		this.block(true);
		this.hideWinner();
				
		//Animate checker pieces out:
		$(".playerPiece").each(function(id, el){
			$(this).animate({
				top: "-1000px"
			}, Math.round(800 + Math.random() * 500), "easeInCirc");
		});

		//Redraw the board after every piece has been animated out, which at max is 1300 milliseconds
		window.setTimeout((function(){
			this.block(false);
			this.drawBoard();
		}).bind(this), 1300);
	},
	
	//Drops a piece in the board, and adds the UI to match:
	//Note that this also will trigger win UI, and does not flip the player.
	uiDrop: function(col, callback){
		function remap(from){
			return ([5,4,3,2,1,0])[from];
		}
		if(this.canDrop(col)){
			var item = remap(this.dropOnIndex(col));
			var drop = $($("#eltable").children()[0].childNodes[item].childNodes[col]);
			var piece = $("<div>");
			piece.addClass("playerPiece");
			piece.addClass(this.player === 1 ? "playerOne" : "playerTwo");
			piece.addClass(this.theme);
			
			piece.css("top", "-" + (item * 100 + 150) + "px");
			
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
			}).bind(this));
		}
	},
	
	//Block UI interaction with the board.
	block: function(direction){
		this.blocked = direction;
	},
	
	//Initiate a computer move. This blocks user input, flips the player, generates an AI move, plays that move, flips the player back and unblocks the board.
	doComputer: function(){
		//Block user input
		this.block(true);
		//Change player to the AI:
		this.flipPlayer();
		//Generate the best move:
		var ai;
		if(this.difficulty === "extreme"){
			ai = new RecursiveAI(this);
		}else{
			ai = new AI(this);
		}
		//Drop the best move:
		this.uiDrop(ai.bestMove, (function(){
			if(this.twoplayer && this.twoplayer === "computer"){
				//COMPUTER VS COMPUTER:
				//This isn't actually a feature for the game, we just use it internally to test the AI's predictability.
				this.doComputer();
			}else{
				//Change player back to user:
				this.flipPlayer();
				//Unblock user interaction with the UI:
				this.block(false);
			}
		}).bind(this));
	},
	
	//Determines if a drop can be done in a column, based on a board.
	canDrop: function(column, board){
		var eb = board || this.board;
		return (eb[column].indexOf(0) > -1);
	},
	
	//Returns the row that a drop in a column would result in. Returns -1 if the drop could not be done.
	dropOnIndex: function(column, board){
		var eb = board || this.board;
		return eb[column].indexOf(0);
	},
	
	//This simulates a drop for a certain player on a column in a given board, and returns the new board and the x and y position of the new piece.
	//Note that this only simulates a drop, and doesn't change the running game board.
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
	
	//Actually drops a piece in a given column. This calls simulateDrop and applies those changes to the board.
	//Note that this does not make any changes to the UI of the board. That is handled by uiDrop.
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
	
	//Shows the UI when a player wins.
	playerWon: function(){
		
		$("#winner").addClass("showing");
		
		var result = "";
		var details = "";
		if(this.stale){
			result = "This game was a stalemate.";
			details = "Neither player won, and all of the pieces on the board have been used up.";
		}else{
			if(this.twoplayer){
				var detailOptions = [
					"Good job sir. You win our respect.",
					"Can you say \"bragging rights\"?",
					"Sometimes, you have to take one for the team.",
					"You're never going to hear the end of this...",
					"But I bet they can't beat the computer on \"extreme\" difficulty! Give it a try!",
					"Cue the smack talk.",
					"\"That was easy.\"",
					"Rematch, anyone?"
				];
				result = "Player " + this.player + "<br /><span style='font-size: 0.7em;'>defeated</span><br />Player " + (this.player === 1 ? "2" : "1");
				details = detailOptions[Math.round(Math.random() * (detailOptions.length - 1))];
			}else{
				if(this.player === 1){
					//YOU WON
					result = "You won! Congratulations!";
					details = "You beat the computer on \"" + this.difficulty + "\" difficulty. Good job!";
				}else{
					//Uh oh :(
					result = "You lost :(";
					details = "You win some, you lose some. Better luck next time."
				}
			}
		}
		
		$("#winenrText").html(result);
		$("#detailsText").html(details);
	},
	
	//Hides the "playerWon" UI.
	hideWinner: function(){
		//Fade it out.
		$("#winner").addClass("hidden");
		
		//We could do this with event listeners, but we'd constantly be adding and removing them, so this is just easier.
		window.setTimeout((function(){
			//Clean up our classes.
			$("#winner").removeClass("showing");
			$("#winner").removeClass("hidden");
		}).bind(this), 1000);
	},
	
	//Flips the current player of the game.
	flipPlayer: function(){
		if(this.player === 1){
			this.player = 2;
		}else{
			this.player = 1;
		}
		return this.player;
	},
	
	//
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
	
	//
	isVictory: function(pieces, placedX, placedY) {
		return (this.inARow(pieces, placedX, placedY) >= 4)
	},
	
	//
	inARow: function(pieces, placedX, placedY) {
		
		//Make sure we're using integers. Other things mess up royally. 
		placedX = parseInt(placedX);
		placedY = parseInt(placedY);
		
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