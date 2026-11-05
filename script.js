
const statusDisplay = document.getElementById('status-display');
const outputArea = document.getElementById('output-area');
const pulsingCore = document.querySelector('.pulsing-core');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        statusDisplay.textContent = 'Listening...';
        pulsingCore.style.background = '#ff0077';
    };

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        outputArea.textContent = `You said: "${command}"`;
        handleCommand(command);
    };

    recognition.onerror = (event) => {
        statusDisplay.textContent = 'Error occurred';
    };

    recognition.onend = () => {
        statusDisplay.textContent = 'System Idle';
        pulsingCore.style.background = '#00ffcc';
    };

    document.body.addEventListener('click', () => {
        recognition.start();
    });
} else {
    statusDisplay.textContent = 'Speech not supported';
}

function handleCommand(command) {
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = 'en-US';
    
    if (command.toLowerCase().includes('hello')) {
        utterance.text = 'Hello, I am Mira. How can I assist you?';
    } else {
        utterance.text = `Processing: ${command}`;
    }
    
    window.speechSynthesis.speak(utterance);
}

