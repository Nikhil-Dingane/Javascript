const usersCollection = require("../db").collection("users")
const validator = require("validator")

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
        this.errors.push("Passowrd must me at least of 12 characters")
    }
    if (this.data.password.length > 100) {
        this.errors.push("Passowrd must me less than 100")
    }
    if (this.data.username.length < 3) {
        this.errors.push("Username must me at least of 3 characters")
    }
    if (this.data.username.length > 30) {
        this.errors.push("Username must me less than 30")
    }
}

User.prototype.login = function(callback) {
    return new Promise((resovle, reject) => {
        usersCollection.findOne({ username: this.data.username }, (err, attemptedUser) => {
            if (attemptedUser && attemptedUser.password == this.data.password) {
                resovle("Congrats")
            } else {
                reject("Invalid username or password.")
            }
        })
    })
}

User.prototype.register = function() {
    // if #1: validate user data
    this.validate();
    // if #2 only if there are no validation errors
    //then save the user data into a database
    if (!this.errors.length) {
        usersCollection.insertOne(this.data);
    }

}

module.exports = User