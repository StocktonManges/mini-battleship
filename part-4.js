var rs = require('readline-sync');
var cg = require('console-grid');


/***************************** GAME SETUP *****************************/

/* CHANGED */
const rowHeader = 'ABCDEFGHIJ'.split('');
let gridSize = null;
let shipLengths = [];
const gridAndShipSizes = {
  '100': [2, 3, 3, 4, 5],
  '25': [2, 3, 4],
  '9': [2, 3],
}

// Values to reset after each game:
let columns = ['',];
let rows = [];
const enemyShips = new Map();
let enemyShipCoordinates = [];
let playerStrikeLocations = [];
const playerShips = new Map();
let playerShipCoordinates = [];
let enemyStrikeLocations = [];

// Prompts player to pick a grid size from a list of options and then
// the number of ships is calculated.
function pickGridSize() {
  const gridSizeOptions = [9, 25, 100];
  const index = rs.keyInSelect(gridSizeOptions, 'Choose the grid size you wish to play on: ');
  gridSize = Math.sqrt(gridSizeOptions[index]);
  shipLengths = gridAndShipSizes[`${gridSizeOptions[index]}`];
  return index === -1;
}

function buildGrid(size, headersArray) {
  // Adds column headers to the 'columns' list.
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
        [`${headersArray[i / 2]}`, ...spaces]
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
  const num1 = Math.floor(Math.random() * size);
  const num2 = Math.floor(Math.random() * size) + 1;
  // Choose vertical or horizontal randomly.
  if (Math.floor(Math.random() * 2) === 0) {
    const arrHorizontal = [];
    for (let i = 0; i < shipLength; i++) {
      arrHorizontal.push(`${rowHeader[num1]}${num2 + i}`);
    }
    return arrHorizontal;
  } else {
    const arrVertical = [];
    for (let i = 0; i < shipLength; i++) {
      arrVertical.push(`${rowHeader[num1 + i]}${num2}`);
    }
    return arrVertical;
  }
}

// Checks if each coordinate in the 'shipArray' fits on the grid and if
// it is overlapping another ship.
function checkCoordinates(size, shipArray, shipCoordinatesArray, headersArray) {
  let num = null;
  for (let coordinate of shipArray) {
    if (coordinate.length === 3) {
      num = coordinate[1] + coordinate[2];
    } else {
      num = coordinate[1];
    }
    if (
      shipCoordinatesArray.includes(coordinate)
      || !headersArray.includes(coordinate[0])
      || num > size
      ) {
        return false;
      }
  }
  return true;
}

// Assigns coordinates to each 'ship' key in the 'ships' Map.
function placeShips(size, lengthsArray, shipCoordinatesArray, map, headersArray) {
  for (let i in lengthsArray) {
    let readyToPlace = false;
    let shipArray = [];
    while (!readyToPlace) {
      shipArray = pickCoordinates(size, lengthsArray[i]);
      readyToPlace = checkCoordinates(size, shipArray, shipCoordinatesArray, headersArray);
    }
    shipCoordinatesArray.push(...shipArray);
    map.set(`ship${Number(i) + 1}`, shipArray);
  }
}

/******************************************************************/


/***************************** GAME PLAY *****************************/

// Asks the player to guess locations until all ships are deleted from
// the 'ships' Map.
function playerStrike(headersArray) {
  console.log(`
  
          PLAYER TURN
*******************************`)
  logGrid();
  let strikeLocation = rs.question(`Enter a location to strike. `).toUpperCase();
  if (verifyStrikeLocation(strikeLocation, headersArray)) {
    if (playerStrikeLocations.includes(strikeLocation)) {
      console.log('You have already picked this location. Miss!');
      return true;
    } else {
      let i = 0;
      for (let [shipNumber, shipArray] of enemyShips) {
        for (let coordinateIndex in shipArray) {
          if (strikeLocation === shipArray[coordinateIndex]) {
            shipArray.splice(coordinateIndex, 1);
            updateGrid(strikeLocation, true, headersArray);
            if (shipArray.length === 0) {
              enemyShips.delete(shipNumber);
              console.log(`Hit! You have sunk a battleship. Remaining enemy battleships: ${enemyShips.size}.`);
              playerStrikeLocations.push(strikeLocation);
              return true;
            } else {
              console.log(`Hit! Remaining enemy battleships: ${enemyShips.size}.`);
              playerStrikeLocations.push(strikeLocation);
              return true;
            }
          }
        }
        i++;
        if (i === enemyShips.size) {
          playerStrikeLocations.push(strikeLocation);
          console.log(`Miss! Remaining enemy battleships: ${enemyShips.size}.`);
          updateGrid(strikeLocation, false, headersArray);
          return true;
        }
      }
    }    
  } else {
    console.log('That is not a valid location.');
    return false;
  }
}

