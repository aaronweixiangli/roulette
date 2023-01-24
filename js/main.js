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
    silver: "url(../img/silver_chip.jpg)", 
    yellow: "url(../img/yellow_chip.jpg)",
    green: "url(../img/green_chip.jpg)", 
    blue: "url(../img/blue_chip.jpg)",
    purple: "url(../img/purple_chip.jpg)"
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
    // Guard. If the clicked element has no 'nums' attribute. Do nothing
    if (!evt.target.getAttribute('nums') && !evt.target.parentElement.getAttribute('nums')) return;
    // Guard. If the player's current balance is less than or equal to zero,
    // or current balance - chosen chip < 0.  Do nothing
    if (balance <= 0 || balance - chosenChip < 0) return;
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
   document.querySelectorAll('.chip').forEach(function(chip) {
    chip.classList.remove('active');
   });
   evt.target.classList.add('active');
   chosenChip = parseInt(evt.target.textContent);
}

function handleUndo() {
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
    render();
}

function handleRepeatLastBet() {
    // Guard. Balance cannot be smaller than 0
    if (balance - previousTotalBet < 0) return;
    board = previousBoard.slice(); // make a copy of previous board without reference
    betOrder = previousBetOrder.slice(); // make a copy of previous betOrder without reference
    payout = {...previousPayout}; // make a copy of previous payout object without reference
    totalBet = previousTotalBet;
    balance = previousBalance - previousTotalBet;
    render();
}

function handleSpin() {
    // Store the data from the previous game
    previousBoard = board; 
    previousBetOrder = betOrder; 
    previousPayout = payout; 
    previousTotalBet = totalBet;
    previousBalance = balance;
    // Toggle or add a 'show-modal' class to the modal class which contains the wheel
    modalEl.classList.toggle('show-modal');
    // let the wheel spin 1080 degree + a random degree between 0 to 720
    let degreeWheel = Math.floor(1080 + Math.random() * 720 + 1);
    wheelEl.style.transform = `rotate(-${degreeWheel}deg)`;

    console.log(`degreeWheel: ${degreeWheel}`);
    // Do the same thing for degreeBall, but the ball needs to be rotated 45deg initially
    let degreeBall = Math.floor(45 + 1080 + Math.random() * 720 + 1);
    ballEl.style.transform = `rotate(${degreeBall}deg)`;


    console.log(`degreeBall: ${degreeBall}`);
    // if the ball does not move, then the index of the winning ball would be 
    // the math.round [remainder of (wheel rotating degree / degrees per slice) / length of NUMBERS]
    console.log(`wheelIdx: ${(degreeWheel/DEGREE_PER_SLICE) % NUMBERS.length}`);
    let wheelRoundedIdx = Math.round((degreeWheel/DEGREE_PER_SLICE) % NUMBERS.length);
    let wheelIdx = Math.round((degreeWheel/DEGREE_PER_SLICE) % NUMBERS.length);

    console.log(`index: ${wheelRoundedIdx}`);
    console.log(`winningBall-wheel only: ${NUMBERS[wheelRoundedIdx]}`);
    // if the wheel does not move, then the index of the winning ball would be
    // the math.round [remainder of (ball rotating degree / degrees per slice) / length of NUMBERS]
    let ballRoundedIdx = Math.round(((degreeBall - 45)/DEGREE_PER_SLICE) % NUMBERS.length);
    let ballIdx = ((degreeBall - 45)/DEGREE_PER_SLICE) % NUMBERS.length;
    console.log(`ballIdx: ${((degreeBall - 45)/DEGREE_PER_SLICE) % NUMBERS.length}`);
    console.log(`ball rounded index: ${ballRoundedIdx}`);
    console.log(`winningBall-ball only: ${NUMBERS[ballRoundedIdx]}`);

    // When the ball and the wheel both rotate, the winning index then would be 
    // the remainder of (the rounded sum of wheelIdx and ballIdx / length of numbers)
    let winningBallIdx = Math.round(wheelIdx + ballIdx) % 38;
    console.log(`winning Idx: ${ ((degreeWheel/DEGREE_PER_SLICE) % NUMBERS.length) + 
    (((degreeBall - 45)/DEGREE_PER_SLICE) % NUMBERS.length)}`);
    console.log(`winning idx round: ${winningBallIdx}`);
    console.log(`winning number: ${NUMBERS[winningBallIdx]}`);

    // update the winning number
    winningNum = NUMBERS[winningBallIdx];
    console.log(winningNum);
    // update the spinStatus to be True
    spinStatus = true; 

}
function handleSpinStops() {
    messageEl.style.visibility = 'hidden'; // hide the message 'Place your bets'
    // if the winningNum is in our payout object, which means player has hit the right number.
    // Update the player's balance.
    if (winningNum in payout) {
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
    // Toggle or remove the 'show-modal' class from the modal class which contains the wheel
    // so the wheel is hidden
    modalEl.classList.toggle('show-modal');
    // reset the wheel and ball rotation degree to intial values
    wheelEl.style.transform = '';
    ballEl.style.transform = 'rotate(45deg)';
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
