const express = require("express")
const adminMW = require("../middleware/adminMW")
const supplierMW= require("../middleware/supplierMW")
const verifyJWT = require("../middleware/verifyJWT")
const router = express.Router()
router.use(verifyJWT)
const OrderController = require("../Controllers/OrderController")

router.post("/createOrder",adminMW, OrderController.createOrder)
router.get("/", adminMW,OrderController.getAllOrders )
router.put("/admin",adminMW,OrderController.StatusChangeByAdmin)
router.put("/supplier",supplierMW,OrderController.StatusChangeBySupplier)
router.get("/:supplierId", supplierMW,OrderController.getOrdersBySupplierId )

module.exports = router