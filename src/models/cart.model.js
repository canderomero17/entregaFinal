import mongoose from 'mongoose'

const cartCollection = 'carritos'

const cartSchema = new mongoose.Schema({
  productos: [
    {
      productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'productos', required: true },
      cantidad: { type: Number, required: true, default: 1 }
    }
  ]
},
{
  versionKey: false
}, { strictPopulate: false });


export const cartModel = mongoose.model(cartCollection, cartSchema)