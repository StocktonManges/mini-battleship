var rs = require('readline-sync');
var cg = require('console-grid');

// rs.question('Ask a question and listen for a response.');
// rs.keyInYN('Ask a yes or no question.');
// rs.keyInSelect(array, 'Gives a list of options to choose from and returns the index.');
// rs.prompt('The user inputs whatever they want.');

// rs.question('Press enter to begin... ');

const columnHeader = ['A','B','C','D','E','F','G','H','I','J'];

function buildGrid(size) {
  
}

const columns = [{
  "id": "name",
  "name": ""
}, {
  "id": "value",
  "name": columnHeader[0]
}, {
"id": "value",
"name": columnHeader[1]
}, {
"id": "value",
"name": columnHeader[2]
}];

const rows = [{
  "name": "1",
  "value": ''
}, {
  "innerBorder": true
}, {
  "name": "2",
  "value": ''
}, {
"innerBorder": true
}, {
  "name": "3",
  "value": ''
}];

cg({
  "columns": columns,
  "rows": rows,
});  