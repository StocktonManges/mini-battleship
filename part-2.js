var rs = require('readline-sync');
var cg = require('console-grid');


/***************************** GAME SETUP *****************************/
// Troubleshoot checkVertical and checkHorizontal (is it always returning true because of the 'return true;' statement?).
// Call pickCoordinates inside placeShips for each ship being placed.
// Add an array of coordinates for each ship in the 'ships' Map.

const rowHeader = ['A','B','C','D','E','F','G','H','I','J'];
const gridSize = 5;
let rows = [];
let columns = [{
  "id": "name",
  "name": ""
}];

const ships = new Map();
let allShipCoordinates = [];
const shipCount = 5;

let strikeLocations = [];


function buildGrid(size = 5) {
  // Verifies the 'size' is between 5 and 10.
  if (size > 10) {
    size = 10;
  } else if (size < 5) {
    size = 5;
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

// Adds key-value pairs to the 'ships' Map (the value is empty).
function addShips(amount = 2) {
  for (let i = 0; i < amount; i++) {
    ships.set(`ship${i + 1}`, '');
  }
}

// Generates random sequences of adjacent coordinates based on the
// 'shipLength' argument.
function pickCoordinates(size = 5, shipLength) {
  const coordinate1 = Math.floor(Math.random() * size);
  const coordinate2 = Math.floor(Math.random() * size);
  const shipHead = `${(rowHeader[coordinate1])}${coordinate2 + 1}`;
  if (Math.floor(Math.random() * 2) === 0) {
    checkHorizontal(shipHead, shipLength);
  } else {
    checkVertical(shipHead, shipLength);
  }
}

function checkHorizontal(coordinate, shipLength) {
  for (let i = 0; i < shipLength; i++) {
    const potCoordinate = `${coordinate[0]}${Number(coordinate[1]) + i}`;
    if (
      allShipCoordinates.includes(potCoordinate) 
      || potCoordinate[1] > gridSize) {
        return false;
      }
  }
  return true;
}

function checkVertical(coordinate, shipLength) {
  const letterStart = rowHeader.indexOf(coordinate[0]);
  for (let i = 0; i < shipLength; i++) {
    const potCoordinate = `${rowHeader[letterStart + i]}${coordinate[1]}`;
    console.log(potCoordinate);
    if (
      allShipCoordinates.includes(potCoordinate) 
      || letterStart + i > gridSize) {
        return false;
      }
  }
  return true;
}

// Assigns coordinates to each 'ship' key in the 'ships' Map.
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

// Split the strike location into an array and check if the letter is in
// the 'columns' list and if the number is in the 'rows' list.
function verifyStrikeLocation(str) {
  const arr = [...str];
  let rowCheck = false;
  let columnCheck = false;
  for (let i = 0; i < gridSize; i++) {
    if (arr[0] == rows[`${i * 2}`].name) {
      rowCheck = true;
    }
    if (arr[1] == columns[`${i + 1}`].name) {
      columnCheck = true;
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
  addShips(shipCount);
  buildGrid(gridSize);
  placeShips();
  strike();
  endGame();
}

/******************************************************************/

// startGame();

buildGrid(gridSize);
console.log(checkVertical('E5', 2));
