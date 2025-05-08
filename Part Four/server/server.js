const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");

const app = express();
connectDB();
const PORT = process.env.PORT || 7002;

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));
console.log("here")

app.use("/auth", require("./Routes/authRoutes"));
app.use("/supplier", require("./Routes/SupplierRoutes"))
app.use("/goods", require("./Routes/GoodsRoutes"))
app.use("/order", require("./Routes/OrderRoutes"))

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", err => {
    console.log(err);
});

