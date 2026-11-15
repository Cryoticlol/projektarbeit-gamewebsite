let diceSum = null;
let selectedNumbers = [];

function getRandomNum(min, max) {
  return Math.random() * (max - min) + min;
}

function rollDice(){
    const randomNumOne = Math.floor(getRandomNum(1, 7));
    const randomNumTwo = Math.floor(getRandomNum(1, 7));
    return [randomNumOne, randomNumTwo];
}

function showDice(values) {
    diceElements.forEach((die, index) => {
        const value = values[index];
        die.dataset.value = value;
        die.setAttribute("aria-label", `Die ${index + 1}, showing ${value}`);
    });
    startHint.hidden = true;
    dice.hidden = false;
}

function updateSelectionFeedback() {
    const selectionSum = selectedNumbers.reduce((total, number) => total + number, 0);
    gameStatus.textContent = `Roll ${diceSum} · Selection ${selectionSum}`;
    confirmButton.disabled = selectionSum !== diceSum;
}

function hasValidMove(openNumbers, targetSum) {
    if (targetSum === 0) return true;
    if (targetSum < 0 || openNumbers.length === 0) return false;

    // Prüfe die Kombinationen mit und ohne die erste offene Zahl.
    const [number, ...remainingNumbers] = openNumbers;
    return hasValidMove(remainingNumbers, targetSum - number)
        || hasValidMove(remainingNumbers, targetSum);
}

function handleRoll() {
    const diceValues = rollDice();
    const [randomNumOne, randomNumTwo] = diceValues;
    diceSum = randomNumOne + randomNumTwo;
    showDice(diceValues);

    rollButton.disabled = true;
    restartButton.disabled = false;

    const openTiles = tiles.filter((tile) => !tile.classList.contains("is-closed"));
    const openNumbers = openTiles.map((tile) => Number(tile.dataset.number));

    if (!hasValidMove(openNumbers, diceSum)) {
        endGame(`You lost! No combination of open tiles adds up to ${diceSum}.`);
        return;
    }

    openTiles.forEach(enableTile);
    updateSelectionFeedback();
}

function enableTile(tile) {
    tile.disabled = false;
}

function handleConfirm() {
    tiles.forEach((tile) => {
        const number = Number(tile.dataset.number);

        if (selectedNumbers.includes(number)) {
            tile.classList.add("is-closed");
            tile.setAttribute("aria-pressed", "false");
            tile.setAttribute("aria-label", `Tile ${number}, closed`);
        }

        tile.disabled = true;
    });

    selectedNumbers.length = 0;
    diceSum = null;
    confirmButton.disabled = true;

    const hasWon = tiles.every((tile) => tile.classList.contains("is-closed"));
    if (hasWon) {
        endGame("You won! All nine tiles are closed.");
        return;
    }

    rollButton.disabled = false;
    gameStatus.textContent = "";
}

function endGame(message) {
    gameStatus.textContent = message;
    rollButton.disabled = true;
    restartButton.classList.add("is-highlighted");
}

function handleRestart() {
    diceSum = null;
    selectedNumbers.length = 0;
    gameStatus.textContent = "";
    dice.hidden = true;
    startHint.hidden = false;

    tiles.forEach((tile) => {
        tile.classList.remove("is-closed");
        tile.setAttribute("aria-pressed", "false");
        tile.setAttribute("aria-label", `Tile ${tile.dataset.number}, open`);
        tile.disabled = true;
    });

    rollButton.disabled = false;
    confirmButton.disabled = true;
    restartButton.disabled = true;
    restartButton.classList.remove("is-highlighted");
}

const rollButton = document.getElementById("roll-button");
const confirmButton = document.getElementById("confirm-button");
const restartButton = document.getElementById("restart-button");
const gameStatus = document.getElementById("game-status");
const tiles = Array.from(document.querySelectorAll(".tile"));
const startHint = document.getElementById("start-hint");
const dice = document.getElementById("dice");
const diceElements = [document.getElementById("die-1"), document.getElementById("die-2")];

rollButton.addEventListener("click", handleRoll);
confirmButton.addEventListener("click", handleConfirm);
restartButton.addEventListener("click", handleRestart);

tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
        const number = Number(tile.dataset.number);
        const index = selectedNumbers.indexOf(number);

        if (index === -1) {
            selectedNumbers.push(number);
        } else {
            selectedNumbers.splice(index, 1);
        }

        tile.setAttribute("aria-pressed", String(selectedNumbers.includes(number)));
        updateSelectionFeedback();
    });
});
