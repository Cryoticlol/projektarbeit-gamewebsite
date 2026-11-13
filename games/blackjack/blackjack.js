
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

let dealerHand = [];

let playerHands = [];
let handBets = [];
let handFinished = [];

let activeHand = 0;

let bankroll = 100;
let sessionHighScore =
    Number(localStorage.getItem("blackjackHighScore")) || 100;

let gameOver = true;
let roundInProgress = false;
let dealerHoleCardHidden = true;

let hasSplit = false;


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

const doubleButton =
    document.getElementById("double-button");

const splitButton =
    document.getElementById("split-button");

const bankrollElement =
    document.getElementById("bankroll");

const sessionHighScoreElement =
    document.getElementById("session-high-score");

const betAmountInput =
    document.getElementById("bet-amount");

const rulesButton =
    document.getElementById("rules-button");

const rulesPanel =
    document.getElementById("rules-panel");

const closeRulesButton =
    document.getElementById("close-rules-button");

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

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}


function isNaturalBlackjack(hand) {
    return (
        hand.length === 2 &&
        calculateScore(hand) === 21
    );
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

function renderPlayerHands() {
    playerCardsElement.innerHTML = "";

    playerHands.forEach((hand, index) => {
        const handContainer = document.createElement("div");

        handContainer.classList.add("split-hand");

        if (index === activeHand && roundInProgress) {
            handContainer.classList.add("active-hand");
        }

        const handTitle = document.createElement("h3");

        handTitle.textContent =
            playerHands.length > 1
                ? `Hand ${index + 1} - €${handBets[index]}`
                : `Your hand - €${handBets[index]}`;

        const handScore = document.createElement("span");

        handScore.textContent =
            `Score: ${calculateScore(hand)}`;

        const cardsContainer = document.createElement("div");

        cardsContainer.classList.add("cards");

        renderHand(hand, cardsContainer);

        handContainer.appendChild(handTitle);
        handContainer.appendChild(handScore);
        handContainer.appendChild(cardsContainer);

        playerCardsElement.appendChild(handContainer);
    });

    if (playerHands.length > 0) {
        playerScoreElement.textContent =
            calculateScore(playerHands[activeHand]);
    } else {
        playerScoreElement.textContent = "0";
    }
}

function updateInterface() {
    renderPlayerHands();

    renderHand(
        dealerHand,
        dealerCardsElement,
        dealerHoleCardHidden
    );

    if (dealerHoleCardHidden && dealerHand.length > 1) {
        dealerScoreElement.textContent =
            calculateScore([dealerHand[1]]);
    } else {
        dealerScoreElement.textContent =
            calculateScore(dealerHand);
    }

    const activeHandCards =
        playerHands[activeHand] || [];

    const canAct =
        roundInProgress &&
        !gameOver &&
        !handFinished[activeHand];

    hitButton.disabled = !canAct;
    standButton.disabled = !canAct;

    doubleButton.disabled = !(
        canAct &&
        activeHandCards.length === 2 &&
        bankroll >= handBets[activeHand]
    );

    splitButton.disabled = !(
        canAct &&
        !hasSplit &&
        activeHandCards.length === 2 &&
        activeHandCards[0].rank === activeHandCards[1].rank &&
        bankroll >= handBets[activeHand]
    );

    betButton.disabled =
        roundInProgress || bankroll < 10;

    updateBankrollDisplay();
}


function startRound() {
    if (roundInProgress) return;

    const selectedBet = Number(betAmountInput.value);

    if (
        !Number.isFinite(selectedBet) ||
        !Number.isInteger(selectedBet) ||
        selectedBet < 10
    ) {
        gameMessageElement.textContent =
            "The minimum bet is €10. Use whole euros.";

        return;
    }

    if (selectedBet > bankroll) {
        gameMessageElement.textContent =
            "You cannot bet more than your current balance.";

        return;
    }

    bankroll -= selectedBet;

    handBets = [selectedBet];
    playerHands = [[]];
    handFinished = [false];

    activeHand = 0;
    hasSplit = false;

    dealerHand = [];

    gameOver = false;
    roundInProgress = true;
    dealerHoleCardHidden = true;

    createDeck();

    playerHands[0].push(drawCard());
    dealerHand.push(drawCard());

    playerHands[0].push(drawCard());
    dealerHand.push(drawCard());

    gameMessageElement.textContent =
        `You bet €${selectedBet}. Your turn now.`;
    updateInterface();

    const playerBlackjack =
        isNaturalBlackjack(playerHands[0]);

    const dealerBlackjack =
        isNaturalBlackjack(dealerHand);

    if (playerBlackjack && dealerBlackjack) {
        finishRound("Both have Blackjack! It's a push.", "push");
    } else if (playerBlackjack) {
        // Natural Blackjack pays 2:1 profit.
        finishRound("Blackjack! You win 2:1!", "blackjack");
    } else if (dealerBlackjack) {
        finishRound("Dealer has Blackjack. You lose!", "loss");
    }
}


function hit() {
    if (!roundInProgress || gameOver) return;

    const hand = playerHands[activeHand];

    hand.push(drawCard());

    const score = calculateScore(hand);

    if (score > 21) {
        handFinished[activeHand] = true;

        gameMessageElement.textContent =
            `Hand ${activeHand + 1} busts!`;

        moveToNextHand();
        return;
    }

    updateInterface();

    if (score === 21) {
        stand();
    }
}

function stand() {
    if (!roundInProgress || gameOver) return;

    handFinished[activeHand] = true;

    moveToNextHand();
}

function moveToNextHand() {
    const nextHand = handFinished.findIndex(
        (finished, index) =>
            !finished && index > activeHand
    );

    if (nextHand !== -1) {
        activeHand = nextHand;

        gameMessageElement.textContent =
            `Your turn: Hand ${activeHand + 1}.`;

        updateInterface();
        return;
    }

    playDealer();
}

function playDealer() {
    dealerHoleCardHidden = false;

    const hasActiveHand = playerHands.some(
        hand => calculateScore(hand) <= 21
    );

    if (hasActiveHand) {
        while (calculateScore(dealerHand) < 17) {
            dealerHand.push(drawCard());
        }
    }

    updateInterface();

    settleHands();
}

function settleHands() {
    const dealerScore = calculateScore(dealerHand);

    let totalReturned = 0;
    const results = [];

    playerHands.forEach((hand, index) => {
        const playerScore = calculateScore(hand);
        const bet = handBets[index];

        if (playerScore > 21) {
            results.push(`Hand ${index + 1}: Bust.`);
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            totalReturned += bet * 2;
            results.push(`Hand ${index + 1}: Win!`);
        } else if (playerScore < dealerScore) {
            results.push(`Hand ${index + 1}: Loss.`);
        } else {
            totalReturned += bet;
            results.push(`Hand ${index + 1}: Push.`);
        }
    });

    bankroll += totalReturned;

    finishRound(results.join(" "), "settled", totalReturned);
}

function doubleDown() {
    if (!roundInProgress || gameOver) return;

    const hand = playerHands[activeHand];
    const bet = handBets[activeHand];

    if (hand.length !== 2 || bankroll < bet) return;

    // Deduct an additional bet.
    bankroll -= bet;

    // Double the hand's stake.
    handBets[activeHand] *= 2;

    // Draw exactly one card.
    hand.push(drawCard());

    const score = calculateScore(hand);

    handFinished[activeHand] = true;

    if (score > 21) {
        gameMessageElement.textContent =
            `Hand ${activeHand + 1} busts after doubling!`;
    } else {
        gameMessageElement.textContent =
            `Hand ${activeHand + 1} doubled.`;
    }

    moveToNextHand();
}

function splitHand() {
    if (!roundInProgress || gameOver || hasSplit) return;

    const hand = playerHands[activeHand];
    const bet = handBets[activeHand];

    if (
        hand.length !== 2 ||
        hand[0].rank !== hand[1].rank ||
        bankroll < bet
    ) {
        return;
    }

    bankroll -= bet;

    const firstCard = hand[0];
    const secondCard = hand[1];

    playerHands = [
        [firstCard],
        [secondCard]
    ];

    handBets = [bet, bet];
    handFinished = [false, false];

    activeHand = 0;
    hasSplit = true;

    playerHands[0].push(drawCard());
    playerHands[1].push(drawCard());

    gameMessageElement.textContent =
        "Cards split! Play your first hand.";

    updateInterface();
}

function finishRound(message, result, totalReturned = 0) {
    gameOver = true;
    roundInProgress = false;

    const totalBet = handBets.reduce((sum, bet) => sum + bet, 0);

    if (result === "blackjack") {
        totalReturned = handBets[0] * 3;
        bankroll += totalReturned;
    } else if (result === "push") {
        totalReturned = totalBet;
        bankroll += totalReturned;
    }

    const netResult = totalReturned - totalBet;

    if (netResult > 0) {
        message += ` You won €${netResult}!`;
    } else if (netResult < 0) {
        message += ` You lost €${Math.abs(netResult)}.`;
    } else {
        message += " Your bet was returned. No money won or lost.";
    }

    if (bankroll > sessionHighScore) {
        sessionHighScore = bankroll;
        localStorage.setItem("blackjackHighScore", sessionHighScore);
    }

    document.getElementById("game-message").textContent = message;

    updateInterface();
}

function currentBetForNaturalBlackjack() {
    return handBets[0];
}

function resetGame() {
    bankroll = 100;

    playerHands = [];
    handBets = [];
    handFinished = [];

    dealerHand = [];

    activeHand = 0;
    hasSplit = false;

    gameOver = true;
    roundInProgress = false;
    dealerHoleCardHidden = true;

    currentBet = 0;

    betAmountInput.value = 10;

    gameMessageElement.textContent =
        "New game! Balance reset to €100. Choose your bet and press Bet.";

    updateInterface();
}

function openRules() {
    rulesPanel.hidden = false;
}

function closeRules() {
    rulesPanel.hidden = true;
}


hitButton.addEventListener("click", hit);

standButton.addEventListener("click", stand);

betButton.addEventListener("click", startRound);

newGameButton.addEventListener("click", resetGame);

doubleButton.addEventListener("click", doubleDown);

splitButton.addEventListener("click", splitHand);

rulesButton.addEventListener("click", openRules);

closeRulesButton.addEventListener("click", closeRules);

resetGame();