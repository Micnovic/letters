//
//  game.js
//  VaporTest
//
//  Created by Михновец Глеб on 22.05.2025.
//

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const letters = [];
const socket = new WebSocket('ws://0.0.0.0:1337/game') // WebSocket('ws://10.0.1.12:1337/game') WebSocket('ws://188.255.103.120:1337/game'); // Change to your WebSocket server URL
let selectedLetter = null;
var offsetX = 0;
var offsetY = 0;
var sharedCanvas = {x: 800, y: 600};
var differenceRatio = 1;

function resizeCanvas() {
    let aspectRatio = 800/600;
    let newWidth = Math.min(window.innerWidth, 800);
    differenceRatio = newWidth / sharedCanvas.x;
    const newHeight = newWidth / aspectRatio;
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    drawLetters();
}

// Generate random letters
for (let i = 0; i < 200; i++) {
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
        ctx.save();
        ctx.fillStyle = letter.color;
        ctx.font = 30 * differenceRatio + "px Nunito"
//        ctx.font = '48px sans-serif';
        const scaledX = letter.x * (canvas.width / sharedCanvas.x);
        const scaledY = letter.y * (canvas.height / sharedCanvas.y);
        ctx.translate(scaledX, scaledY);
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
    console.log("Mouse Position:", mousePos);
    selectedLetter = letters.find(letter => isInsideLetter(mousePos, letter));
    if (selectedLetter) {
        console.log("Selected Letter:", selectedLetter);
        offsetX = mousePos.x - (selectedLetter.x * (canvas.width / sharedCanvas.x));
        offsetY = mousePos.y - (selectedLetter.y * (canvas.height / sharedCanvas.y));
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touchPos = getTouchPos(canvas, e);
    selectedLetter = letters.find(letter => isInsideLetter(touchPos, letter));
    if (selectedLetter) {
        offsetX = touchPos.x - (selectedLetter.x * (canvas.width / sharedCanvas.x));
        offsetY = touchPos.y - (selectedLetter.y * (canvas.height / sharedCanvas.y));
    }
})

// Handle mouse move event
canvas.addEventListener('mousemove', (e) => {
    if (selectedLetter) {
        const mousePos = getMousePos(canvas, e);
        selectedLetter.x = (mousePos.x) * (sharedCanvas.x / canvas.width) - offsetX;
        selectedLetter.y = (mousePos.y) * (sharedCanvas.y / canvas.height) - offsetY;
        drawLetters();
        socket.send(JSON.stringify(selectedLetter)); // Send new position to server
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (selectedLetter) {
        const touchPos = getTouchPos(canvas, e);
        selectedLetter.x = touchPos.x * (sharedCanvas.x / canvas.width) - offsetX;
        selectedLetter.y = touchPos.y * (sharedCanvas.y / canvas.height) - offsetY;
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
        x: (evt.clientX) - rect.left,// * (sharedCanvas.x / canvas.width)) - rect.left, // * (canvas.width / sharedCanvas.x)) - rect.left, //* (sharedCanvas.x / canvas.width) - rect.left,
        y: (evt.clientY) - rect.top // * (sharedCanvas.y / canvas.height)) - rect.top // * (canvas.height / sharedCanvas.y)) - rect.top //* (sharedCanvas.y / canvas.height)  - rect.top
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
    const textWidth = ctx.measureText(letter.char).width * differenceRatio;
    const textHeight = 30 * differenceRatio;
    //const rect = ctx.canvas.getBoundingClientRect();
    const scaledX = letter.x * (canvas.width / sharedCanvas.x);// - rect.left;
    const scaledY = letter.y * (canvas.height / sharedCanvas.y);// - rect.top;
    return mousePos.x >= scaledX && mousePos.x <= scaledX + textWidth &&
           mousePos.y >= scaledY - textHeight && mousePos.y <= scaledY;
}

// WebSocket event listeners
socket.open = (event) => {
    console.log("WebSocket is open now.");
    // You can send a message to the server if needed
    socket.send("Hello Server!");
};

socket.onmessage = (event) => {
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
        const updatedLetter = data
        const letter = letters.find(l => l.index === updatedLetter.index);
        if (letter) {
            letter.char = updatedLetter.char;
            letter.x = updatedLetter.x;
            letter.y = updatedLetter.y;
            letter.rotation = updatedLetter.rotation;
            letter.color = updatedLetter.color;
            drawLetters();
        }
    }
};

// Initial draw
resizeCanvas();
drawLetters();
window.addEventListener('resize', resizeCanvas);
