var rs = require('readline-sync');
var cg = require('console-grid');

// rs.question('Ask a question and listen for a response.');
// rs.keyInYN('Ask a yes or no question.');
// rs.keyInSelect(array, 'Gives a list of options to choose from and returns the index.');
// rs.prompt('The user inputs whatever they want.');


// rs.question('Press enter to begin... ');


/***************************** GAME SETUP *****************************/
const columnHeader = ['A','B','C','D','E','F','G','H','I','J'];
const gridSize = 3;
const rows = [];
const columns = [{
  "id": "name",
  "name": ""
}];

const ships = new Map();
const allShipCoordinates = [];
const shipCount = 2;

const strikeLocations = [];


function buildGrid(dimensions = 3) {
  // Verifies the 'size' is between 3 and 10.
  if (dimensions > 10) {
    dimensions = 10;
  } else if (dimensions < 3) {
    dimensions = 3;
  }
  
  // Adds columns to the 'columns' list.
  for (let i = 0; i < dimensions; i++) {
    columns.push( 
      {
        "id": "value",
        "name": columnHeader[i]
      },
      )
    }
    
  // Adds rows to the 'rows' list while checking for the last row.
  for (let i = 0; i < dimensions; i++) {
    if (dimensions - i === 1) {
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
  
  // Generate grid in the console.
  cg({
    "columns": columns,
    "rows": rows,
  });
}

function addShips(amount = 2) {
  for (let i = 0; i < amount; i++) {
    ships.set(`ship${i + 1}`, '');
  }
}

function pickCoordinates(dimensions = 3) {
  const coordinate1 = Math.floor(Math.random() * dimensions);
  const coordinate2 = Math.floor(Math.random() * dimensions);
  return `${(columnHeader[coordinate1]).toLowerCase()}${coordinate2 + 1}`;
}

function placeShips() {
  for (let [ship, location] of ships) {
    let coordinates = pickCoordinates(gridSize);
    while (allShipCoordinates.includes(coordinates)) {
      coordinates = pickCoordinates();
    }
    ships.set(ship, coordinates);
    allShipCoordinates.push(coordinates);
  }
}
/******************************************************************/


/***************************** GAME PLAY *****************************/
// Debugging and safeguards
// Check the strike input to make sure it's valid (verifyStrikeLocation() returns true or false).

function strike() {
  let strikeLocation = rs.question('Enter a location to strike. ').toLowerCase();
  if (verifyStrikeLocation(strikeLocation)) {
    for (let [ship, location] of ships) {
      if (strikeLocation === location) {
        ships.delete(ship);
        console.log(`Hit. You have sunk a battleship. Remaining ships: ${ships.size}.`);
        if (ships.size === 0) {
          break;
        } else {
          strikeLocations.push(strikeLocation);
          strike();
        }
      } else if (strikeLocations.includes(strikeLocation)) {
        console.log('You have already picked this location. Miss!');
        strikeLocations.push(strikeLocation);
        strike();
      } else {
        console.log('You have missed!');
        strikeLocations.push(strikeLocation);
        strike();
      }
    }
  } else {
    console.log('That is not a valid location.');
    strike();
  }
}

// Split the strike location into an array and check if the letter is in
// the 'columns' list and if the number is in the 'rows' list.
function verifyStrikeLocation(str) {
  newStr = str.toUpperCase();
  const arr = [...newStr];
  let rowCheck = false;
  let columnCheck = false;
  for (let i = 0; i < gridSize; i++) {
    if (arr[0] == columns[`${i + 1}`].name) {
      columnCheck = true;
    }
    if (arr[1] == rows[`${i * 2}`].name) {
      rowCheck = true;
    }
  }
  if (columnCheck && rowCheck && arr.length === 2) {
    return true;
  } else {
    return false;
  }
}

function endGame() {
  const playAgain = rs.keyInYN('You have destroyed all battleships. Would you like to play again?');
  if (playAgain) {
    startGame();
  } else {
    console.log(`
    
                              Thanks for playing!
    `);
  }
}

function startGame() {
  addShips(shipCount);
  buildGrid(gridSize);
  placeShips();
  strike();
  endGame();
}

/******************************************************************/

startGame();