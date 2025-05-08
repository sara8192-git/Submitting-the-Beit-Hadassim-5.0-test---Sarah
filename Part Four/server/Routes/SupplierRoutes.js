const express = require("express")
const router = express.Router()
const verifyJWT = require("../middleware/verifyJWT")
const SupplierController= require("../Controllers/SupplierController")
router.use(verifyJWT)
router.get("/", SupplierController.getAllSupplier )
router.get("/:_id", SupplierController.getSupplierById)

module.exports = router
