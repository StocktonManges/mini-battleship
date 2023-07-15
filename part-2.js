var rs = require('readline-sync');
var cg = require('console-grid');


/***************************** GAME SETUP *****************************/
// placeShip() calls pickCoordinates.
//    placeShip() arguments: (shipLength)

// pickCoordinates() returns an array that represents the ship.

// placeShip() calls checkCoordinates() (which is a consolidated
// checkVertical() and checkHorizontal()) which checks if it fits on
// grid or is overlapping another ship and returns boolean.
//    true => placeShip() adds the array to the map and the coordinates to the allShipCoordinates array.
//    false => call pickCoordinates() again with same information (use a while loop and a variable).

const gridSize = 10;
const rowHeader = ['A','B','C','D','E','F','G','H','I','J'];
let activeRowHeader = createActiveRowHeaderList(gridSize, rowHeader);
let rows = [];
let columns = [{
  "id": "name",
  "name": ""
}];

const ships = new Map();
let allShipCoordinates = [];
const shipLengths = [2, 3, 3, 4, 5];

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

function createActiveRowHeaderList(size, array) {
  let activeRowHeader = array.filter((header) => array.indexOf(header) < size);
  return activeRowHeader;
}

// Generates random sequences of adjacent coordinates based on the
// 'shipLength' argument.
function pickCoordinates(size = 5, shipLength) {
  const coordinate1 = Math.floor(Math.random() * size);
  const coordinate2 = Math.floor(Math.random() * size) + 1;
  const shipHead = `${(rowHeader[coordinate1])}${coordinate2}`;
  if (Math.floor(Math.random() * 2) === 0) {
    let checkH = checkHorizontal(shipHead, shipLength);
    if (typeof checkH === 'object') {
      return checkH;
    } else {
      checkH = checkHorizontal(shipHead, shipLength);
    }
  } else {
    let checkV = checkVertical(shipHead, shipLength);
    if (typeof checkV === 'object') {
      return checkV;
    } else {
      checkV = checkVertical(shipHead, shipLength);
    }
  }
}

function checkHorizontal(coordinate, length) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    let potCoordinate = [coordinate[0], Number(coordinate[1]) + i];
    if (allShipCoordinates.includes(potCoordinate[0] + potCoordinate[1].toString()) || potCoordinate[1] > gridSize) {
      return false;
    } else {
      arr.push(potCoordinate[0] + potCoordinate[1].toString());
    }
  }
  return arr;
}

function checkVertical(coordinate, length) {
  const arr = [];
  const rowStart = rowHeader.indexOf(coordinate[0]);
  for (let i = 0; i < length; i++) {
    const potCoordinate = `${rowHeader[rowStart + i]}${coordinate[1]}`;
    if (allShipCoordinates.includes(potCoordinate) || !activeRowHeader.includes(potCoordinate[0])) {
      return false;
    } else {
      arr.push(potCoordinate);
    }
  }
  return arr;
}

// Assigns coordinates to each 'ship' key in the 'ships' Map.
function placeShip(map, shipNum, size = 5, shipLength) {
  const shipArray = pickCoordinates(size, shipLength);
  return shipArray;
  // // Add the ship to the 'allShipCoordinates' array.
  // for (let coordinate of shipArray) {
  //   allShipCoordinates.push(coordinate);
  // }
  // map.set(shipNum, shipArray);
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
  for (let i in shipLengths) {
    let shipPlaced = placeShip(ships, `ship${i + 1}`, gridSize, shipLengths[i]);
    // if (!shipPlaced) {
    //   shipPlaced = placeShip(ships, `ship${i + 1}`, gridSize, shipLengths[i]);
    // }
    console.log(shipPlaced);
  }
  strike();
  endGame();
}

/******************************************************************/

startGame();
