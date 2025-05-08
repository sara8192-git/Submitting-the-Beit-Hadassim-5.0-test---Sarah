const jwt = require("jsonwebtoken");

const adminMW = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Access denied - No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // בדיקה אם המשתמש הוא המנהל
        if (decoded.userType !== "admin") {
            return res.status(403).json({ message: "Access denied - Not an admin" });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = adminMW;
