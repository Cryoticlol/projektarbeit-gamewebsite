function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function rollDice() {
    let randomNumOne = Math.floor(getRandomArbitrary(1,7));
    let randomNumTwo = Math.floor(getRandomArbitrary(1,7));

    let diceElementOne = document.getElementById("die-1");
    let diceElementTwo = document.getElementById("die-2");
    
    diceElementOne.dataset.value = randomNumOne;
    diceElementTwo.dataset.value = randomNumTwo;
    
    let dicesum = randomNumOne + randomNumTwo;
    
    rollButton.disabled = true;
    let tiles = document.querySelectorAll(".tile");
    tiles.forEach(enableTile);
}

function enableTile(tile) {
    tile.disabled = false;
}

let rollButton = document.getElementById("roll-button");
rollButton.addEventListener("click", rollDice);
