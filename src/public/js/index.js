const socket = io();
socket.on('connect', () => {
    console.log('Conectado al servidor de WebSockets');
});

socket.on('mensaje', (data) => {
    console.log('Mensaje recibido:', data);
});