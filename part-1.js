var rs = require('readline-sync');
var cg = require('console-grid');

// rs.question('Ask a question and listen for a response.');
// rs.keyInYN('Ask a yes or no question.');
// rs.keyInSelect(array, 'Gives a list of options to choose from and returns the index.');
// rs.prompt('The user inputs whatever they want.');


/***************************** TO DOS *****************************/
// Choose the size of the board.
// Place two ships on the board.
// Player starts guessing locations.
// Player is prompted to quit or play again.
/******************************************************************/


// rs.question('Press enter to begin... ');


/***************************** GAME SETUP *****************************/
const columnHeader = ['A','B','C','D','E','F','G','H','I','J'];
const gridSize = 3;
const rows = [];
const columns = [{
  "id": "name",
  "name": ""
}];

const ships = {};
const allShipCoordinates = [];
const shipCount = 2;


function buildGrid(gridSize = 3) {
  // Verifies the 'size' is between 3 and 10.
  if (gridSize > 10) {
    gridSize = 10;
  } else if (gridSize < 3) {
    gridSize = 3;
  }
  
  // Adds columns to the 'columns' list.
  for (let i = 0; i < gridSize; i++) {
    columns.push( 
      {
        "id": "value",
        "name": columnHeader[i]
      },
      )
    }
    
    // Adds rows to the 'rows' list while checking for the last row.
    for (let i = 0; i < gridSize; i++) {
      if (gridSize - i === 1) {
        rows.push(
          {
            "name": i + 1,
            "value": ''
          }
          )
        } else {
          rows.push(
            {
              "name": i + 1,
              "value": ''
            },
            { "innerBorder": true }
            )
          }
        }
}

function addShips(shipCount = 2) {
  for (let i = 0; i < shipCount; i++) {
    ships[`ship${i + 1}`] = '';
  }
}

function pickCoordinates(gridSize = 3) {
  const coordinate1 = Math.floor(Math.random() * gridSize);
  const coordinate2 = Math.floor(Math.random() * gridSize);
  return `${columnHeader[coordinate1]}${coordinate2 + 1}`;
}

function placeShips() {
  for (let i = 0; i < shipCount; i++) {
    let coordinates = pickCoordinates(gridSize);
    while (allShipCoordinates.includes(coordinates)) {
      coordinates = pickCoordinates();
    }
    ships[`ship${i + 1}`] = coordinates;
    allShipCoordinates.push(coordinates);    
  }
}
/******************************************************************/


/***************************** GAME PLAY *****************************/
// Player picks location.
// Check if location is correct.
// If correct, remove ship from object.
/******************************************************************/

addShips(shipCount);
buildGrid(gridSize);
placeShips();

// Generate the grid in the console.
// cg({
//   "columns": columns,
//   "rows": rows,
// });  