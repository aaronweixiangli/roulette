/*----- constants -----*/
// Bet options
const OPTIONS = {
    single: 36,
    two: 18,
    three: 12,
    four: 9,
    five: 7,
    six: 6,
    twelve: 3,
    even: 2
    };
const DEFAULT_BALANCE = 1000;
const CHIPS = [1, 2, 5, 10, 100];
const CHIPS_IMG = {
    empty: '',
    silver: "url(./img/silver_chip.jpg)", 
    yellow: "url(./img/yellow_chip.jpg)",
    green: "url(./img/green_chip.jpg)", 
    blue: "url(./img/blue_chip.jpg)",
    purple: "url(./img/purple_chip.jpg)"
};
// numbers that are in red
const RED = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36'];
// numbers that are in black
const BLACK = ['2', '4', '6', '8', '10', '11', '13', '15', '17', '20', '22', '24', '26', '28', '29', '31', '33', '35'];

// all numbers
const NUMBERS = [
    '0', '28', '9', '26', '30', '11', '7', '20', '32', '17', '5', '22', '34',
    '15', '3', '24', '36', '13', '1', '00', '27', '10', '25', '29', '12', '8',
    '19', '31', '18', '6', '21', '33', '16', '4', '23', '35', '14', '2'
];

// degrees per slice in the wheel. Total 38 numbers, 360 degrees
const DEGREE_PER_SLICE = 360/NUMBERS.length;

// Sound effects
const SOUNDS = {
    ball: "sound/ball_sound_effect.ogg",
    bet: "sound/bet_sound_effect.wav",
    chip: "sound/chip_sound_effect.wav",
    money: "sound/money_sound_effect.wav",
    lose: "sound/lose_sound_effect.wav",
    win: "sound/win_sound_effect.wav",
    page: "sound/page_turn_sound_effect.wav"
}

/*----- state variables -----*/
let totalBet; // integer; store the total bet amount in the betting table
let betOrder; // array; store the bet made by player in order.
let balance; // integer; store the player's current balance
let board; // array; store the bet amount in each 'cell'
let payout; //object; store numbers as key and payout as value. return the payout of that number if it's the winning number
let winningNum; // integer; store the winning number
let chosenChip; // integer; store the value of the chip chosen by the player
let oddHistory; // array; store the odd winning numbers of the past ten games.
let evenHistory; // array; store the even winning numbers of the past ten games.
let spinStatus; // boolean; True -> wheel is spinning. False -> wheel stops spinning.
let previousBoard; // array; store board of the last game
let previousPayout; // object; store the payout of the last game
let previousBetOrder; // array; store the betOrder of the last game
let previousTotalBet; // integer; store the totalBet of the last game
let previousBalance; // integer; store the ending balance of the last game
let winningBallIdx; // integer; store the rounded winning ball index
let winningBallIdxUnrounded; // float; store the unrounded winning ball index
let degreeBall; //float; store the rotation degree of the ball container

    
/*----- cached elements  -----*/
const boardEls = [...document.querySelectorAll('.board > div')] // all the direct child of the board
const balanceEl = document.getElementById('balance'); // player's current balance element
const betAmountEl = document.getElementById('bet-amount'); // player's total bet amount element
const silverChipBtn = document.getElementById('silver-chip');
const yellowChipBtn = document.getElementById('yellow-chip');
const greenChipBtn = document.getElementById('green-chip');
const blueChipBtn = document.getElementById('blue-chip');
const purpleChipBtn = document.getElementById('purple-chip');
const undoBtn = document.getElementById('undo');
const clearBtn = document.getElementById('clear');
const doubleBetBtn = document.getElementById('double-bet');
const repeatLastBetBtn = document.getElementById('repeat-last-bet');
const spinBtn = document.getElementById('spin');
const messageEl = document.querySelector('h1');
const oddHistoryEls = [...document.querySelectorAll('#odd-history > div')];
const evenHistoryEls = [...document.querySelectorAll('#even-history > div')];
const modalEl = document.getElementById('wheel-container');
const wheelEl = document.getElementById('wheel');
const ballEl = document.getElementById('ball-container');
const winningMsgEl = document.getElementById('winning-message');
const sound = new Audio(); // sound effect

/*----- event listeners -----*/

