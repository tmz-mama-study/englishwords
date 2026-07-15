const bookSelect = document.getElementById("bookSelect");
const bookTitle = document.getElementById("bookTitle");
const wordCount = document.getElementById("wordCount");

const answerInput = document.getElementById("answerInput");
const resultArea = document.getElementById("resultArea");
const checkAnswerBtn = document.getElementById("checkAnswerBtn");

let words = [];

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


let questionOrder = [];
let currentPosition = 0;
let currentWord = null;

// ***************************************************************
// 問題表示
// ***************************************************************
function showQuestion() {

    if (currentPosition >= questionOrder.length) {
        finishTest();
        return;
    }

    currentWord = questionOrder[currentPosition];

    questionWord.textContent = currentWord.english;

    answerInput.value = "";
    resultArea.textContent = "";

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
// 読みテスト
// ***************************************************************
document.getElementById("readingBtn").addEventListener("click", startReadingTest);
function startReadingTest() {
	
	const targetElement = event.target;
    quiztitle.textContent = targetElement.textContent;
	
    questionOrder = [...words];
    shuffle(questionOrder);

    currentPosition = 0;
    quizArea.style.display = "block";
    showQuestion();
}

// ***************************************************************
// 回答表示
// ***************************************************************
checkAnswerBtn.addEventListener("click", checkAnswer);
function checkAnswer() {
    const answer = answerInput.value.trim();

    if (answer === currentWord.japanese) {
        resultArea.textContent = "○ 正解";
    } else {
        resultArea.textContent =
            `× 不正解　　答え：${currentWord.japanese}`;
    }
    checkAnswerBtn.disabled = true;
	nextQuestionBtn.hidden = false;
}

// ***************************************************************
// 次の問題
// ***************************************************************
nextQuestionBtn.addEventListener("click", () => {
    currentPosition++;
    showQuestion();
});

// ***************************************************************
// 終了
// ***************************************************************
function finishTest() {
    quizArea.innerHTML = `
        <h2>テスト終了</h2>
        <p>${questionOrder.length}問が終了しました。</p>
    `;
}



