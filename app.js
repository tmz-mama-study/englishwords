const bookSelect = document.getElementById("bookSelect");
const bookTitle = document.getElementById("bookTitle");
const wordCount = document.getElementById("wordCount");

const answerInput = document.getElementById("answerInput");
const resultArea = document.getElementById("resultArea");
const checkAnswerBtn = document.getElementById("checkAnswerBtn");
const keyboard = document.getElementById("keyboard");

let words = [];
let questionOrder = [];
let currentPosition = 0;
let currentWord = null;

let correctCount = 0;
let wrongCount = 0;
let weakWords = [];

let modewk=-1;
const mode_read=0;
const mode_spel=1;

shareBtn.hidden = true;
window.addEventListener("DOMContentLoaded", loadBooks);

async function loadBooks() {
    try {
        const response = await fetch("data/books.txt");
        const text = await response.text();
        
        console.log(text);    // F12で確認
        
        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line !== "");

        bookSelect.innerHTML = '<option value="">選択してください</option>';

        for (const line of lines) {
            const parts = line.split(",");

            if (parts.length < 2) {
                continue;
            }

            const option = document.createElement("option");
            option.textContent = parts[0].trim();
            option.value = parts[1].trim();

            bookSelect.appendChild(option);
        }
        
    } catch (error) {
        console.error("books.txt の読込失敗", error);
    }
}

bookSelect.addEventListener("change", async function () {
    const filePath = this.value;

    if (!filePath) {
        return;
    }

    await loadWordBook(filePath);
});

async function loadWordBook(filePath) {
    try {
        const response = await fetch(filePath);
        const text = await response.text();

        parseWordBook(text);

    } catch (error) {
        console.error("単語帳の読込失敗", error);
    }
}

function parseWordBook(text) {
    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "");

    words = [];

    let title = "タイトルなし";

    for (const line of lines) {

        if (line.startsWith("#")) {
            title = line.substring(1).trim();
            continue;
        }

        const parts = line.split(",");

        if (parts.length < 2) {
            continue;
        }

        words.push({
            english: parts[0].trim(),
            japanese: parts[1].trim()
        });
    }

    bookTitle.textContent = title;
    wordCount.textContent = words.length;

    enableButtons();
}

function enableButtons() {
    document.getElementById("readingBtn").disabled = false;
    document.getElementById("spellingBtn").disabled = false;
    document.getElementById("paperBtn").disabled = false;
    document.getElementById("weakBtn").disabled = false;
}


// ***************************************************************
// 問題表示
// ***************************************************************
function showQuestion(mode) {

    if (currentPosition >= questionOrder.length) {
        finishTest();
        return;
    }

    currentWord = questionOrder[currentPosition];
	
	let questStr = "";
	let inputStr = "";
	let hintStr="";
	
	switch(mode){
	case mode_read:
		questStr = currentWord.english;
		answerInput.disabled = false;
		inputStr="日本語を入力";
		break;
	case mode_spel:
		questStr = currentWord.japanese;
		hintStr = `   (${currentWord.english.length}文字)`;
		answerInput.disabled = true;
		break;
	}
	questionWord.textContent ="("+ (currentPosition+1) + ") " +questStr + hintStr;

    answerInput.value = "";
	resultArea.textContent = "";
	
	const inpt = document.querySelectorAll('#answerInput')[0];
	inpt.placeholder = inputStr;
	
	checkAnswerBtn.disabled = false;
	nextQuestionBtn.hidden = true;
}

// 問題シャッフル
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ***************************************************************
// テスト開始 共通関数
// ***************************************************************
function startTest(){
	const targetElement = event.target;

	quizFinish.style.display = "none";
	readTest.style.display = "none";
	spelTest.style.display = "none";

	shareBtn.hidden = true;

	quiztitle.textContent = targetElement.textContent;

	questionOrder = [...words];
    shuffle(questionOrder);

	currentPosition = 0;
	correctCount = 0;
	wrongCount = 0;
	weakWords = [];
}


// ***************************************************************
// 読みテスト
// ***************************************************************
document.getElementById("readingBtn").addEventListener("click", startReadingTest);
function startReadingTest() {
	
	startTest();
	modewk = mode_read;
	
    quizArea.style.display = "block";
    readTest.style.display = "block";

    showQuestion(modewk);
}





// ***************************************************************
// スペルテスト
// ***************************************************************
document.getElementById("spellingBtn").addEventListener("click", startSpellingTest);
function startSpellingTest() {
	
	startTest();
	modewk = mode_spel;

	createKeyboard();

	quizArea.style.display = "block";
    spelTest.style.display = "block";

    showQuestion(modewk);
}



