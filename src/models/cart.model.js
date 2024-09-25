import mongoose from 'mongoose'

const cartCollection = 'carritos'

const productInCartSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'productos', required: true },
    cantidad: { type: Number, required: true }
  });

  const cartSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    productos: [productInCartSchema] 
  },
  {
      versionKey: false
  });

export const cartModel = mongoose.model(cartCollection, cartSchema)