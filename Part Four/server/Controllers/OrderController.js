const jwt = require('jsonwebtoken')
const Order = require('../models/Order')

const createOrder = async (req, res) => {

    const { SupplierId, GoodsId, status } = req.body
    if (!SupplierId || !GoodsId)
        return res.status(400).json({ message: "Supplier and Goods are required" })

    const order = await Order.create({ SupplierId, GoodsId, status })
    if (order)
        return res.status(201).json(order)
    return res.status(400).json({ message: "invalid product" })

}

const getAllOrders = async (req, res) => {
    try {
        const order = await Order.find().lean()
        if (!order?.length) {
            return res.status(404).json({ message: 'No order found' })
        }
        res.json(order)
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error })
    }
}

const StatusChangeByAdmin = async (req, res) => {
    try {
        const { _id } = req.body
        if (!_id)
            return res.status(400).json({ message: 'order is required' })
        const order = await Order.findById(_id).exec()
        if (!order)
            return res.status(400).json({ message: 'order not found' })

        if (order.status !== "Processing")
            return res.status(404).json({ message: 'status must be Processing' })
        order.status = "Completed"
        const changeStatus = await order.save()
        res.json(`'${changeStatus._id}' changeStatus`)
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching status', error })
    }
}

const StatusChangeBySupplier = async (req, res) => {
    try {
        const { _id } = req.body
        if (!_id)
            return res.status(400).json({ message: 'order is required' })
        const order = await Order.findById(_id).exec()

        if (!order)
            return res.status(400).json({ message: 'order not found' })

        if (order.status !== "Ordered")
            return res.status(404).json({ message: 'status must be Processing' })
        order.status = "Processing"
        const changeStatus = await order.save()
        res.json(`'${changeStatus._id}' changeStatus`)
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching status', error })
    }
}

const getOrdersBySupplierId = async (req, res) => {
    try {
        const {supplierId} = req.params
        const orders = await Order.find({SupplierId:supplierId}).exec()
        res.json(orders)
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching order', error })
    }
}
module.exports = { createOrder, getAllOrders, StatusChangeByAdmin , StatusChangeBySupplier, getOrdersBySupplierId}