// update the board data if the board elements are clicked.
document.querySelector('.board').addEventListener('click', handleBet);
// update the variable chosenChip when chip is clicked.
document.querySelectorAll('.chip').forEach(function(chip) {
    chip.addEventListener('click', handleChip);
});
// update the board data when undo button is clicked.
undoBtn.addEventListener('click', handleUndo);
// update the board data when clear button is clicked.
clearBtn.addEventListener('click', handleClear);
// update the board data when double bet button is clicked.
doubleBetBtn.addEventListener('click', handleDoubleBet);
// update the board data when repeat last bet button is clicked.
repeatLastBetBtn.addEventListener('click', handleRepeatLastBet);
// update the winning number when spin button is clicked.
spinBtn.addEventListener('click', handleSpin);
// update balance when the wheel stops spinning and show the winning message. That is, transition has ended.
wheelEl.addEventListener('transitionend', handleSpinStops);
// whenever the player clicks after the transition ends
// reset all data to its initial values, except for the chosenChip and history array
modalEl.addEventListener('click', handleNewGame);



/*----- functions -----*/
init();
function init() {
    board = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //11 elements that take more than 1 span
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // first row 29 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //second row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //third row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //fourth row 28 elements
        0,                                                                                   //fifth row 1 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //sixth row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //seventh row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // eighth row 29 elements
        0, 0, 0, 0, 0, 0, 0, 0,                                                                // ninth row 8 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // tenth row 29 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                                       // eleventh row 11 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // twelfth row 29 elements
    ]
    betOrder = [];
    balance = DEFAULT_BALANCE;
    totalBet = 0;
    payout = {};
    winningNum = null;
    chosenChip = 1; //Initial chip
    oddHistory = [];
    evenHistory = [];
    render();
}

function handleBet(evt) {
    // Guard. If the clicked element's classlist contains 'empty'. Do nothing
    if (evt.target.classList.contains("empty")) return;
    // Guard. If the player's current balance is less than or equal to zero,
    // or current balance - chosen chip < 0.  Do nothing
    if (balance <= 0 || balance - chosenChip < 0) return;
    // Add sound effect for bet
    sound.src =  SOUNDS.bet;
    sound.play();
    let betPosition = evt.target;
    console.log(betPosition);
    let betIdx;
    if (betPosition.getAttribute('class') === 'larger-area' || 
        betPosition.getAttribute('class') === 'taller' ||
        betPosition.getAttribute('class') === 'wider' ||
        betPosition.getAttribute('class') === 'even-wider') {
        betIdx = boardEls.indexOf(betPosition.parentElement);
    } else {
        betIdx = boardEls.indexOf(betPosition);
    }
    board[betIdx] += chosenChip;
    balance -= chosenChip;
    totalBet += chosenChip;
    let betNumbers = boardEls[betIdx].getAttribute('nums').split(' ');
    let betOption = boardEls[betIdx].getAttribute('option');
    console.log(betNumbers);
    console.log(betOption);
    for (let betNum of betNumbers) {
        payout[betNum] = payout[betNum] ? payout[betNum] + chosenChip * OPTIONS[betOption] : chosenChip * OPTIONS[betOption];
    }
    betOrder.push([chosenChip, betIdx, betNumbers, betOption]); // store the index, chip amount, bet numbers, and bet option at each bet 
    render();
}

function handleChip(evt) {
    // Add sound effect for chip chosen
    sound.src = SOUNDS.chip;
    sound.play();
    document.querySelectorAll('.chip').forEach(function(chip) {
        chip.classList.remove('active');
    });
    evt.target.classList.add('active');
    chosenChip = parseInt(evt.target.textContent);
}

function handleUndo() {
    // Add sound effect for bet
    sound.src =  SOUNDS.money;
    sound.play();
    let [chip, removeIdx, betNumbers, betOption] = betOrder.pop();
    board[removeIdx] -= chip;
    balance += chip;
    totalBet -= chip;
    for (let betNum of betNumbers) {
        payout[betNum] -= chosenChip * OPTIONS[betOption];
    }
    // if the payout for a bet number is 0, then delete that property from the Object payout
    for (const key in payout) {
        if (payout[key] === 0) delete payout[key];
    }
    render();
}

