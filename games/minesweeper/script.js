//minesweeper game by 101computing.net - www.101computing.et/minesweeper-in-javascript/
//erweitert um: Flaggen per Rechtsklick und Groessenauswahl
var grid = document.getElementById("grid");
var testMode = false; //Turn this variable to true to see where the mines are

//Groessen: Anzahl Zeilen/Spalten und Anzahl Minen
var sizes = {
  small:  { size: 8,  mines: 10 },
  medium: { size: 12, mines: 25 },
  large:  { size: 16, mines: 40 }
};
var size = 10;
var mineTotal = 20;
var gameOver = false;

generateGrid();

function generateGrid() {
  //Groesse aus dem Dropdown lesen
  var choice = document.getElementById("size").value;
  size = sizes[choice].size;
  mineTotal = sizes[choice].mines;
  gameOver = false;

  //generate size by size grid
  grid.innerHTML="";
  for (var i=0; i<size; i++) {
    row = grid.insertRow(i);
    for (var j=0; j<size; j++) {
      cell = row.insertCell(j);
      cell.onclick = function() { clickCell(this); };
      cell.oncontextmenu = function(event) {
        event.preventDefault(); //kein Browser-Menue bei Rechtsklick
        toggleFlag(this);
      };
      var mine = document.createAttribute("data-mine");
      mine.value = "false";
      cell.setAttributeNode(mine);
    }
  }
  addMines();
}

function addMines() {
  //Add mines randomly (nur auf Felder, die noch keine Mine haben)
  var placed = 0;
  while (placed < mineTotal) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    var cell = grid.rows[row].cells[col];
    if (cell.getAttribute("data-mine")=="false") {
      cell.setAttribute("data-mine","true");
      if (testMode) cell.innerHTML="X";
      placed++;
    }
  }
}

function toggleFlag(cell) {
  //Flagge setzen oder entfernen (nur auf verdeckten Feldern)
  if (gameOver || cell.className=="clicked") return;
  if (cell.className=="flag") {
    cell.className="";
    cell.innerHTML="";
  } else {
    cell.className="flag";
    cell.innerHTML="F";
  }
}

function revealMines() {
    //Highlight all mines in red
    for (var i=0; i<size; i++) {
      for(var j=0; j<size; j++) {
        var cell = grid.rows[i].cells[j];
        if (cell.getAttribute("data-mine")=="true") {
          cell.className="mine";
          cell.innerHTML="*";
        }
      }
    }
}

function checkLevelCompletion() {
  var levelComplete = true;
    for (var i=0; i<size; i++) {
      for(var j=0; j<size; j++) {
        var cell = grid.rows[i].cells[j];
        if ((cell.getAttribute("data-mine")=="false") && (cell.className!="clicked")) levelComplete=false;
      }
  }
  if (levelComplete) {
    gameOver = true;
    revealMines();
    alert("You Win!");
  }
}

function clickCell(cell) {
  //Geflaggte oder schon aufgedeckte Felder ignorieren
  if (gameOver || cell.className=="flag" || cell.className=="clicked") return;
  //Check if the end-user clicked on a mine
  if (cell.getAttribute("data-mine")=="true") {
    gameOver = true; //Spiel einfrieren
    revealMines();
  } else {
    cell.className="clicked";
    //Count and display the number of adjacent mines
    var mineCount=0;
    var cellRow = cell.parentNode.rowIndex;
    var cellCol = cell.cellIndex;
    for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,size-1); i++) {
      for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,size-1); j++) {
        if (grid.rows[i].cells[j].getAttribute("data-mine")=="true") mineCount++;
      }
    }
    cell.innerHTML = mineCount > 0 ? mineCount : ""; //0 als leeres Feld anzeigen
    if (mineCount==0) {
      //Reveal all adjacent cells as they do not have a mine
      for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,size-1); i++) {
        for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,size-1); j++) {
          //Recursive Call
          clickCell(grid.rows[i].cells[j]);
        }
      }
    }
    checkLevelCompletion();
  }
}
