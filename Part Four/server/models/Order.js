const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({

    SupplierId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Supplier',
        reqired: true
    },
    GoodsId: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goods' }],
        Freqired: true
    },
    status:{
        type:String,
        enum:[ 'Completed', 'Processing', 'Ordered'],
        default:'Ordered'
    } 
}
    , { timestamps: true })

module.exports = mongoose.model('Order', OrderSchema)