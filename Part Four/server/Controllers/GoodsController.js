const Goods = require('../models/Goods')

const createGoods = async (req, res) => {

    const { ProductName, UnitPrice, MinimumOrderQuantity } = req.body
    if (!ProductName || !UnitPrice || !MinimumOrderQuantity)
        return res.status(400).json({ message: "all details are required" })

    const duplicate = await Goods.findOne({ ProductName: ProductName }).lean()
    if (duplicate)
        return res.status(409).json({ message: "this product already exist" })

    const goods = await Goods.create({ ProductName, UnitPrice, MinimumOrderQuantity })
    if (goods)
        return res.status(201).json(goods)
    return res.status(400).json({ message: "invalid product" })

}

const getProductById = async (req, res) => {

    try {
        const { _id } = req.params; // מקבלים את ה-Id מתוך פרמטר ה-URL
        const product = await Goods.findById(_id).lean() // חיפוש המוצר לפי ה-ID

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product); // מחזירים את המוצר עם כל הפרטים כולל ה-ID
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving product", error });
    }
}


module.exports = { createGoods , getProductById}