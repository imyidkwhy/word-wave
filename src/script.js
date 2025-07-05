const coversGrid = document.getElementById('covers-grid');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');

const songSelectionSection = document.getElementById('song-selection');
const typingAreaSection = document.getElementById('typing-area');
const currentSongTitle = document.getElementById('current-song-title');
const lyricsDisplay = document.getElementById('lyrics-display');
const typingInput = document.getElementById('typing-input');
const backToSelectionButton = document.getElementById('back-to-selection-button');
const resetButton = document.getElementById('reset-button');

let currentSong = null;
let allWords = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime = null;
let errors = 0;
let typedText = "";

async function loadSongs() {
    loadingMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');

    try {
        const response = await fetch('./songs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const songs = await response.json();
        displaySongsCover(songs);
    } catch (error) {
        console.error('Error loading songs:', error);
        errorMessage.classList.remove('hidden');
    } finally {
        loadingMessage.classList.add('hidden');
    }
}

function displaySongsCover(songs) {
    coversGrid.innerHTML = '';
    songs.forEach(song => {
        const songCard = document.createElement('div');
        songCard.classList.add('song-card');
        songCard.innerHTML = `
            <img src="${song.cover}" alt="${song.title} Cover">
            <p>${song.title}</p>
            <p>${song.author}</p>
        `;

        songCard.addEventListener('click', () => {
            selectSong(song);
        });

        coversGrid.appendChild(songCard);
    });
}

function selectSong(song) {
    console.log("Выбрана песня:", song);
    currentSong = song;

    currentSongTitle.textContent = `${song.title} - ${song.author}`;

    allWords = song.lyrics.flatMap(line => line.split(/\s+/).filter(word => word.length > 0));

    currentWordIndex = 0;
    currentCharIndex = 0;
    errors = 0;
    startTime = null;
    typedText = "";

    typingInput.removeEventListener('input', handleTyping);
    typingInput.removeEventListener('keydown', handleKeyDown);
    resetButton.removeEventListener('click', resetTyping);

    typingInput.addEventListener('input', handleTyping);
    typingInput.addEventListener('keydown', handleKeyDown);
    resetButton.addEventListener('click', resetTyping);

    renderLyrics();

    songSelectionSection.classList.add('hidden');
    typingAreaSection.classList.remove('hidden');

    typingAreaSection.style.opacity = '0';
    typingAreaSection.style.animation = 'fadeIn 0.8s ease-out forwards';

    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
}

function renderLyrics() {
    lyricsDisplay.innerHTML = '';

    let displayedText = '';

    allWords.forEach((word, index) => {
        let wordHtml = '';
        if (index === currentWordIndex) {
            word.split('').forEach((char, charIdx) => {
                let spanClass = '';
                if (charIdx < typedText.length) {
                    if (typedText[charIdx].toLowerCase() === char.toLowerCase()) {
                        spanClass = 'correct';
                    } else {
                        spanClass = 'incorrect';
                    }
                } else if (charIdx === currentCharIndex && index === currentWordIndex) {
                    spanClass = 'current-char';
                }
                wordHtml += `<span class="${spanClass}">${char}</span>`;
            });
            displayedText += `<span class="current-word">${wordHtml}</span>`;
        } else if (index < currentWordIndex) {
            displayedText += `<span class="completed-word">${word}</span>`;
        } else {
            displayedText += `<span>${word}</span>`;
        }
        displayedText += ' ';
    });

    lyricsDisplay.innerHTML = displayedText;

    const currentWordElement = lyricsDisplay.querySelector('.current-word');
    if (currentWordElement) {
        currentWordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function handleTyping(e) {
    if (!startTime) {
        startTime = new Date().getTime();
    }

    const currentWord = allWords[currentWordIndex];
    if (!currentWord) {
        endTypingSession();
        return;
    }

    let currentInput = typingInput.value;

    if (currentInput.length > 0) {
        const lastTypedChar = currentInput[currentInput.length - 1];
        const expectedChar = currentWord[currentInput.length - 1];

        if (expectedChar !== undefined && expectedChar !== ' ') {
            if (lastTypedChar.toLowerCase() !== expectedChar.toLowerCase()) {
                errors++;
                typingInput.value = currentInput.substring(0, currentInput.length - 1);
                currentInput = typingInput.value;
            }
        }
    }

    typedText = currentInput;
    currentCharIndex = typedText.length;

    if (typedText.endsWith(' ')) {
        const wordTyped = typedText.trim();

        if (wordTyped.toLowerCase() === currentWord.toLowerCase()) {
            currentWordIndex++;
            currentCharIndex = 0;
            typingInput.value = '';
            typedText = "";
        } else {

        }
    }

    renderLyrics();
}

function handleKeyDown(e) {
    if (e.key === 'Backspace' && typingInput.value === '' && currentWordIndex > 0) {
        currentWordIndex--;
        typedText = allWords[currentWordIndex];
        typingInput.value = typedText;
        currentCharIndex = typedText.length;
        renderLyrics();
        e.preventDefault();
    }
    if (e.key === ' ' && typingInput.value.trim() === '') {
        e.preventDefault();
    }
}

function endTypingSession() {
    const endTime = new Date().getTime();
    const durationSeconds = (endTime - startTime) / 1000;
    const typedWordsCount = allWords.length;
    const wpm = (typedWordsCount / durationSeconds) * 60;

    console.log(`Сессия завершена!`);
    console.log(`Набрано слов: ${typedWordsCount}`);
    console.log(`Время: ${durationSeconds.toFixed(2)} секунд`);
    console.log(`Ошибок: ${errors}`);
    console.log(`WPM: ${wpm.toFixed(2)}`);

    alert(`Сессия завершена!\nНабрано слов: ${typedWordsCount}\nОшибок: ${errors}\nWPM: ${wpm.toFixed(2)}`);

    typingInput.removeEventListener('input', handleTyping);
    typingInput.removeEventListener('keydown', handleKeyDown);
    typingInput.disabled = true;
}

function resetTyping() {
    currentWordIndex = 0;
    currentCharIndex = 0;
    errors = 0;
    startTime = null;
    typedText = "";

    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();

    renderLyrics();

    typingInput.removeEventListener('input', handleTyping);
    typingInput.removeEventListener('keydown', handleKeyDown);
    typingInput.addEventListener('input', handleTyping);
    typingInput.addEventListener('keydown', handleKeyDown);

    console.log("Тренажер сброшен.");
}

backToSelectionButton.addEventListener('click', () => {
    typingAreaSection.classList.add('hidden');
    songSelectionSection.classList.remove('hidden');

    currentSong = null;
    allWords = [];
    currentWordIndex = 0;
    currentCharIndex = 0;
    lyricsDisplay.innerHTML = '';
    typingInput.value = '';
    errors = 0;
    startTime = null;
    typedText = "";

    typingInput.removeEventListener('input', handleTyping);
    typingInput.removeEventListener('keydown', handleKeyDown);
    resetButton.removeEventListener('click', resetTyping);
});

document.addEventListener('DOMContentLoaded', loadSongs);