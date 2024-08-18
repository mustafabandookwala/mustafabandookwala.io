const peer = new Peer();
const socket = io('https://mustafabandookwala.github.io/'); // Replace with your Socket.io server URL

let myStream;
let currentCall;

// Start the video call
document.getElementById('start-call').addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            myStream = stream;
            document.getElementById('my-video').srcObject = stream;

            peer.on('call', call => {
                call.answer(stream);
                call.on('stream', remoteStream => {
                    document.getElementById('their-video').srcObject = remoteStream;
                });
            });

            socket.emit('ready-to-call', peer.id);
        });
});

// Handle incoming calls
socket.on('make-call', partnerId => {
    if (myStream) {
        const call = peer.call(partnerId, myStream);
        call.on('stream', remoteStream => {
            document.getElementById('their-video').srcObject = remoteStream;
        });
        currentCall = call;
    }
});

// Chat functionality
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');

document.getElementById('send-message').addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
        socket.emit('chat-message', message);
        appendMessage(`You: ${message}`);
        messageInput.value = '';
    }
});

socket.on('chat-message', message => {
    appendMessage(`Partner: ${message}`);
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}
