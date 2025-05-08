const Supplier = require("../models/Supplier")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const creatNewUsers = async (req, res) => {
    try {
        const { CompanyName, PhoneNumber, RepresentativeName, ListOfGoods } = req.body
        if (!CompanyName || !PhoneNumber || !RepresentativeName || !ListOfGoods) {
            return res.status(400).json({ message: 'All fields (identity, name, email, password, role) are required' })
        }

        // בדיקת קיום משתמש קיים לפי שם
        const duplicate = await Supplier.findOne({ CompanyName }).lean()
        if (duplicate) {
            return res.status(409).json({ message: 'User with this identity already exists' })
        }

        const supplier = await Supplier.create({ CompanyName, PhoneNumber, RepresentativeName, ListOfGoods })
        if (supplier) {
            return res.status(201).json({ message: 'New supplier created', supplier })
        } else {
            return res.status(400).json({ message: 'Invalid user data' })
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error creating user', error })
    }
}

const getAllSupplier= async (req, res) => {
    try {
        const supplier = await Supplier.find().lean()
        if (!supplier?.length) {
            return res.status(404).json({ message: 'No supplier found' })
        }
        res.json(supplier)
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching supplier', error })
    }
}

const getSupplierById = async (req, res) => {

    try {
        const { _id } = req.params; // מקבלים את ה-Id מתוך פרמטר ה-URL
        const supplier = await Supplier.findById(_id).lean() // חיפוש המוצר לפי ה-ID

        if (!supplier) {
            return res.status(404).json({ message: "supplier not found" });
        }

        return res.status(200).json(supplier); // מחזירים את המוצר עם כל הפרטים כולל ה-ID
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving supplier", error });
    }
}
module.exports = { creatNewUsers, getAllSupplier, getSupplierById}