const Item = require('../models/model.item')
const Order = require('../models/model.order')
const { isAdmin, isAdminWithPassword } = require('../helpers/isAdmin.js')
const mongoose = require('mongoose')

exports.getAllItems = async (req, res) => {
    console.log("Get all items")

    try {
        const items = await Item.find()
        res.status(200).json({ status: 200, messages: "Get all of items successfully!", items })
    } catch (error) {
        console.error(error)
        res.status(406).json({ status: 406, messages: error.message, items: null })
    }

}

exports.getItemById = async (req, res) => {
    console.log("Get item By Id")
    try {
        const item = await Item.findById(mongoose.Types.ObjectId(req.params.id))
        if (!item) {
            res.status(404).json({ status: 404, messages: "Not found this item!", item: null })
        }
        else {
            res.status(200).json({ status: 200, messages: "Get item by id successfully!", item })
        }
    } catch (error) {
        console.error(error)
        res.status(406).json({ status: 406, messages: error.message, item: null })
    }
}

exports.addNewItem = async (req, res) => {
    console.log("Add new item")
    if (await isAdminWithPassword(req.session.userId, req.body.adminPassword)) {
        try {

            const newItem = new Item({
                name: req.body.name,
                available: req.body.quantity,
                quantity: req.body.quantity,
                category: req.body.category,
                description: req.body.description,
                image: req.body.image
            })

            const item = await newItem.save()
            res.status(201).json({ status: 201, messages: "Add new item successfully!", item })

        } catch (error) {
            console.error(error)
            res.status(400).json({ status: 400, messages: error.message, item: null })
        }
    }
    else {
        res.status(403).json({ status: 403, messages: "Forbidden!", items: null })
    }
}

exports.updateItemById = async (req, res) => {

    if (await isAdminWithPassword(req.session.userId, req.body.adminPassword)) {
        try {

            const item = await Item.findById(mongoose.Types.ObjectId(req.params.id))
            if (!item) {
                return res.status(404).json({ status: 404, messages: "Not found this item!", item: null })
            }

            let newName = req.body.name
            let newAvailable = undefined
            let newQuantity = undefined

            if (newName != item.name) {
                for (let i = 0; i < item.borrowerList.length; i++) {
                    await Order.findByIdAndUpdate(item.borrowerList[i].idOrder, { nameItem: newName })
                }
            }

            if (req.body.quantity != item.quantity) {
                const minQuantity = item.quantity - item.available
                if (req.body.quantity < minQuantity) {
                    return res.status(400).json({
                        status: 400,
                        messages: "The new item quantity must be more significant than the number of items in progress",
                        item: null
                    })
                }
                else {
                    newQuantity = req.body.quantity
                    newAvailable = item.available + (newQuantity - item.quantity)
                }
            }

            const updatedItem = {
                name: req.body.name,
                available: newAvailable,
                quantity: newQuantity,
                category: req.body.category,
                description: req.body.description,
                image: req.body.image
            }


            await Item.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) }, updatedItem, { new: true })
            return res.status(201).json({ status: 201, messages: "Update item successfully!", item })

        } catch (error) {
            console.error(error)
            res.status(400).json({ status: 400, messages: error.message, item: null })
        }
    }
    else {
        res.status(403).json({ status: 403, messages: "Forbidden!", items: null })
    }

}

exports.deleteItemById = async (req, res) => {
    if (await isAdmin(req.session.userId)) {
        try {
            const item = await Item.findOneAndDelete({
                _id: mongoose.Types.ObjectId(req.params.id),
                $expr: { $eq: ["$available", "$quantity"] }
            })

            if (item) {
                return res.status(204).json({ status: 204, messages: "Delete item successfully!", item })
            }
            else {
                return res.status(400).json({ status: 400, messages: "This item is in process of one order", item })
            }


        } catch (error) {
            console.error(error)
            res.status(400).json({ status: 400, messages: error.message, item: null })
        }
    }
    else {
        res.status(403).json({ status: 403, messages: "Forbidden!", item: null })
    }
}