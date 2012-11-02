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