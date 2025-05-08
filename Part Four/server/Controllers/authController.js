const Supplier = require("../models/Supplier")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Goods = require('../models/Goods'); // או נתיב נכון אחר

const login = async (req, res) => {
    try {
        const { CompanyName } = req.body

        if (!CompanyName) {
            return res.status(400).json({ message: 'All the items are required' })
        }

        if (CompanyName === process.env.ADMIN_USERNAME) {
            const adminInfo = { CompanyName, userType: "admin" };
            const accessToken = jwt.sign(adminInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' });

            return res.status(200).json({
                accessToken,
                userType: "admin"
            });
        }
        const foundSupplier = await Supplier.findOne({ CompanyName }).lean()
        if (!foundSupplier) {
            return res.status(401).json({ message: 'Unauthorized - Invalid CompanyName' })
        }

        // const match = await bcrypt.compare(password, foundUser.password)
        // console.log(match);
        // if (!match) {
        //     return res.status(401).json({ message: 'Unauthorized - Invalid password' })
        // }
        const SupplierInfo = {
            _id: foundSupplier._id,   
            CompanyName,         
            userType: "supplier"  // הוספנו את המידע הזה
        }
        const accessToken = jwt.sign(SupplierInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })
        console.log(accessToken)
        return res.json({ accessToken, userType: "supplier"})
    } catch (error) {
        console.error(error); // הוספת הדפסת שגיאות
        return res.status(500).json({ message: 'Error during login', error })
    }
}



const register = async (req, res) => {
    try {
        const { CompanyName, PhoneNumber, RepresentativeName, ListOfGoods } = req.body;

        if (!CompanyName || !PhoneNumber || !RepresentativeName || !ListOfGoods) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const duplicate = await Supplier.findOne({ CompanyName }).lean();
        if (duplicate) {
            return res.status(409).json({ message: 'Supplier with this name already exists' });
        }
        if (typeof RepresentativeName !== 'string') {
            return res.status(400).json({ message: 'RepresentativeName must be a string' });
        }
        
        // יצירת רשימת המוצרים
        const productIds = [];
        for (let product of ListOfGoods) {
            // שלח כל מוצר לפונקציה create שתיצור את המוצר
            const goods = await Goods.create({
                ProductName: product.ProductName,
                UnitPrice: product.UnitPrice,
                MinimumOrderQuantity: product.MinimumOrderQuantity
            });


            // הוספת מזהה המוצר לרשימה
            productIds.push(goods._id);  // כאן אתה משתמש ב-`goods._id` ולא ב-`createGoods._id`
        }
        // יצירת הספק עם מזהי המוצרים
        const supplierObject = {
            CompanyName,
            PhoneNumber,
            RepresentativeName,
            ListOfGoods: productIds // הוספת המזהים לרשימה של הספק
        };

        const supplier = await Supplier.create(supplierObject);

        if (supplier) {
            return res.status(201).json({ message: `New supplier ${supplier.CompanyName} created successfully` });
        } else {
            return res.status(400).json({ message: 'Error creating supplier' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error during registration', error });
    }
}
module.exports = { login, register }