function handleClear() {
    // Add sound effect for bet
    sound.src =  SOUNDS.money;
    sound.play();
    while (betOrder.length > 0) {
        let [chip, removeIdx, betNumbers, betOption] = betOrder.pop();
        board[removeIdx] -= chip;
        balance += chip;
        totalBet -= chip;
        for (let betNum of betNumbers) {
            payout[betNum] -= chosenChip * OPTIONS[betOption];
        }
    };
    for (const key in payout) {
        if (payout[key] === 0) delete payout[key];
    }
    render();
}

function handleDoubleBet(){
    // Guard. Balance cannot be smaller than 0
    if (balance - totalBet < 0) return;
    // Add sound effect for bet
    sound.src =  SOUNDS.money;
    sound.play();
    // double the number in board and update the balance and totalBet
    for (let i = 0; i < board.length; i++) {
        if (board[i] !== 0) {
            balance -= board[i];
            totalBet += board[i];
            board[i] *= 2;
        }
    }
    for (let betTaken of betOrder) {
        // Double the 'chip' in each array of the array betOrder
        betTaken[0] *= 2;
    }
    // double the values in the payout Object
    for (key in payout) {
        payout[key] *= 2;
    }
    console.log(`double bet: previousBetOrder: ${previousBetOrder}`);
    console.log(`double bet: betOrder: ${betOrder}`);
    render();
}

function handleRepeatLastBet() {
    // Guard. Balance cannot be smaller than 0
    if (balance - previousTotalBet < 0) return;
    // Add sound effect for bet
    sound.src =  SOUNDS.money;
    sound.play();
    board = previousBoard.slice(); // make a copy of previous board without reference
    // make a copy of previous betOrder without reference. However, we cannot use slice()
    // since the array we are copying contains an object or array. Need to use deep copy
    betOrder = JSON.parse(JSON.stringify(previousBetOrder));
    console.log(`repeat last bet: previousBetOrder: ${previousBetOrder}`);
    console.log(`repeat last bet: betOrder: ${betOrder}`);
    payout = {...previousPayout}; // make a copy of previous payout object without reference
    totalBet = previousTotalBet;
    balance = previousBalance - previousTotalBet;
    render();
}

function handleSpin() {
    // Add sound effect for spinning ball
    sound.src = SOUNDS.ball;
    sound.play();
    // Store the data from the previous game
    previousBoard = board; 
    previousBetOrder = betOrder; 
    previousPayout = payout; 
    previousTotalBet = totalBet;
    previousBalance = balance;
    console.log(`previousBetOrder: ${previousBetOrder}`);
    // Toggle or add a 'show-modal' class to the modal class which contains the wheel
    modalEl.classList.toggle('show-modal');
    // let the wheel spin 1080 degree + a random degree between 0 to 720
    let degreeWheel = Math.floor(1080 + Math.random() * 720 + 1);
    wheelEl.style.transform = `rotate(-${degreeWheel}deg)`;

    // Do the same thing for degreeBall
    degreeBall = Math.floor(1080 + Math.random() * 720 + 1);
    ballEl.style.transform = `rotate(${degreeBall}deg)`;

    // if the ball does not move, then the index of the winning ball would be 
    // the math.round [remainder of (wheel rotating degree / degrees per slice) / length of NUMBERS]
    // Since the ball and wheel both are spinning, we store each unrounded index first
    let wheelIdx = (degreeWheel/DEGREE_PER_SLICE) % NUMBERS.length;

    // if the wheel does not move, then the index of the winning ball would be
    // the math.round [remainder of (ball rotating degree / degrees per slice) / length of NUMBERS]
    let ballIdx = ((degreeBall)/DEGREE_PER_SLICE) % NUMBERS.length;

    // When the ball and the wheel both rotate, the winning index then would be 
    // the remainder of (the rounded sum of wheelIdx and ballIdx / length of numbers)
    winningBallIdxUnrounded = (wheelIdx + ballIdx) % NUMBERS.length;
    winningBallIdx = Math.round(wheelIdx + ballIdx) % NUMBERS.length;
    console.log(`winning Idx: ${winningBallIdxUnrounded}`);
    console.log(`winning idx round: ${winningBallIdx}`);
    console.log(`winning number: ${NUMBERS[winningBallIdx]}`);

    // update the winning number
    winningNum = NUMBERS[winningBallIdx];
    console.log(winningNum);
    // update the spinStatus to be True
    spinStatus = true; 

    // reset the ball container transition to be initial values
    ballEl.style.transition = "all 4.5s cubic-bezier(.24,.8,.58,1)";
}

