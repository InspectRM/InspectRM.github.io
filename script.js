let clickCount = 0;
let themeIndex = 0;
const themes = ['default', 'dark-theme', 'sunset-theme', 'ocean-theme'];
const greetings = ['Hello World!', 'Hola Mundo!', 'Bonjour Monde!', 'Hallo Welt!', 'Ciao Mondo!'];
let greetingIndex = 0;

// Game variables
let gameScore = 0;
let gameTime = 30;
let gameLevel = 1;
let gameTimer;
let isGameActive = false;
let targetColor = '';
let correctOptionIndex = 0;

function handleClick() {
    clickCount++;
    document.getElementById('clickCount').textContent = clickCount;
    
    if (clickCount % 5 === 0) {
        greetingIndex = (greetingIndex + 1) % greetings.length;
        document.getElementById('mainTitle').textContent = greetings[greetingIndex];
        
        const title = document.getElementById('mainTitle');
        title.style.transform = 'scale(1.2)';
        setTimeout(() => {
            title.style.transform = 'scale(1)';
        }, 300);
    }
    
    document.body.style.background = getRandomGradient();
}

function changeTheme() {
    themeIndex = (themeIndex + 1) % themes.length;
    document.body.className = themes[themeIndex];
}

function changeOrbColor(event, orb) {
    event.stopPropagation();
    const colors = [
        'rgba(255, 107, 107, 0.8)',
        'rgba(255, 206, 107, 0.8)',
        'rgba(107, 255, 157, 0.8)',
        'rgba(107, 178, 255, 0.8)',
        'rgba(178, 107, 255, 0.8)',
        'rgba(255, 107, 255, 0.8)'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    orb.style.background = randomColor;
}

function getRandomGradient() {
    const hues = [
        '135deg, #667eea 0%, #764ba2 100%',
        '135deg, #f093fb 0%, #f5576c 100%',
        '135deg, #4facfe 0%, #00f2fe 100%',
        '135deg, #43e97b 0%, #38f9d7 100%',
        '135deg, #fa709a 0%, #fee140 100%',
        '135deg, #a8edea 0%, #fed6e3 100%'
    ];
    return `linear-gradient(${hues[Math.floor(Math.random() * hues.length)]})`;
}

// Mini Game Functions
function toggleGame() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.classList.toggle('active');
    
    if (gameContainer.classList.contains('active')) {
        resetGame();
    } else {
        stopGame();
    }
}

function startGame() {
    if (isGameActive) return;
    
    isGameActive = true;
    gameScore = 0;
    gameTime = 30;
    gameLevel = 1;
    
    updateGameDisplay();
    generateColorOptions();
    startTimer();
    
    document.getElementById('gameMessage').textContent = 'Game started! Match the colors!';
}

function resetGame() {
    stopGame();
    gameScore = 0;
    gameTime = 30;
    gameLevel = 1;
    updateGameDisplay();
    generateColorOptions();
    document.getElementById('gameMessage').textContent = 'Click Start to begin!';
}

function stopGame() {
    isGameActive = false;
    clearInterval(gameTimer);
}

function startTimer() {
    gameTimer = setInterval(() => {
        gameTime--;
        document.getElementById('gameTime').textContent = gameTime;
        
        if (gameTime <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    stopGame();
    document.getElementById('gameMessage').textContent = `Game Over! Final Score: ${gameScore}`;
    
    // Add confetti effect for good scores
    if (gameScore >= 20) {
        createConfetti();
    }
}

function generateColorOptions() {
    if (!isGameActive) return;
    
    const optionsContainer = document.getElementById('gameOptions');
    optionsContainer.innerHTML = '';
    
    // Generate target color
    targetColor = generateRandomColor();
    document.getElementById('targetColor').style.background = targetColor;
    
    // Determine number of options based on level
    const numOptions = Math.min(6, 3 + gameLevel);
    correctOptionIndex = Math.floor(Math.random() * numOptions);
    
    for (let i = 0; i < numOptions; i++) {
        const color = i === correctOptionIndex ? targetColor : generateRandomColor();
        const option = document.createElement('div');
        option.className = 'color-option';
        option.style.background = color;
        option.onclick = () => checkAnswer(i);
        optionsContainer.appendChild(option);
    }
}

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function checkAnswer(selectedIndex) {
    if (!isGameActive) return;
    
    const options = document.querySelectorAll('.color-option');
    const selectedOption = options[selectedIndex];
    
    if (selectedIndex === correctOptionIndex) {
        // Correct answer
        gameScore += gameLevel * 2;
        selectedOption.classList.add('correct');
        document.getElementById('gameMessage').textContent = 'Correct! +' + (gameLevel * 2) + ' points';
        
        // Level up every 5 points
        if (gameScore % 5 === 0) {
            gameLevel++;
            document.getElementById('gameMessage').textContent += ` Level up! (${gameLevel})`;
        }
        
        setTimeout(() => {
            selectedOption.classList.remove('correct');
            generateColorOptions();
        }, 500);
    } else {
        // Wrong answer
        gameScore = Math.max(0, gameScore - 1);
        selectedOption.classList.add('incorrect');
        document.getElementById('gameMessage').textContent = 'Wrong! -1 point';
        
        setTimeout(() => {
            selectedOption.classList.remove('incorrect');
        }, 500);
    }
    
    updateGameDisplay();
}

function updateGameDisplay() {
    document.getElementById('gameScore').textContent = gameScore;
    document.getElementById('gameTime').textContent = gameTime;
    document.getElementById('gameLevel').textContent = gameLevel;
}

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 2px;
            top: 0;
            left: ${Math.random() * 100}vw;
            opacity: 1;
            pointer-events: none;
            z-index: 3000;
            animation: confettiFall 1s ease-out forwards;
        `;
        
        const keyframes = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        
        const style = document.createElement('style');
        if (!document.head.querySelector('#confetti-style')) {
            style.id = 'confetti-style';
            style.textContent = keyframes;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1000);
    }
}

// Initialize floating elements
document.addEventListener('DOMContentLoaded', function() {
    for (let i = 0; i < 15; i++) {
        createFloatingText();
    }
});

function createFloatingText() {
    const texts = ['★', '●', '◆', '▲', '❤', '☆'];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    floatingText.style.left = Math.random() * 100 + 'vw';
    floatingText.style.top = Math.random() * 100 + 'vh';
    floatingText.style.animationDuration = (15 + Math.random() * 20) + 's';
    floatingText.style.fontSize = (2 + Math.random() * 4) + 'rem';
    floatingText.style.color = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`;
    document.body.appendChild(floatingText);
}