function showSpellingQuestion() {

    currentWord = questionOrder[currentPosition];
    spellingQuestion.textContent = currentWord.japanese;

    spellingResult.textContent = "";
    nextSpellingBtn.disabled = true;
}
function createKeyboard() {

    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    keyboard.innerHTML = "";

    rows.forEach(row => {

        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";

        row.split("").forEach(letter => {

            const button = document.createElement("button");

            button.textContent = letter;

            button.addEventListener("click", () => {
                answerInput.value += letter.toLowerCase();
            });

            rowDiv.appendChild(button);

        });

        keyboard.appendChild(rowDiv);

    });
}
// ***************************************************************
// キーボードクリア
// ***************************************************************
clearBtn.addEventListener("click", () => {
	answerInput.value = "";
});
// ***************************************************************
// キーボードBackSpace
//// ***************************************************************
backspaceBtn.addEventListener("click", () => {
    answerInput.value = answerInput.value.slice(0, -1);
});







// ***************************************************************
// 回答表示
// ***************************************************************
checkAnswerBtn.addEventListener("click", checkAnswer);
function checkAnswer() {
	const answer = answerInput.value.trim();

	let str="";
	switch(modewk){
	case mode_read:
		str = currentWord.japanese;
		break;
	case mode_spel:
		str = currentWord.english;
		break;
	}
	
	
	if (answer === str) {
		resultArea.textContent = "○ 正解";
		correctCount++;
	} else {
		resultArea.textContent = `× 不正解　　答え：${str}`;

		wrongCount++;
		weakWords.push(currentWord)
		addWeakWord(currentWord);
	}

    checkAnswerBtn.disabled = true;
	answerInput.disabled = true;
	
	nextQuestionBtn.hidden = false;
}
// ***************************************************************
// 次の問題
// ***************************************************************
nextQuestionBtn.addEventListener("click", () => {
    currentPosition++;
    showQuestion(modewk);
});


// ***************************************************************
// 終了
// ***************************************************************
let finishTestData = "";
function finishTest() {
    const total = correctCount + wrongCount;

    const rate =
        total === 0
            ? 0
            : Math.round(correctCount / total * 100);

    let weakWordHtml = "";

    if (weakWords.length > 0) {
        weakWordHtml = `
            <h3>苦手単語</h3>
            <ul>
                ${weakWords
                    .map(word =>
                        `<li>${word.english} : ${word.japanese}</li>`)
                    .join("")}
            </ul>
        `;
    }

	shareBtn.hidden = false;
    quizArea.style.display = "none";
    quizFinish.style.display = "block";

    quizFinish.innerHTML = `
        <h2>テスト終了</h2>
        <p>全${total}問</p>
        <p>正解： ${correctCount}問／不正解 ${wrongCount}問</p>
        <p>正答率 ${rate}%</p>
        ${weakWordHtml}
    `;
	
	let testModeStr = "";
	switch(modewk){
	case mode_read:
		testModeStr = "読み";
		break;
	case mode_spel:
		testModeStr = "スペル";
		break;
	}
	finishTestData = `
        📚 英単語テスト結果(${testModeStr})
        全${total}問
        正解： ${correctCount}問／不正解 ${wrongCount}問
        正答率 ${rate}%
		${weakWordHtml}
    	`;
}



// ***************************************************************
// 苦手単語の読込
// ***************************************************************
function loadWeakWords() {
    const saved =
        localStorage.getItem("weakWords");

    if (saved) {
        weakWords = JSON.parse(saved);
    }
}
// ***************************************************************
// 苦手単語の登録
// ***************************************************************
function addWeakWord(word) {

    const exists = weakWords.some(
        item => item.english === word.english
    );

    if (!exists) {
        weakWords.push(word);

//        localStorage.setItem(
//            "weakWords",
//            JSON.stringify(weakWords)
//        );
		console.log(weakWords);
    }
}

// ***************************************************************
// 共有
// ***************************************************************
document.getElementById("shareBtn").addEventListener("click", shareResult);
function shareResult() {

	let testModeStr = "";
	
	switch(modewk){
	case mode_read:
		testModeStr = "読み";
		break;
	case mode_spel:
		testModeStr = "スペル";
		break;
	}

	const text =
		`📚 英単語テスト結果(${testModeStr})

正解 ${correctCount}問
不正解 ${wrongCount}問`;

    if (navigator.share) {
        navigator.share({
            title: "英単語テスト結果",
            text: finishTestData
        });
    } else {
        navigator.clipboard.writeText(text);
        alert("結果をクリップボードにコピーしました");
    }
}