// Be careful. The handleSpinStops function will trigger twice since the transitioned event is fired twice.
// one time for visibility and one time for transform.
function handleSpinStops(evt) {
    // Guard. If event.propertyName is not transform. Do nothing.
    if (evt.propertyName !== 'transform') return;

    // Adjust the ball rotation degree depending on the difference between 
    // the rounded winningBallIdx and unrounded winningBallIdx. 
    let diffWinningBallIdx = winningBallIdx - winningBallIdxUnrounded;
    console.log(`diff: ${diffWinningBallIdx}`)

    // if the decimal is < 0, the index has been rounded down and > 0 rounded up
    // we want to adjust the ball rotation degree by this difference * the degree per slice
    // so the ball will sit properly in that winning number slot instead of lying in between numbers
    ballEl.style.transform = `rotate(${(degreeBall + diffWinningBallIdx * DEGREE_PER_SLICE)}deg)`;
    ballEl.style.transition = 'all 0.1s';

    messageEl.style.visibility = 'hidden'; // hide the message element
    // if the winningNum is in our payout object, which means player has hit the right number.
    // Update the player's balance.
    if (winningNum in payout) {
        // Add sound effect for winning
        sound.src = SOUNDS.win;
        sound.play();
        balance += payout[winningNum];
        if (RED.includes(winningNum)) {
            winningMsgEl.textContent = `RED ${winningNum}! Player wins ${payout[winningNum]}!`
        } else if (BLACK.includes(winningNum)) {
            winningMsgEl.textContent = `BLACK ${winningNum}! Player wins ${payout[winningNum]}!`
        } else {
            winningMsgEl.textContent = `WHITE ${winningNum}! Player wins ${payout[winningNum]}!`
        }
    // else, the dealer wins and update the winning message.
    } else {
        // Add sound effect for losing
        sound.src = SOUNDS.lose;
        sound.play();
        if (RED.includes(winningNum)) {
            winningMsgEl.textContent = `RED ${winningNum}! Dealer wins!`
        } else if (BLACK.includes(winningNum)) {
            winningMsgEl.textContent = `BLACK ${winningNum}! Dealer wins!`
        } else {
            winningMsgEl.textContent = `WHITE ${winningNum}! Dealer wins!`
        }
    }
    // If the winning number is odd, then push it to the oddHistory array.
    // Also push null to the evenHistory array so they have the same array length.
    // else, do the opposite.
    if (parseInt(winningNum) % 2 === 1){
        oddHistory.push(winningNum);
        evenHistory.push(null);
    } else {
        evenHistory.push(winningNum);
        oddHistory.push(null);
    }
    // We are only storing numbers for the past 10 games.
    // so whenever the length of the oddHistory array goes above 10, remove the left element for both odd and even history.
    if (oddHistory.length > 10) {
        oddHistory.shift();
        evenHistory.shift();
    }
    // Once transition is ended. Update the spinStatus to be False.
    spinStatus = false;
}

function handleNewGame(){
    // Guard. If the spinStatus is True, which means the wheel is spinning, then do nothing.
    if (spinStatus) return;
    // Add sound effect for new page
    sound.src = SOUNDS.page;
    sound.play();
    // Toggle or remove the 'show-modal' class from the modal class which contains the wheel
    // so the wheel is hidden
    modalEl.classList.toggle('show-modal');

    // reset the ball container and wheel transform to be none
    ballEl.style.transform = '';
    wheelEl.style.transform = '';

    // changes the messageEl to be visible again
    messageEl.style.visibility = 'visible';
    // empty the winningMsgEl's text
    winningMsgEl.textContent = '';
    // Starts the new game so update the all data to its initial values, except chosenChip and history array
    board = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //11 elements that take more than 1 span
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // first row 29 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //second row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //third row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //fourth row 28 elements
        0,                                                                                   //fifth row 1 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //sixth row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  //seventh row 28 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // eighth row 29 elements
        0, 0, 0, 0, 0, 0, 0, 0,                                                                // ninth row 8 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // tenth row 29 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                                       // eleventh row 11 elements
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // twelfth row 29 elements
    ]
    betOrder = [];
    totalBet = 0;
    payout = {};
    winningNum = null;
    render();
}



function render() {
    renderBoard();
    renderBalance();
    renderButtons();
    renderHistory();
}

