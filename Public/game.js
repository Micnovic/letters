//
//  game.js
//  VaporTest
//
//  Created by Михновец Глеб on 22.05.2025.
//

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const letters = [];
const socket = new WebSocket('ws://localhost:8080/game'); // Change to your WebSocket server URL
let selectedLetter = null;
let offsetX, offsetY;

// Generate random letters
for (let i = 0; i < 26; i++) {
    letters.push({
        char: String.fromCharCode(65 + i), // A-Z
        x: canvas.width / 2,
        y: canvas.height / 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
}

// Draw letters on canvas
function drawLetters() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    letters.forEach(letter => {
        ctx.fillStyle = letter.color;
        ctx.font = '48px sans-serif';
        ctx.fillText(letter.char, letter.x, letter.y);
    });
}

// Handle mouse down event
canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(canvas, e);
    selectedLetter = letters.find(letter => isInsideLetter(mousePos, letter));
    if (selectedLetter) {
        offsetX = mousePos.x - selectedLetter.x;
        offsetY = mousePos.y - selectedLetter.y;
    }
});

// Handle mouse move event
canvas.addEventListener('mousemove', (e) => {
    if (selectedLetter) {
        const mousePos = getMousePos(canvas, e);
        selectedLetter.x = mousePos.x - offsetX;
        selectedLetter.y = mousePos.y - offsetY;
        drawLetters();
        socket.send(JSON.stringify(selectedLetter)); // Send new position to server
    }
});

// Handle mouse up event
canvas.addEventListener('mouseup', () => {
    selectedLetter = null;
});

// Get mouse position on canvas
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// Check if mouse is inside letter
function isInsideLetter(mousePos, letter) {
    ctx.font = '48px sans-serif';
    const textWidth = ctx.measureText(letter.char).width;
    return mousePos.x >= letter.x && mousePos.x <= letter.x + textWidth &&
           mousePos.y >= letter.y - 48 && mousePos.y <= letter.y;
}

// WebSocket event listeners

socket.onmessage = (event) => {
    console.log("message")
    const data = JSON.parse(event.data);
    if (Array.isArray(data)) {
//        for (updatedLetter of data) {
//            const letter = letters.find(l => l.char === updatedLetter.char);
//            if (letter) {
//                letter.x = updatedLetter.x;
//                letter.y = updatedLetter.y;
//                drawLetters();
//            }
//        }
    } else {
        console.log("letter")
        const updatedLetter = data
        const letter = letters.find(l => l.char === updatedLetter.char);
        if (letter) {
            letter.x = updatedLetter.x;
            letter.y = updatedLetter.y;
            drawLetters();
        }
    }
};

// Initial draw
drawLetters();
