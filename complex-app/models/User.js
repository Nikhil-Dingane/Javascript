const bcrypt = require("bcryptjs")
const usersCollection = require("../db").db().collection("users")
const validator = require("validator")
const md5 = require("md5")

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function() {
    if (typeof(this.data.username != "string")) {
        this.data.username = ""
    }

    if (typeof(this.data.email != "string")) {
        this.data.email = ""
    }

    if (typeof(this.data.password != "string")) {
        this.data.password = ""
    }

    //get rid of bogus properites
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function() {
    return new Promise(async(resolve, reject) => {
        if (this.data.username == "") {
            this.errors.push("Use must provide a username")
        }
        if (this.username != "" && !validator.isAlphanumeric(this.data.username)) {
            this.errors.push("Username consist alphabets and numbers only")
        }
        if (!validator.isEmail(this.data.email)) {
            this.errors.push("Use must provide a valid email address")
        }
        if (this.data.password == "") {
            this.errors.push("Use must provide a password")
        }

        if (this.data.password.length < 12) {
            this.errors.push("Passowrd must be at least of 12 characters")
        }
        if (this.data.password.length > 50) {
            this.errors.push("Passowrd must be less than 50")
        }
        if (this.data.username.length < 3) {
            this.errors.push("Username must be at least of 3 characters")
        }
        if (this.data.username.length > 30) {
            this.errors.push("Username must be less than 30")
        }

        //Only if username is valid then check to see if its already taken
        if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
            let usernameExists = await usersCollection.findOne({ username: this.data.username })
            if (usernameExists) {
                this.errors.push("The username is already taken")
            }
        }
        //email
        if (validator.isEmail(this.data.email)) {
            let emailExists = await usersCollection.findOne({ email: this.data.email })
            if (emailExists) {
                this.errors.push("The email is already taken")
            }
        }
        resolve()
    })
}

User.prototype.login = function(callback) {
    return new Promise((resovle, reject) => {
        usersCollection.findOne({ username: this.data.username }, (err, attemptedUser) => {
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
                this.getAvatar()
                resovle("Congrats")
            } else {
                reject("Invalid username or password.")
            }
        })
    })
}

User.prototype.register = function() {
    return new Promise(async(resolve, reject) => {
        // if #1: validate user data
        await this.validate();
        // if #2 only if there are no validation errors
        //then save the user data into a database
        if (!this.errors.length) {
            // hash user password 
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await usersCollection.insertOne(this.data);
            this.getAvatar()
            resolve()
        } else {
            reject(this.errors)
        }

    })
}

User.prototype.getAvatar = function() {

    this.avatar = `https://gravatar.com/avatar/${this.data.email}?s=128`
}

module.exports = User