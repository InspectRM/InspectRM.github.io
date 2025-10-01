let clickCount = 0;
let themeIndex = 0;
const themes = ['default', 'dark-theme', 'sunset-theme', 'ocean-theme'];
const greetings = ['Hello World!', 'Hola Mundo!', 'Bonjour Monde!', 'Hallo Welt!', 'Ciao Mondo!'];
let greetingIndex = 0;

function handleClick() {
    clickCount++;
    document.getElementById('clickCount').textContent = clickCount;
    
    // Change greeting text occasionally
    if (clickCount % 5 === 0) {
        greetingIndex = (greetingIndex + 1) % greetings.length;
        document.getElementById('mainTitle').textContent = greetings[greetingIndex];
        
        // Add a little animation
        const title = document.getElementById('mainTitle');
        title.style.transform = 'scale(1.2)';
        setTimeout(() => {
            title.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Change background color slightly on each click
    document.body.style.background = getRandomGradient();
}

function changeTheme() {
    themeIndex = (themeIndex + 1) % themes.length;
    document.body.className = themes[themeIndex];
}

function changeOrbColor(event, orb) {
    event.stopPropagation(); // Prevent container click
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

// Add some floating particles
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