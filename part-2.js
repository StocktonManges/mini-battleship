var rs = require('readline-sync');
var cg = require('console-grid');


/***************************** GAME SETUP *****************************/

const gridSize = 10;
const rowHeader = ['A','B','C','D','E','F','G','H','I','J'];
const activeRowHeader = createActiveRowHeaderList(gridSize, rowHeader);
const shipLengths = [2, 3, 3, 4, 5];

// Values to reset after each game:
const ships = new Map();
let rows = [];
let columns = [{
  "id": "name",
  "name": ""
}];
let allShipCoordinates = [];
let strikeLocations = [];


function buildGrid(size) {
  // Verifies the 'size' is between 5 and 10.
  if (size > 10) {
    size = 10;
  } else if (size < 5) {
    size;
  }
  
  // Adds columns to the 'columns' list.
  for (let i = 0; i < size; i++) {
    columns.push( 
      {
        "id": "value",
        "name": `${i + 1}`
      },
      )
    }
    
  // Adds rows to the 'rows' list while checking for the last row.
  for (let i = 0; i < size; i++) {
    if (size - i === 1) {
      rows.push(
        {
          "name": rowHeader[i],
          "value": ''
        }
        )
      } else {
        rows.push(
          {
            "name": rowHeader[i],
            "value": ''
          },
          { "innerBorder": true }
          )
        }
      }
      
      // Generates grid in the console.
      cg({
        "columns": columns,
        "rows": rows,
      });
}

function createActiveRowHeaderList(size, headersArray) {
  let activeRowHeader = headersArray.filter((header) => headersArray.indexOf(header) < size);
  return activeRowHeader;
}

// Generates random sequences of adjacent coordinates based on the
// 'shipLength' argument.
function pickCoordinates(size, shipLength) {
  const coordinate1 = Math.floor(Math.random() * size);
  const coordinate2 = Math.floor(Math.random() * size) + 1;
  // Choose vertical or horizontal randomly.
  if (Math.floor(Math.random() * 2) === 0) {
    const arrHorizontal = [];
    for (let i = 0; i < shipLength; i++) {
      arrHorizontal.push(`${rowHeader[coordinate1]}${coordinate2 + i}`);
    }
    return arrHorizontal;
  } else {
    const arrVertical = [];
    for (let i = 0; i < shipLength; i++) {
      arrVertical.push(`${rowHeader[coordinate1 + i]}${coordinate2}`);
    }
    return arrVertical;
  }
}

// Checks if each coordinate in the 'shipArray' fits on the grid and if
// it is overlapping another ship.
function checkCoordinates(size, shipArray) {
  let num = null;
  for (let coordinate of shipArray) {
    if (coordinate.length === 3) {
      num = coordinate[1] + coordinate[2];
    } else {
      num = coordinate[1];
    }
    if (
      allShipCoordinates.includes(coordinate)
      || !activeRowHeader.includes(coordinate[0])
      || num > size
      ) {
        return false;
      }
  }
  return true;
}

// Assigns coordinates to each 'ship' key in the 'ships' Map.
function placeShip(size, lengthsArray, coordinatesArray, map) {
  for (let i in lengthsArray) {
    let readyToPlace = false;
    let shipArray = [];
    while (!readyToPlace) {
      shipArray = pickCoordinates(size, lengthsArray[i]);
      readyToPlace = checkCoordinates(size, shipArray);
    }
    coordinatesArray.push(...shipArray);
    map.set(`ship${Number(i) + 1}`, shipArray);
  }
}


/******************************************************************/


/***************************** GAME PLAY *****************************/
// Asks the player to guess locations until all ships are deleted from the 'ships' Map.
function strike() {
  let strikeLocation = rs.question('Enter a location to strike. ').toUpperCase();
  if (verifyStrikeLocation(strikeLocation)) {
    // If the picked location matches a coordinate that is assigned to a
    // ship, the ship is deleted from the 'ships' Map.
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

// Split the 'strikeLocation' into an array, then check the letter and
// number separately to see if it falls within the established grid.
function verifyStrikeLocation(str) {
  let arr = [...str];
  // Concatenates '1' and '0' if 'strikeLocation' is in column 10.
  if (arr[1] + arr[2] === '10') {
    arr = [arr[0], '10'];
  }
  return (
    activeRowHeader.includes(arr[0]) 
    && arr[1] <= gridSize 
    && activeRowHeader.indexOf(arr[0]) < gridSize 
    && activeRowHeader.indexOf(arr[0]) >= 0 
    && arr.length === 2
    );
}

function endGame() {
  const playAgain = rs.keyInYN('You have destroyed all battleships. Would you like to play again?');
  if (playAgain) {
    reset();
    startGame();
  } else {
    console.log(`
    
                              Thanks for playing!
    `);
  }
}

function reset() {
  rows = [];
  columns = [{
    "id": "name",
    "name": ""
  }];
  ships.clear();
  allShipCoordinates = [];
  strikeLocations = [];
}

function startGame() {
  rs.question('Press enter to begin... ');
  buildGrid(gridSize);
  placeShip(gridSize, shipLengths, allShipCoordinates, ships);
  console.log(allShipCoordinates);
  strike();
  endGame();
}

/******************************************************************/

startGame();
