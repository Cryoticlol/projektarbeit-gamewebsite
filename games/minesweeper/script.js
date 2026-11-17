//minesweeper game by 101computing.net - www.101computing.net/minesweeper-in-javascript/
//erweitert um: Flaggen per Rechtsklick, Groessenauswahl, Minenzaehler,
//farbige Zahlen, einfache Bomben-/Flaggen-Grafik und sicheren ersten Klick
var grid = document.getElementById("grid");
var statusText = document.getElementById("status");
var minesLeftText = document.getElementById("mines-left");
var testMode = false; //Turn this variable to true to see where the mines are

//Groessen: Anzahl Zeilen/Spalten und Anzahl Minen
var sizes = {
  small:  { size: 8,  mines: 10 },
  medium: { size: 12, mines: 25 },
  large:  { size: 16, mines: 40 }
};
var size = 10;
var mineTotal = 20;
var flagCount = 0;
var gameOver = false;
var firstClick = true;

//HTML fuer die Grafiken (Aussehen kommt aus style.css)
var BOMB = '<span class="bomb"></span>';
var FLAG = '<span class="flag-icon"></span>';

generateGrid();

function generateGrid() {
  //Groesse aus dem Dropdown lesen
  var choice = document.getElementById("size").value;
  size = sizes[choice].size;
  mineTotal = sizes[choice].mines;
  flagCount = 0;
  gameOver = false;
  firstClick = true;
  setStatus("Left click = reveal, Right click = flag", "");
  updateCounter();

  //generate size by size grid
  grid.innerHTML="";
  for (var i=0; i<size; i++) {
    var row = grid.insertRow(i);
    for (var j=0; j<size; j++) {
      var cell = row.insertCell(j);
      cell.onclick = function() { clickCell(this); };
      cell.oncontextmenu = function(event) {
        event.preventDefault(); //kein Browser-Menue bei Rechtsklick
        toggleFlag(this);
      };
      cell.setAttribute("data-mine","false");
    }
  }
  //Minen werden erst beim ersten Klick verteilt (siehe clickCell)
}

function addMines(safeCell) {
  //Add mines randomly (nicht auf das erste angeklickte Feld und seine Nachbarn)
  var safeRow = safeCell.parentNode.rowIndex;
  var safeCol = safeCell.cellIndex;
  var placed = 0;
  while (placed < mineTotal) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    var nearFirstClick = Math.abs(row-safeRow)<=1 && Math.abs(col-safeCol)<=1;
    var cell = grid.rows[row].cells[col];
    if (!nearFirstClick && cell.getAttribute("data-mine")=="false") {
      cell.setAttribute("data-mine","true");
      if (testMode) cell.innerHTML="X";
      placed++;
    }
  }
}

function setStatus(text, type) {
  statusText.textContent = text;
  statusText.className = type; //"win", "lose" oder ""
}

function updateCounter() {
  minesLeftText.textContent = mineTotal - flagCount;
}

function toggleFlag(cell) {
  //Flagge setzen oder entfernen (nur auf verdeckten Feldern)
  if (gameOver || cell.className=="clicked") return;
  if (cell.className=="flag") {
    cell.className="";
    cell.innerHTML="";
    flagCount--;
  } else {
    cell.className="flag";
    cell.innerHTML=FLAG;
    flagCount++;
  }
  updateCounter();
}

function revealMines(won) {
    //Alle Minen anzeigen; falsch gesetzte Flaggen markieren
    for (var i=0; i<size; i++) {
      for(var j=0; j<size; j++) {
        var cell = grid.rows[i].cells[j];
        var isMine = cell.getAttribute("data-mine")=="true";
        if (isMine && won) {
          cell.className="flag"; //beim Gewinnen alle Minen als Flagge zeigen
          cell.innerHTML=FLAG;
        } else if (isMine && cell.className!="flag") {
          cell.className = cell.className=="hit" ? "mine hit" : "mine";
          cell.innerHTML=BOMB;
        } else if (!isMine && cell.className=="flag") {
          cell.className="wrong-flag";
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
    revealMines(true);
    flagCount = mineTotal;
    updateCounter();
    setStatus("You win! 🎉", "win");
  }
}

function clickCell(cell) {
  //Geflaggte oder schon aufgedeckte Felder ignorieren
  if (gameOver || cell.className=="flag" || cell.className=="clicked") return;
  //Beim ersten Klick Minen verteilen -> erster Klick ist immer sicher
  if (firstClick) {
    firstClick = false;
    addMines(cell);
  }
  //Check if the end-user clicked on a mine
  if (cell.getAttribute("data-mine")=="true") {
    gameOver = true; //Spiel einfrieren
    cell.className="hit"; //angeklickte Mine merken (wird rot)
    revealMines(false);
    setStatus("Boom! Game over.", "lose");
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
    cell.setAttribute("data-num", mineCount); //fuer die Farbe in style.css
    if (mineCount==0) {
      //Reveal all adjacent cells as they do not have a mine
      for (var i=Math.max(cellRow-1,0); i<=Math.min(cellRow+1,size-1); i++) {
        for(var j=Math.max(cellCol-1,0); j<=Math.min(cellCol+1,size-1); j++) {
          //Recursive Call
          clickCell(grid.rows[i].cells[j]);
        }
      }
    }
    if (!gameOver) checkLevelCompletion();
  }
}
