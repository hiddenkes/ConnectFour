function AI(game){
	//create reference to the game calling us:
	this.parent = game;
	this.difficulty = this.parent.difficulty;
	//Copy the board:
	this.board = deepCopy(this.parent.board);
	this.bestMove = this.findBestMove();
}
AI.prototype = {
	findBestMove: function(){
		this.bestMoves = this.calculateMoves();
		this.techBest = this.bestMoves.indexOf(Math.max.apply(this, this.bestMoves));
		var possible = [];
		for(var i=0; i<this.bestMoves.length; i++){
			if(this.bestMoves[i] > 0){
				possible.push(i);
			}
		}
		if(this.difficulty === "normal"){
			//On normal difficulty, use the best move 80% of the time.
			if(Math.random() > 0.2){
				return this.bestMoves.indexOf(Math.max.apply(this, this.bestMoves));
			}else{
				return possible[Math.round(Math.random() * (possible.length-1))];
			}
		}else if(this.difficulty === "easy"){
			//On easy difficulty, use the best move 40% of the time.
			if(Math.random() > 0.6){
				return this.bestMoves.indexOf(Math.max.apply(this, this.bestMoves));
			}else{
				return possible[Math.round(Math.random() * (possible.length-1))];
			}
		}else{
			return this.bestMoves.indexOf(Math.max.apply(this, this.bestMoves));
		}
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