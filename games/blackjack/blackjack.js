
const suits = [
    "Clovers",
    "Hearts",
    "Pikes",
    "Tiles"
];

const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King"
];


let deck = [];

let playerHand = [];
let dealerHand = [];

let bankroll = 100;
let sessionHighScore =
    Number(localStorage.getItem("blackjackHighScore")) || 100;
let currentBet = 0;

let gameOver = true;
let roundInProgress = false;
let dealerHoleCardHidden = true;


// HTML elements
const playerCardsElement =
    document.getElementById("player-cards");

const dealerCardsElement =
    document.getElementById("dealer-cards");

const playerScoreElement =
    document.getElementById("player-score");

const dealerScoreElement =
    document.getElementById("dealer-score");

const gameMessageElement =
    document.getElementById("game-message");

const hitButton =
    document.getElementById("hit-button");

const standButton =
    document.getElementById("stand-button");

const newGameButton =
    document.getElementById("new-game-button");

const betButton =
    document.getElementById("bet-button");

const bankrollElement =
    document.getElementById("bankroll");

const sessionHighScoreElement =
    document.getElementById("session-high-score");

const betAmountInput =
    document.getElementById("bet-amount");


function createDeck() {
    deck = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({
                suit: suit,
                rank: rank
            });
        }
    }

    shuffleDeck();
}


function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}


function drawCard() {
    return deck.pop();
}


function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.rank === "A") {
            score += 11;
            aces++;
        } else if (
            card.rank === "Jack" ||
            card.rank === "Queen" ||
            card.rank === "King"
        ) {
            score += 10;
        } else {
            score += Number(card.rank);
        }
    }

    // Convert Aces from 11 to 1 if necessary
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}


function getCardImage(card) {
    return (
        `../../img/cards/PNG/black/` +
        `${card.suit}_${card.rank}_black.png`
    );
}


function renderHand(hand, container, hideFirstCard = false) {
    container.innerHTML = "";

    hand.forEach((card, index) => {
        // Show a gray card back for the hidden dealer card
        if (hideFirstCard && index === 0) {
            const cardBack = document.createElement("div");

            cardBack.classList.add("card", "card-back");
            cardBack.setAttribute("aria-label", "Hidden card");

            container.appendChild(cardBack);

            return;
        }

        const image = document.createElement("img");

        image.classList.add("card");
        image.src = getCardImage(card);
        image.alt = `${card.rank} of ${card.suit}`;

        container.appendChild(image);
    });
}


function updateBankrollDisplay() {
    bankrollElement.textContent = `€${bankroll}`;

    sessionHighScoreElement.textContent =
        `€${sessionHighScore}`;

    betAmountInput.max = bankroll;
}


function updateInterface() {
    renderHand(
        playerHand,
        playerCardsElement
    );

    renderHand(
        dealerHand,
        dealerCardsElement,
        dealerHoleCardHidden
    );

    playerScoreElement.textContent =
        calculateScore(playerHand);

    if (dealerHoleCardHidden && dealerHand.length > 1) {
        dealerScoreElement.textContent =
            calculateScore([dealerHand[1]]);
    } else {
        dealerScoreElement.textContent =
            calculateScore(dealerHand);
    }

    // Enable or disable buttons
    hitButton.disabled =
        !roundInProgress || gameOver;

    standButton.disabled =
        !roundInProgress || gameOver;

    betButton.disabled =
        roundInProgress || bankroll < 10;

    newGameButton.disabled = false;

    updateBankrollDisplay();
}


function startRound() {
    if (roundInProgress) {
        return;
    }

    const selectedBet = Number(betAmountInput.value);

    if (
        !Number.isFinite(selectedBet) ||
        selectedBet < 10
    ) {
        gameMessageElement.textContent =
            "The minimum bet is €10.";

        return;
    }

    if (selectedBet > bankroll) {
        gameMessageElement.textContent =
            "You cannot bet more than your current balance.";

        return;
    }

    currentBet = selectedBet;
    bankroll -= currentBet;

    createDeck();

    playerHand = [];
    dealerHand = [];

    gameOver = false;
    roundInProgress = true;
    dealerHoleCardHidden = true;

    gameMessageElement.textContent =
        `You bet €${currentBet}. Hit or stand?`;

    playerHand.push(drawCard());
    dealerHand.push(drawCard());

    playerHand.push(drawCard());
    dealerHand.push(drawCard());

    updateInterface();

    const playerBlackjack =
        calculateScore(playerHand) === 21;

    const dealerBlackjack =
        calculateScore(dealerHand) === 21;

    if (playerBlackjack && dealerBlackjack) {
        endGame(
            "Both have Blackjack! It's a push.",
            "push"
        );
    } else if (playerBlackjack) {
        endGame(
            "Blackjack! You win!",
            "win"
        );
    } else if (dealerBlackjack) {
        endGame(
            "Dealer has Blackjack. You lose!",
            "loss"
        );
    }
}


function hit() {
    if (!roundInProgress || gameOver) {
        return;
    }

    playerHand.push(drawCard());

    const score = calculateScore(playerHand);

    updateInterface();

    if (score > 21) {
        endGame(
            "Bust! You went over 21. You lose.",
            "loss"
        );
    } else if (score === 21) {
        stand();
    }
}


function stand() {
    if (!roundInProgress || gameOver) {
        return;
    }

    dealerHoleCardHidden = false;

    updateInterface();

    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }

    updateInterface();

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (dealerScore > 21) {
        endGame(
            "Dealer busts! You win!",
            "win"
        );
    } else if (playerScore > dealerScore) {
        endGame(
            "You win!",
            "win"
        );
    } else if (playerScore < dealerScore) {
        endGame(
            "Dealer wins. You lose!",
            "loss"
        );
    } else {
        endGame(
            "It's a push! Nobody wins.",
            "push"
        );
    }
}


function endGame(message, result = "push") {
    if (gameOver) {
        return;
    }

    gameOver = true;
    roundInProgress = false;
    dealerHoleCardHidden = false;

    if (result === "win") {
        bankroll += currentBet * 2;
    } else if (result === "push") {
        bankroll += currentBet;
    }


    if (bankroll > sessionHighScore) {
        sessionHighScore = bankroll;

        localStorage.setItem(
            "blackjackHighScore",
            sessionHighScore
        );
    }

    gameMessageElement.textContent =
        `${message} Round bet: €${currentBet}.`;

    updateInterface();

    if (bankroll < 10) {
        gameMessageElement.textContent +=
            " You're out of money. Press New Game to reset your balance to €100.";
    }
}


function resetGame() {
    bankroll = 100;
    currentBet = 0;

    playerHand = [];
    dealerHand = [];

    gameOver = true;
    roundInProgress = false;
    dealerHoleCardHidden = true;

    betAmountInput.value = 10;

    gameMessageElement.textContent =
        "New game! Balance reset to €100. Choose your bet and press Bet.";

    updateInterface();
}


hitButton.addEventListener("click", hit);

standButton.addEventListener("click", stand);

betButton.addEventListener("click", startRound);

newGameButton.addEventListener("click", resetGame);


resetGame();