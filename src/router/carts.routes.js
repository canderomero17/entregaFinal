import express from 'express';
import { cartModel } from '../models/cart.model.js';
import { productModel } from '../models/product.model.js';

const router = express.Router();

// OBTENER CARRITO POR ID
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate('productos.productoId');
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ error: 'Error al obtener el carrito', message: error.message });
    }
});

// AGREGAR CARRITO
router.post('/', async (req, res) => {
    try {
        const { productos } = req.body;

        if (!productos || !Array.isArray(productos)) {
            return res.status(400).json({ error: 'Los productos deben ser un array' });
        }

        for (const producto of productos) {
            if (!producto.productoId || typeof producto.cantidad !== 'number') {
                return res.status(400).json({
                    error: 'Cada producto debe tener un productoId válido y una cantidad numérica',
                });
            }
        }

        const newCart = new cartModel({ productos });

        await newCart.save()
        res.status(201).json(newCart);
    } catch (error) {
        console.error('Error al crear el carrito:', error);
        res.status(500).json({ error: 'Error al crear el nuevo carrito', message: error.message });
    }
});

// ELIMINAR CARRITO POR ID
router.delete('/:cid', async (req, res) => {
    try {
        const result = await cartModel.deleteOne({ _id: req.params.cid });
        if (result.deletedCount > 0) {
            res.status(202).json({ status: 'success', message: 'Carrito eliminado' });
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar el carrito:', error);
        res.status(500).json({ error: 'Error al eliminar el carrito', message: error.message });
    }
});

// AGREGAR PRODUCTO A CARRITO POR SU ID
router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    try {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const productInCart = cart.productos.find(p => p.productoId.toString() === productId);
        if (productInCart) {
            productInCart.cantidad += 1;
        } else {
            cart.productos.push({ productoId: product._id, cantidad: 1 });
        }

        await cart.save();

        res.status(201).json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// ELIMINAR PRODUCTO DEL CARRITO POR SU ID
router.delete('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const productIndex = cart.productos.findIndex(p => p.productoId.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        cart.productos.splice(productIndex, 1);
        await cart.save();

        res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ error: 'Error al eliminar producto del carrito', message: error.message });
    }
});

// ACTUALIZAR CARRITO
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;  
    const { productos } = req.body;
  
    try {
      for (const item of productos) {
        const producto = await productModel.findById(item.productoId);
  
        if (!producto) {
          return res.status(404).json({ message: `Producto con ID ${item.productoId} no encontrado.` });
        }
  
        if (producto.stock < item.cantidad) {
          return res.status(400).json({ message: `No hay suficiente stock para el producto ${producto.nombre}.` });
        }
      }
  
      const carritoActualizado = await cartModel.findByIdAndUpdate(
        cid,
        { productos },  
        { new: true }  
      );
  
      if (!carritoActualizado) {
        return res.status(404).json({ message: 'Carrito no encontrado.' });
      }
  
      res.status(200).json({ message: 'Carrito actualizado con éxito.', carrito: carritoActualizado });
    } catch (error) {
      res.status(500).json({ message: 'Error actualizando el carrito.', error });
    }
  });

//ACTUALIZAR CANTIDAD DE PRODUCTOS DE UN CARRITO
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;  
    const { cantidad } = req.body;    
  
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'Cantidad debe ser mayor que 0.' });
    }
  
    try {
      const producto = await productModel.findById(pid);
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado.' });
      }
  
      const carrito = await cartModel.findById(cid);
      if (!carrito) {
        return res.status(404).json({ message: 'Carrito no encontrado.' });
      }
  
      const productoEnCarrito = carrito.productos.find(p => p.productoId.toString() === pid);
      if (!productoEnCarrito) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
      }
  
      if (producto.stock < cantidad) {
        return res.status(400).json({ message: 'No hay suficiente stock disponible.' });
      }
  
      productoEnCarrito.cantidad = cantidad;
  
      await carrito.save();
  
      res.status(200).json({ message: 'Cantidad actualizada con éxito.', carrito });
    } catch (error) {
      res.status(500).json({ message: 'Error actualizando la cantidad del producto.', error });
    }
  });

  //ELIMINAR TODOS LOS PRODUCTOS DEL CARRITO
  router.delete('/deleteProductos/:cid', async (req, res) => {
    const { cid } = req.params;  
  
    try {
      const carrito = await cartModel.findById(cid);
  
      if (!carrito) {
        return res.status(404).json({ message: 'Carrito no encontrado.' });
      }
  
      carrito.productos = [];
  
      await carrito.save();
  
      res.status(200).json({ message: 'Carrito vaciado con éxito.' });
    } catch (error) {
      res.status(500).json({ message: 'Error al vaciar el carrito.', error });
    }
  });
  

export default router;
