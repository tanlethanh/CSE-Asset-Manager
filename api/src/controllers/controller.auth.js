const bcrypt = require("bcrypt")
const User = require('../models/model.user')
const isAuthenticated = require('../helpers/isAuth.js')

const saltRounds = 10;

/* 
 * We need to use validation to ensure that body is valid
 */

exports.register = async (req, res) => {
    try {
        // create hash password
        const hashPassword = await bcrypt.hash(req.body.password, saltRounds)

        const newUser = new User({
            fullName: req.body.fullName,
            studentCode: req.body.studentCode,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            hash_password: hashPassword
        })

        // save new user into database
        const user = await newUser.save()

        res.status(201).json({ status: 201, message: "Register successfully!", user })

    } catch (error) {
        console.error(error)
        res.status(400).json({ status: 400, message: error.message })
    }

}

exports.login = async (req, res) => {
    try {
        // find user by email in database, in case of email not found
        if (!req.body.email || !req.body.password) {
            throw { message: "Dont enough fields to login" }
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(201).json({ status: 201, message: "User is not registered", user: null })
        }
        
        if (user.enable == false) {
            return res.status(201).json({ status: 201, message: "User is not enable", user: null })
        }

        // compare password using bcrypt.compare, dont create new hash password to compare
        const matchPassword = await bcrypt.compare(req.body.password, user.hash_password)

        // create session id for login when password is matched
        if (matchPassword) {
            // regenerate the session, which is good practice to help
            // guard against forms of session fixation
            await req.session.regenerate(function (err) {
                if (err) next(err)
                // store user information in session, typically a user id
                console.log(user._id)
                req.session.userId = user._id

                // save the session before redirection to ensure page
                // load does not happen before session is saved
                req.session.save()

                // respone in callback to fix authentication
                res.status(201).json({ status: 201, message: "Login successfully!", user })
            })

        }
        else {
            res.status(201).json({ status: 201, message: "Wrong password!", user: null })
        }



    } catch (error) {
        console.error(error)
        res.status(400).json({ status: 400, message: error.message })
    }
}

exports.logout = async (req, res) => {
    // logout logic

    try {
        req.session.destroy((err) => {
            if (err) next(err)
            res.status(201).json({ status: 201, message: "Logout successfully!", user: null })
        })

    } catch (error) {
        console.error(error)
        res.status(400).json({ status: 400, message: error.message })
    }
    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user

}