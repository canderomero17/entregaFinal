import fs from 'fs/promises';
import path from 'path';
import { getDirname } from '../utils.js';

const __dirname = getDirname(import.meta.url);
const filePath = path.join(__dirname, '../data/carts.json');
const filePathProducts = path.join(__dirname, '../data/products.json');

export default class CartManager {
    constructor() {
        this.carts = [];
        this.init();
    }

    async init() {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            this.carts = JSON.parse(data);
        } catch (error) {
            console.error('Error al leer el archivo de carritos:', error);
            this.carts = [];
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(filePath, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            throw new Error('Error al guardar los carritos');
        }
    }

    async getCartById(cartId) {
        const cart = this.carts.find(c => c.id === cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart;
    }

    async createCart() {
        const newId = this.carts.length ? this.carts[this.carts.length - 1].id + 1 : 1;
        const newCart = { id: newId, products: [] };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async deleteCart(cartId) {
        const initialLength = this.carts.length;
        this.carts = this.carts.filter(c => c.id !== cartId);
        if (this.carts.length === initialLength) {
            throw new Error('Carrito no encontrado');
        }
        await this.saveCarts();
    }

    async addProductToCart(cartId, productId) {
        const cart = await this.getCartById(cartId);
        try {
            const productsData = await fs.readFile(filePathProducts, 'utf-8');
            const products = JSON.parse(productsData);
            const product = products.find(p => p.id === productId);

            if (!product) {
                throw new Error('Producto no encontrado');
            }

            const productInCart = cart.products.find(p => p.productId === productId);

            if (productInCart) {
                productInCart.cantidad += 1;
            } else {
                cart.products.push({ productId, cantidad: 1 });
            }

            await this.saveCarts();
            return cart;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}