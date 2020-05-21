const usersCollection = require("../db").db().collection("users")
const followsCollection = require("../db").db().collection("follows")
const ObjectID = require("mongodb").ObjectID

let Follow = function(follwedUsername, authorId) {
    this.follwedUsername = follwedUsername
    this.authorId = authorId
    this.errors = []
}

Follow.prototype.cleanUp = function() {
    if (typeof(this.follwedUsername) != "string") { this.follwedUsername = "" }
}

Follow.prototype.validate = async function() {
    // followedUsernname must exist in database

    let followedAccount = await usersCollection.findOne({ username: this.follwedUsername })

    if (followedAccount) {
        this.followedId = followedAccount._id
    } else {
        this.errors.push("You can not follow the user that does not exist.")
    }
}

Follow.prototype.create = function() {
    return new Promise(async(resovle, reject) => {
        this.cleanUp()
        await this.validate()
        if (!this.errors.length) {
            await followsCollection.insertOne({ followedId: this.followedId, authorId: new ObjectID(this.authorId) })
            resovle()
        } else {
            reject(this.errors)
        }
    })
}

module.exports = Follow