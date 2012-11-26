
function RecursiveAI(game){
	//create reference to the game calling us:
	this.parent = game;
	//Copy the board:
	this.board = deepCopy(this.parent.board);
	this.bestMove = this.findBestMove();
	return this.bestMove;
}
RecursiveAI.prototype = {
	findBestMove: function(){
		//Quick utility function:
		var arrays_equal = function(a,b) { return !(a<b || b<a); };
		var emptyboard = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]];
		
		if(arrays_equal(emptyboard, this.board)){
			//Start with a random drop:
			return Math.round(Math.random() * 6);
		}

		var bestMoves = [0, 0, 0, 0, 0, 0, 0];
		this.bestMoves = this.calculateMoves(this.board, bestMoves, 7, 1, this.parent.player);
		while(this.bestMoves.indexOf(0) > -1){
			//We always have to play. Sometimes, the recursive AI will return a move that is impossible to play as technically the highest value (all other values being negative).
			//This drops the non-playable values to negative infinity, which will always be lower than the other numbers.
			//Yes, it's a hack. But yes, it works.
			this.bestMoves[this.bestMoves.indexOf(0)] = -Infinity;
		}
		return this.bestMoves.indexOf(Math.max.apply(this, this.bestMoves));
	},
	calculateMoves: function(board, bestMoves, depth, layer, player){
		var bm = [0, 0, 0, 0, 0, 0, 0];
		
		board = deepCopy(board);
		if(layer > depth){
			return bestMoves;
		}
		
		var neg = (player !== this.parent.player ? -1 : 1);
		
		var otherPlayer;
		player === 1 ? otherPlayer = 2 : otherPlayer = 1;
		for(var i = 0; i < 7; i++){
			if(this.parent.canDrop(i, board)){
				var simdrop2 = this.parent.simulateDrop(i, board, player);
				var simdrop1 = this.parent.simulateDrop(i, board, otherPlayer);
				if(this.parent.isVictory(simdrop2.board, simdrop2.x, simdrop2.y)){
					//NOTE: We could return here, because this is always the best move. But we wont. Because fuck you I'm a bus
					bm[i] += (neg) * (1000/layer);
				}
				if(this.parent.isVictory(simdrop1.board, simdrop1.x, simdrop1.y)){
					bm[i] += (neg) * (100/layer);
				}
				var row = this.parent.inARow(simdrop2.board, simdrop2.x, simdrop2.y)
				bm[i] += (neg) * (row/layer);
				var row = this.parent.inARow(simdrop1.board, simdrop1.x, simdrop1.y)
				bm[i] += (neg) * ((row/2)/layer);
			}
		}
		
		var best = bm.indexOf(Math.max.apply(this, bm));
		board = this.parent.simulateDrop(best, board, player).board;
		
		for(var j = 0; j < 7; j++){
			bestMoves[j] += bm[j];
		}
		
		for(var j = 0; j < 7; j++){
			//Win:
			if(bestMoves[j] >= 1000){
				return bestMoves;
			}
		}
		
		player === 1 ? player = 2 : player = 1;
		return this.calculateMoves(board, bestMoves, depth, layer+2, player);
	}
}
