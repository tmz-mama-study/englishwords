const bookSelect = document.getElementById("bookSelect");
const bookTitle = document.getElementById("bookTitle");
const wordCount = document.getElementById("wordCount");

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

// 読みテスト
document.getElementById("readingBtn").addEventListener("click", startReadingTest);
let currentWord = null;
// 問題表示
function showQuestion() {
    const index = Math.floor(Math.random() * words.length);
    currentWord = words[index];
    questionWord.textContent = currentWord.english;
    answerArea.textContent = "";
}
// テスト読込
function startReadingTest() {
    quizArea.style.display = "block";
    showQuestion();
}
