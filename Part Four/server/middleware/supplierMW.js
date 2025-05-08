const jwt = require("jsonwebtoken");

const supplierMW = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Access denied - No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // בדיקה אם המשתמש הוא ספק
        if (decoded.userType !== "supplier") {
            return res.status(403).json({ message: "Access denied - Not an supplier" });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = supplierMW;