function enemyStrike(size, headersArray) {
  console.log(`

          ENEMY TURN
*******************************`);
  let enemyFired = false;
  let strikeLocation = '';
  while (!enemyFired) {
    let num1 = Math.floor(Math.random() * size);
    let num2 = Math.floor(Math.random() * size) + 1;
    strikeLocation = `${headersArray[num1]}${num2}`;
    if (!enemyStrikeLocations.includes(strikeLocation)) {
      enemyStrikeLocations.push(strikeLocation);
      console.log(`The enemy has fired at ${strikeLocation}.`)
      enemyFired = true;
    }
  }
  let i = 0;
  for (let [shipNumber, shipArray] of playerShips) {
    for (let coordinateIndex in shipArray) {
      if (strikeLocation === shipArray[coordinateIndex]) {
        shipArray.splice(coordinateIndex, 1);
        if (shipArray.length === 0) {
          playerShips.delete(shipNumber);
          console.log(`Hit! The enemy has sunk a battleship. Your remaining battleships: ${playerShips.size}.`);
          logShips(playerShips);
          return;
        } else {
          console.log(`Hit! Your remaining battleships: ${playerShips.size}.`);
          logShips(playerShips);
          return;
        }
      }
    }
    i++;
    if (i === playerShips.size) {
      console.log(`Miss! Your remaining battleships: ${playerShips.size}.`);
      logShips(playerShips);
      return;
    }
  }
}

function logShips(shipsMap) {
  console.log(`
Your remaining ship coordinates:`);
  for (let [shipNumber, shipArray] of shipsMap) {
    console.log(`${shipNumber}: ${shipArray}`);
  }
}

// Split the 'strikeLocation' into an array, then check the letter and
// number separately to see if it falls within the established grid.
function verifyStrikeLocation(coordinate, headersArray) {
  let arr = [...coordinate];
  // Concatenates '1' and '0' if 'strikeLocation' is in column 10.
  if (arr[1] + arr[2] === '10') {
    arr = [arr[0], '10'];
  }
  return (
    headersArray.includes(arr[0]) 
    && arr[1] <= gridSize
    && arr[1] > 0
    && headersArray.indexOf(arr[0]) < gridSize 
    && headersArray.indexOf(arr[0]) >= 0 
    && arr.length === 2
    );
}

// Takes a coordinate and a boolean as arguments and adds an 'X' or 'O'
// depending on the boolean argument.
function updateGrid(coordinate, boolean, headersArray) {
  let arr = [...coordinate];
  // Concatenates '1' and '0' if 'strikeLocation' is in column 10.
  if (arr[1] + arr[2] === '10') {
    arr = [arr[0], 10];
  } else {
    arr = [arr[0], Number(arr[1])];
  }
  if (boolean) {
    rows[headersArray.indexOf(arr[0]) * 2][arr[1]] = 'X';
  } else {
    rows[headersArray.indexOf(arr[0]) * 2][arr[1]] = 'O';
  }
}

function endGame() {
  if (enemyShips.size === 0) {
    logGrid();
    console.log(`
You've successfully destroyed all enemy battleships! Your remaining battleships: ${playerShips.size}.`)
  } else {
    console.log(`
The enemy has destroyed all of your battleships!`)
  }

  const playAgain = rs.keyInYN(`
Would you like to play again?`);
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
  gridSize = null;
  shipLengths = [];
  enemyShips.clear();
  enemyShipCoordinates = [];
  playerStrikeLocations = [];
  playerShips.clear();
  playerShipCoordinates = [];
  enemyStrikeLocations = [];
}

function startGame() {
  reset();
  let endedEarly = pickGridSize();
  if (endedEarly) {
    console.log(`
Thanks for thinking about playing... I guess... 
=(`);
  } else {
    let activeRowHeader = createActiveRowHeaderList(gridSize, rowHeader);
    rs.question('Press enter to begin... ');
    buildGrid(gridSize, activeRowHeader);
    placeShips(gridSize, shipLengths, enemyShipCoordinates, enemyShips, activeRowHeader);
    placeShips(gridSize, shipLengths, playerShipCoordinates, playerShips, activeRowHeader);
    while (enemyShips.size > 0 && playerShips.size > 0) {
      let playerFired = playerStrike(activeRowHeader);
      // Allows the player to fire again if an invalid coordinate was
      // entered.
      while (!playerFired) {
        playerFired = playerStrike(activeRowHeader);
      }
      if (enemyShips.size != 0) {
        enemyStrike(gridSize, activeRowHeader);
      }
    }
    endGame();
  }
}

/******************************************************************/

startGame();
