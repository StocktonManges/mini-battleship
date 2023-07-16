var rs = require('readline-sync');
var cg = require('console-grid');


/***************************** GAME SETUP *****************************/

const gridSize = 5;
const rowHeader = ['A','B','C','D','E','F','G','H','I','J'];
const activeRowHeader = createActiveRowHeaderList(gridSize, rowHeader);
const shipLengths = [2, 3, 3];

// Values to reset after each game:
const ships = new Map();
let columns = ['',];
let rows = [];
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
  for (let i = 1; i <= size; i++) {
    columns.push(i.toString());
  }

  // Adds row headers, inner borders and the appropriate number of
  // spaces to each row.
  for (let i = 0; i < size * 2 - 1; i++) {
    if (i % 2 === 0) {
      let spaces = [];
      for (let x = 0; x < size; x++) {
        spaces.push('',);
      }
      rows.push(
        [`${activeRowHeader[i / 2]}`, ...spaces]
      );
    } else {
      rows.push({ innerBorder: true });
    }
  }
}

// Generates grid in the console.
function logGrid() {
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

// Asks the player to guess locations until all ships are deleted from
// the 'ships' Map.
function strike() {
  logGrid();
  let strikeLocation = rs.question(`
Enter a location to strike. `).toUpperCase();
  if (verifyStrikeLocation(strikeLocation)) {
    if (strikeLocations.includes(strikeLocation)) {
      console.log('You have already picked this location. Miss!');
    } else {
      let i = 0;
      for (let [shipNumber, shipArray] of ships) {
        for (let coordinateIndex in shipArray) {
          if (strikeLocation === shipArray[coordinateIndex]) {
            shipArray.splice(coordinateIndex, 1);
            updateGrid(strikeLocation, true);
            if (shipArray.length === 0) {
              ships.delete(shipNumber);
              console.log(`Hit! You have sunk a battleship. Remaining ships: ${ships.size}.`);
              strikeLocations.push(strikeLocation);
              return;
            } else {
              console.log(`Hit! Remaining ships: ${ships.size}.`);
              strikeLocations.push(strikeLocation);
              return;
            }
          }
        }
        i++;
        if (i === ships.size) {
          strikeLocations.push(strikeLocation);
          console.log(`Miss! Remaining ships: ${ships.size}.`);
          updateGrid(strikeLocation, false);
          return;
        }
      }
    }    
  } else {
    console.log('That is not a valid location.');
  }
}

// Split the 'strikeLocation' into an array, then check the letter and
// number separately to see if it falls within the established grid.
function verifyStrikeLocation(coordinate) {
  let arr = [...coordinate];
  // Concatenates '1' and '0' if 'strikeLocation' is in column 10.
  if (arr[1] + arr[2] === '10') {
    arr = [arr[0], '10'];
  }
  return (
    activeRowHeader.includes(arr[0]) 
    && arr[1] <= gridSize
    && arr[1] > 0
    && activeRowHeader.indexOf(arr[0]) < gridSize 
    && activeRowHeader.indexOf(arr[0]) >= 0 
    && arr.length === 2
    );
}

// Takes a coordinate and a boolean as arguments and adds an 'X' or 'O'
// depending on the boolean argument.
function updateGrid(coordinate, boolean) {
  let arr = [...coordinate];
  // Concatenates '1' and '0' if 'strikeLocation' is in column 10.
  if (arr[1] + arr[2] === '10') {
    arr = [arr[0], 10];
  } else {
    arr = [arr[0], Number(arr[1])];
  }
  if (boolean) {
    rows[activeRowHeader.indexOf(arr[0]) * 2][arr[1]] = 'X';
  } else {
    rows[activeRowHeader.indexOf(arr[0]) * 2][arr[1]] = 'O';
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

function reset() {
  rows = [];
  columns = ['',];
  ships.clear();
  allShipCoordinates = [];
  strikeLocations = [];
}

function startGame() {
  reset();
  rs.question('Press enter to begin... ');
  buildGrid(gridSize);
  placeShip(gridSize, shipLengths, allShipCoordinates, ships);
  while (ships.size > 0) {
    strike();
  }
  logGrid();
  endGame();
}

/******************************************************************/

startGame();
