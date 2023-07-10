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


rs.question('Press enter to begin... ');

const columnHeader = ['A','B','C','D','E','F','G','H','I','J'];
const rows = [];
const columns = [{
  "id": "name",
  "name": ""
}];

function buildGrid(size = 3) {
  // Verifies the 'size' is between 3 and 10.
  if (size > 10) {
    size = 10;
  } else if (size < 3) {
    size = 3;
  }

  // Adds columns to the 'columns' list.
  for (let i = 0; i < size; i++) {
    columns.push( 
      {
        "id": "value",
        "name": columnHeader[i]
      },
      )
    }
    
  // Adds rows to the 'rows' list while checking for the last row.
  for (let i = 0; i < size; i++) {
    if (size - i === 1) {
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

buildGrid();

// Generate the grid in the console.
cg({
  "columns": columns,
  "rows": rows,
});  