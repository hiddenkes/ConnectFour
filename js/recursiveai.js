
function AI2(game){
	//create reference to the game calling us:
	this.parent = game;
	//Copy the board:
	this.board = deepCopy(this.parent.board);
	console.log(this);
	this.bestMove = this.findBestMove();
	return this.bestMove;
}
AI2.prototype = {
	findBestMove: function(){
		var bestMoves = [0, 0, 0, 0, 0, 0, 0];
		this.bestMoves = this.calculateMoves(this.board, bestMoves, 4, 1, 2);
		return this.bestMoves.indexOf(Math.max.apply(this, this.bestMoves));
	},
	calculateMoves: function(board, bestMoves, depth, layer, player){
		var bm = [0, 0, 0, 0, 0, 0, 0];
		
		board = deepCopy(board);
		if(layer > depth){
			return bestMoves;
		}
		
		var otherPlayer;
		player === 1 ? otherPlayer = 2 : otherPlayer = 1;
		for(var i = 0; i < 7; i++){
			if(this.parent.canDrop(i, board)){
				var simdrop2 = this.parent.simulateDrop(i, board, player);
				var simdrop1 = this.parent.simulateDrop(i, board, otherPlayer);
				if(this.parent.isVictory(simdrop2.board, simdrop2.x, simdrop2.y)){
					//NOTE: We could return here, because this is always the best move. But we wont. Because fuck you I'm a bus
					bm[i] += (1000/layer);
				}
				if(this.parent.isVictory(simdrop1.board, simdrop1.x, simdrop1.y)){
					bm[i] += (100/layer);
				}
				var row = this.parent.inARow(simdrop2.board, simdrop2.x, simdrop2.y)
				bm[i] += (row/layer);
				var row = this.parent.inARow(simdrop1.board, simdrop1.x, simdrop1.y)
				bm[i] += ((row/2)/layer);
			}
		}
		
		player === 1 ? player = 2 : player = 1;
		var best = bm.indexOf(Math.max.apply(this, bm));
		board = this.parent.simulateDrop(best, board, player).board;
		
		for(var j = 0; j < 7; j++){
			bestMoves[j] += bm[j];
		}
		
		return this.calculateMoves(board, bestMoves, depth, layer+1, player);
	}
}
