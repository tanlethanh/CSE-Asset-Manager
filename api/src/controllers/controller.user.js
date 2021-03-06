const { isAdmin, isAdminWithPassword } = require('../helpers/isAdmin.js')
const User = require('../models/model.user')
const Order = require('../models/model.order')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { findByIdAndUpdate } = require('../models/model.user')

const saltRounds = 10

exports.getAllUsers = async (req, res) => {
    if (await isAdmin(req.session.userId)) {
        try {
            const users = await User.find()
            res.status(200).json({
                status: 200,
                messages: "Get all of users successfully!",
                users
            })
        } catch (error) {
            console.error(error)
            res.status(406).json({
                status: 406,
                messages: error.message,
                users: null
            })
        }
    }
    else {
        res.status(403).json({
            status: 403,
            messages: "Forbidden!",
            items: null
        })
    }
}
exports.getUserById = async (req, res) => {
    if (await isAdmin(req.session.userId)) {
        console.log("Get user By Id")
        try {
            const user = await User.findById(mongoose.Types.ObjectId(req.params.id))
            if (!user) {
                res.status(404).json({ status: 404, messages: "Not found this user!", user: null })
            }
            else {
                res.status(200).json({ status: 200, messages: "Get user by id successfully!", user })
            }
        } catch (error) {
            console.error(error)
            res.status(406).json({ status: 406, messages: error.message, user: null })
        }
    }
    else {
        res.status(403).json({ status: 403, messages: "Forbidden!", user: null })
    }
}
exports.updateUserById = async (req, res, next) => {
    if (await isAdminWithPassword(req.session.userId, req.body.adminPassword)) {
        try {
            const id = mongoose.Types.ObjectId(req.params.id)
            const user = await User.findById(id)

            if (!user) {
                return res.status(404).json({ status: 404, messages: "Not found this user!", user: null })
            }

            let updateUser

            // change permission of user
            if (req.query && req.query.togglePermission) {
                if (req.query.togglePermission === "enable") {
                    if (user.isAdmin) {
                        return res.status(400).json({ status: 400, messages: "This user is admin, can't unenable", user: null })
                    }
                    else {
                        updateUser = await User.findByIdAndUpdate(id, { enable: !user.enable, isAdmin: false }, { new: true })
                    }
                }
                else if (req.query.togglePermission === "admin") {
                    updateUser = await User.findByIdAndUpdate(id, { isAdmin: !user.isAdmin, enable: true }, { new: true })
                }
                else {
                    return res.status(400).json({ status: 400, messages: "Not valid permission request", user: null })
                }

                return res.status(201).json({
                    status: 201, messages: `Toggle ${req.query.togglePermission} permission successfully!`,
                    user: updateUser
                })
            }
            // edit information of user
            else {
                let hash_password = undefined
                if (req.body.password) {
                    hash_password = await bcrypt.hash(req.body.password, saltRounds)

                }

                // update user in database
                updateUser = await User.findByIdAndUpdate(id, {
                    fullName: req.body.fullName,
                    studentCode: req.body.studentCode,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    hash_password: hash_password
                }, { new: true })

                // update name of user in list of order
                for (let i = 0; i < user.orders.length; i++) {
                    await Order.findByIdAndUpdate(user.orders[i], { nameUser: updateUser.fullName })
                }

                return res.status(201).json({
                    status: 201, messages: `Update successfully!`,
                    user: updateUser
                })
            }


        } catch (error) {
            // console.error(error)
            res.status(400).json({ status: 400, messages: error.message, user: null })
        }
    }
    else {
        res.status(403).json({ status: 403, messages: "Forbidden!", items: null })
    }
}
exports.deleteUserById = async (req, res) => {
    console.log("delete user by id")
    if (await isAdmin(req.session.userId)) {
        try {
            if (String(req.session.userId) === String(req.params.id)) {
                return res.status(400).json({ status: 400, messages: "Can't delete yourself", user: null })
            }

            const user = await User.findById(mongoose.Types.ObjectId(req.params.id))

            if (!user) {
                return res.status(404).json({ status: 404, messages: "Not found this user!", user: null })
            }

            if (user.isAdmin) {
                return res.status(400).json({ status: 400, messages: "This user is admin, can't delete", user: null })
            }

            // console.log(user.orders)
            const orders = await Order.find({ _id: { $in: user.orders } });
            // console.log(orders)

            for (let i = 0; i < orders.length; i++) {
                console.log("loop")
                if (orders[i].status === 'ok') {
                    return res.status(400).json({
                        status: 400,
                        messages: "This user is in a system process",
                        user: null

                    })
                }
            }

            await User.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) })

            return res.status(204).json({})

        } catch (error) {
            console.error(error)
            res.status(400).json({ status: 400, messages: error.message, user: null })
        }
    }
    else {
        res.status(403).json({ status: 403, messages: "Forbidden!", user: null })
    }
}