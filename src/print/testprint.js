const WebSocket = require('ws');

const printSocketURL = 'ws://localhost:8765';
const rcpt = [
    {"op": "text", "text": "Left justified", "align": "left"},
    {"op": "text", "text": "Right justified", "align": "right"},
];

let printSocket = new WebSocket(printSocketURL);

printSocket.addEventListener('message', function (event) {
    console.log('Print server response:', event.data);
    printSocket.close();
});
printSocket.addEventListener('open', function (event) {
    console.log('Print server connected');
    printSocket.send(JSON.stringify(rcpt));
});
printSocket.addEventListener('error', function () {
    console.log('Print server connection failed');
    printSocket.close();
});

