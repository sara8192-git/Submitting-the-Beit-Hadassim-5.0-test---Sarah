const express = require("express")
const router = express.Router()
const GoodsController = require("../Controllers/GoodsController")
router.post("/createGoods", GoodsController.createGoods)
router.get("/:_id", GoodsController.getProductById)
module.exports = router