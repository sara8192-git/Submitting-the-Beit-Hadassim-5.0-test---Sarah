const mongoose = require('mongoose')
const GoodsSchema = new mongoose.Schema({

    ProductName:{
        type: String, 
        required: true
    }, 
    UnitPrice:{
        type: Number, 
        required: true
    }, 
    MinimumOrderQuantity:{
        type: Number, 
        required: true
    }
}
    , { timestamps: true })

module.exports = mongoose.model('Goods', GoodsSchema)