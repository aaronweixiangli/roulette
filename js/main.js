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
    '1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36', 
    '2', '4', '6', '8', '10', '11', '13', '15', '17', '20', '22', '24', '26', '28', '29', '31', '33', '35',
    '0', '00'
];

/*----- state variables -----*/
let totalBet; // integer; store the total bet amount in the betting table
let betOrder; // array; store the bet made by player in order.
let balance; // integer; store the player's current balance
let board; // array; store the bet amount in each 'cell'
let payout; //object; store numbers as key and payout as value. return the payout of that number if it's the winning number
let winningNum; // integer; store the winning number
let chosenChip; // integer; store the value of the chip chosen by the player
let betStatus; // integer; 1/-1 represents True/False
let spinStatus; // interger; 1/-1 represents True/False
let oddHistory; // array; store the odd winning numbers of the past ten games.
let evenHistory; // array; store the even winning numbers of the past ten games.
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
    betStatus = 1; // True
    spinStatus = -1; //False when bet amount = 0;
    oddHistory = [];
    evenHistory = [];
    render();
}

function handleBet(evt) {
    // Guard. If the clicked element has no 'nums' attribute. Do nothing
    if (!evt.target.getAttribute('nums') && !evt.target.parentElement.getAttribute('nums')) return;
    // Guard. If the player's current balance is less than or equal to zero. Do nothing
    if (balance <= 0) return;
    let betPosition = evt.target;
    console.log(betPosition);
    let betIdx;
    if (betPosition.getAttribute('class') === 'larger-area' || 
        betPosition.getAttribute('class') === 'taller' ||
        betPosition.getAttribute('class') === 'wider') {
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

function handleSpin(evt) {
    previousBoard = board; 
    previousBetOrder = betOrder; 
    previousPayout = payout; 
    previousTotalBet = totalBet;
    previousBalance = balance;
    let winningNumIdx = Math.floor(Math.random() * NUMBERS.length);
    winningNum = NUMBERS[winningNumIdx];
    console.log(winningNum);
    if (winningNum in payout) {
        balance += payout[winningNum];
        messageEl.textContent = `Winning ball is ${winningNum}. Player wins!`;
    } else {
        messageEl.textContent = `Winning ball is ${winningNum}. Dealer wins!`;
    }
    if (parseInt(winningNum) % 2 === 1){
        oddHistory.push(winningNum);
        evenHistory.push(null);
    } else {
        evenHistory.push(winningNum);
        oddHistory.push(null);
    }
    if (oddHistory.length > 10) {
        oddHistory.shift();
        evenHistory.shift();
    }
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
    betStatus = 1; // True
    spinStatus = -1; //False when bet amount = 0;
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
