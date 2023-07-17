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
  // This picks a random coordinate pair. The '+ item' at the end will
  // add '0' the first time around and '1' the second time around so
  // that the column number is accurate while also getting the row
  // header index for the coordinate pair.
  const [coordinate1, coordinate2] = [0, 1].map((item) => Math.floor(Math.random() * size) + item);
  // Choose vertical or horizontal randomly.
  /* CHANGED */
  const arr = [];
  for (let i = 0; i < shipLength; i++) {
    const tail = Math.floor(Math.random() * 2) === 0
      ? `${rowHeader[coordinate1]}${coordinate2 + i}`
      : `${rowHeader[coordinate1 + i]}${coordinate2}`
    arr.push(tail);
  }
  return arr;
}

// Checks if each coordinate in the 'shipArray' fits on the grid and if
// it is overlapping another ship.
function checkCoordinates(size, shipArray) {
  let num = null;
  for (let coordinate of shipArray) {
    /* CHANGED */
    num = coordinate.length === 3 ? coordinate[1] + coordinate[2] : coordinate[1]
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
  let strikeLocation = rs.question(`
Enter a location to strike. `).toUpperCase();
  if (verifyStrikeLocation(strikeLocation)) {
    if (strikeLocations.includes(strikeLocation)) {
      console.log('You have already picked this location. Miss!');
      strike();
    } else {
      let i = 0;
      for (let [shipNumber, shipArray] of ships) {
        for (let coordinateIndex in shipArray) {
          console.log(`compare ${strikeLocation} to ${shipArray[coordinateIndex]}`);
          if (strikeLocation === shipArray[coordinateIndex]) {
            shipArray.splice(coordinateIndex, 1);
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
          return;
        }
      }
    }    
  } else {
    console.log('That is not a valid location.');
    strike();
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
  columns = [{
    "id": "name",
    "name": ""
  }];
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
  endGame();
}

/******************************************************************/

startGame();