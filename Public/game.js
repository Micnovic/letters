//
//  game.js
//  VaporTest
//
//  Created by Михновец Глеб on 22.05.2025.
//

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const letters = [];
const socket = new WebSocket('ws://10.0.1.25:80/game'); // Change to your WebSocket server URL
let selectedLetter = null;
let offsetX, offsetY;

// Generate random letters
for (let i = 0; i < 60; i++) {
    letters.push({
        index: i,
        char: String.fromCharCode(65 + i), // A-Z
        x: canvas.width / 2,
        y: canvas.height / 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        rotation: Math.random() * 30 - 15
    });
}

// Draw letters on canvas
function drawLetters() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    letters.forEach(letter => {
        ctx.fillStyle = letter.color;
        ctx.font = "30px Nunito"
//        ctx.font = '48px sans-serif';
        ctx.save();
        ctx.translate(letter.x, letter.y);
        ctx.rotate(letter.rotation * Math.PI / 180);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Shadow color
        ctx.shadowOffsetX = 1; // Horizontal shadow offset
        ctx.shadowOffsetY = 1; // Vertical shadow offset
        ctx.shadowBlur = 2; // Shadow blur
        ctx.fillText(letter.char, 0, 0);
        ctx.restore();
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

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touchPos = getTouchPos(canvas, e);
    selectedLetter = letters.find(letter => isInsideLetter(touchPos, letter));
    if (selectedLetter) {
        offsetX = touchPos.x - selectedLetter.x;
        offsetY = touchPos.y - selectedLetter.y;
    }
})

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

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (selectedLetter) {
        const touchPos = getTouchPos(canvas, e);
        selectedLetter.x = touchPos.x - offsetX;
        selectedLetter.y = touchPos.y - offsetY;
        drawLetters();
        socket.send(JSON.stringify(selectedLetter)); // Send new position to server
    }
})

// Handle mouse up event
canvas.addEventListener('mouseup', () => {
    selectedLetter = null;
});

canvas.addEventListener('touchend', () => {
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
function getTouchPos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const touch = evt.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
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
socket.open = (event) => {
    console.log("WebSocket is open now.");
    // You can send a message to the server if needed
    socket.send("Hello Server!");
};

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
        const letter = letters.find(l => l.index === updatedLetter.index);
        if (letter) {
            letter.char = updatedLetter.char;
            letter.x = updatedLetter.x;
            letter.y = updatedLetter.y;
            letter.rotation = updatedLetter.rotation;
            drawLetters();
        }
    }
};

// Initial draw
drawLetters();