function renderBoard() {
    for (let i = 0; i < board.length; i++) {
        if (board[i] !== 0) {
            boardEls[i].lastElementChild.textContent = `${board[i]}`;
            boardEls[i].lastElementChild.style.visibility = 'visible';
            if (board[i] >= CHIPS[0] && board[i] < CHIPS[1]) {
                boardEls[i].lastElementChild.style.backgroundImage = `${CHIPS_IMG.silver}`;
                boardEls[i].lastElementChild.style.color = 'black';
            } else if (board[i] >= CHIPS[1] && board[i] < CHIPS[2]) {
                boardEls[i].lastElementChild.style.backgroundImage = `${CHIPS_IMG.yellow}`;
                boardEls[i].lastElementChild.style.color = 'black';
            } else if (board[i] >= CHIPS[2] && board[i] < CHIPS[3]) {
                boardEls[i].lastElementChild.style.backgroundImage = `${CHIPS_IMG.green}`;
                boardEls[i].lastElementChild.style.color = 'white';
            } else if (board[i] >= CHIPS[3] && board[i] < CHIPS[4]) {
                boardEls[i].lastElementChild.style.backgroundImage = `${CHIPS_IMG.blue}`;
                boardEls[i].lastElementChild.style.color = 'white';
            } else if (board[i] >= CHIPS[4]) {
                boardEls[i].lastElementChild.style.backgroundImage = `${CHIPS_IMG.purple}`;
                boardEls[i].lastElementChild.style.color = 'white';
            }
        }
        if (board[i] === 0 && boardEls[i].lastElementChild) {
            boardEls[i].lastElementChild.style.visibility = 'hidden';
        }
    }
    if (balance < CHIPS[0]) {
        silverChipBtn.style.visibility = 'hidden';
    } else {
        silverChipBtn.style.visibility = 'visible';
    }
    if (balance < CHIPS[1]) {
        yellowChipBtn.style.visibility = 'hidden';
    } else {
        yellowChipBtn.style.visibility = 'visible';
    }
    if (balance < CHIPS[2]) {
        greenChipBtn.style.visibility = 'hidden';
    } else {
        greenChipBtn.style.visibility = 'visible';
    }
    if (balance < CHIPS[3]) {
        blueChipBtn.style.visibility = 'hidden';
    } else {
        blueChipBtn.style.visibility = 'visible';
    }
    if (balance < CHIPS[4]) {
        purpleChipBtn.style.visibility = 'hidden';
    } else {
        purpleChipBtn.style.visibility = 'visible';
    }
}

function renderBalance() {
    betAmountEl.textContent = `$${totalBet}`;
    balanceEl.textContent = `$${balance}`;
}

function renderButtons() {
    if (betOrder.length === 0) {
        undoBtn.style.visibility = 'hidden';
        clearBtn.style.visibility = 'hidden';
        doubleBetBtn.style.visibility = 'hidden';
        spinBtn.style.visibility = 'hidden';
    } else {
        undoBtn.style.visibility = 'visible';
        clearBtn.style.visibility = 'visible';
        doubleBetBtn.style.visibility = 'visible';
        spinBtn.style.visibility = 'visible';
    };
    if (previousBoard === undefined) {
        repeatLastBetBtn.style.visibility = 'hidden';
    } else {
        repeatLastBetBtn.style.visibility = 'visible';
    }
}

function renderHistory() {
    for (let i = 0; i < oddHistoryEls.length; i++) {
        oddHistoryEls[i].textContent = '';
        evenHistoryEls[i].textContent = '';
    }
    for (let i = 0; i < oddHistory.length; i++) {
        if (oddHistory[i] !== null) {
            oddHistoryEls[i].textContent = `${oddHistory[i]}`;
            if (RED.includes(oddHistory[i])) {
                oddHistoryEls[i].style.color = 'red';
            } else if (BLACK.includes(oddHistory[i])) {
                oddHistoryEls[i].style.color = 'black';
            } else {
                oddHistoryEls[i].style.color = 'white';
            }
        }
        if (evenHistory[i] !== null) {
            evenHistoryEls[i].textContent = `${evenHistory[i]}`;
            if (RED.includes(evenHistory[i])) {
                evenHistoryEls[i].style.color = 'red';
            } else if (BLACK.includes(evenHistory[i])) {
                evenHistoryEls[i].style.color = 'black';
            } else {
                evenHistoryEls[i].style.color = 'white';
            }
        }
    }
}
