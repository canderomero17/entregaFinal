import express, { urlencoded } from 'express'
import { engine } from 'express-handlebars'
import __dirname from './utils.js';
import * as path from "path"
import fs from 'fs/promises';
import productRouter from './router/product.routes.js';
import { Server } from 'socket.io'
//import CartRouter from './router/carts.routes.js'
//import ProductManager from './controllers/ProductManager.js'


const app = express();
const PORT = 8080;
//const product = new ProductManager();
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Serving static files from:', path.join(__dirname, 'public'));

//configuracion handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname + "/views"))

//app.use("/", express.static(__dirname + "/public"))
app.use('/api/products', productRouter);
//app.use('/api/carts', cartsRouter);

app.get("/", async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data/products.json');
        const data = await fs.readFile(filePath, 'utf8');
        const products = JSON.parse(data);
        res.render('home', {
            title: "E-commerce",
            products // Pasa los productos a la vista
        });
    } catch (error) {
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
})

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor por puerto ${PORT}`)
})

const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {
    console.log("nuevo cliente conectado")

    socket.on('mensaje', (data) => {
        console.log(data)
    })

    socket.emit('mensaje', 'Bienvenido al servidor de WebSockets');



})