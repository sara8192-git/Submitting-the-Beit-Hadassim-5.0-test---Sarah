const mongoose = require('mongoose')

const SupplierSchema = new mongoose.Schema({

    CompanyName: {
        type: String,
        required: true
    },
    PhoneNumber: {
        type: String,
        required: true
    },
    RepresentativeName: {
        type: String,
        required: true
    },
    ListOfGoods:{
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goods' }],
        reqired: true
    } 
        
}
    , { timestamps: true })

module.exports = mongoose.model('Supplier', SupplierSchema)