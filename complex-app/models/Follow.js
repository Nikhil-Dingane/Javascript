const usersCollection = require("../db").db().collection("users")
const followsCollection = require("../db").db().collection("follows")
const ObjectID = require("mongodb").ObjectID
const User = require("./User")

let Follow = function(follwedUsername, authorId) {
    this.follwedUsername = follwedUsername
    this.authorId = authorId
    this.errors = []
}

Follow.prototype.cleanUp = function() {
    if (typeof(this.follwedUsername) != "string") { this.follwedUsername = "" }
}

Follow.prototype.validate = async function(action) {
    // followedUsernname must exist in database

    let followedAccount = await usersCollection.findOne({ username: this.follwedUsername })

    if (followedAccount) {
        this.followedId = followedAccount._id
    } else {
        this.errors.push("You can not follow the user that does not exist.")
    }
    let doesFollowAlreadyExist = await followsCollection.findOne({ followedId: this.followedId, authorId: new ObjectID(this.authorId) })
    if (action == "create") {
        if (doesFollowAlreadyExist) { this.errors.push("You are already following this user!") }
    }
    if (action == "delete") {
        if (!doesFollowAlreadyExist) { this.errors.push("You can not stop following someone you do not already follow!") }
    }
    // should not be able to follow yourself
    if (this.followedId.equals(this.authorId)) { this.errors.push("You can not follow yourself") }
}

Follow.prototype.create = function() {
    return new Promise(async(resovle, reject) => {
        this.cleanUp()
        await this.validate("create")
        if (!this.errors.length) {
            await followsCollection.insertOne({ followedId: this.followedId, authorId: new ObjectID(this.authorId) })
            resovle()
        } else {
            reject(this.errors)
        }
    })
}

Follow.isVisitorFollowing = async function(followedId, visitorId) {
    let followDoc = await followsCollection.findOne({ followedId: followedId, authorId: new ObjectID(visitorId) })

    if (followDoc) {
        return true
    } else {
        return false
    }
}

Follow.prototype.delete = function() {
    return new Promise(async(resovle, reject) => {
        this.cleanUp()
        await this.validate("delete")
        if (!this.errors.length) {
            await followsCollection.deleteOne({ followedId: this.followedId, authorId: new ObjectID(this.authorId) })
            resovle()
        } else {
            reject(this.errors)
        }
    })
}

Follow.getFollwersById = function(id) {
    return new Promise(async(resolve, reject) => {
        try {
            let followers = await followsCollection.aggregate([
                { $match: { followedId: id } },
                { $lookup: { from: "users", localField: "authorId", foreignField: "_id", as: "userDoc" } },
                {
                    $project: {
                        username: { $arrayElemAt: ["$userDoc.username", 0] },
                        email: { $arrayElemAt: ["$userDoc.email", 0] }
                    }
                }
            ]).toArray()

            followers = followers.map(function(follower) {
                let user = new User(follower, true)
                return { username: follower.username, avatar: user.avatar }
            })
            resolve(followers)
        } catch (e) {
            console.log(e)
            reject()
        }
    })
}

Follow.getFollowingById = function(id) {
    return new Promise(async(resolve, reject) => {
        try {
            let followers = await followsCollection.aggregate([
                { $match: { authorId: id } },
                { $lookup: { from: "users", localField: "followedId", foreignField: "_id", as: "userDoc" } },
                {
                    $project: {
                        username: { $arrayElemAt: ["$userDoc.username", 0] },
                        email: { $arrayElemAt: ["$userDoc.email", 0] }
                    }
                }
            ]).toArray()

            followers = followers.map(function(follower) {
                let user = new User(follower, true)
                return { username: follower.username, avatar: user.avatar }
            })
            resolve(followers)
        } catch (e) {
            console.log(e)
            reject()
        }
    })
}

Follow.countFollowerById = function(id) {
    return new Promise(async(resolve, reject) => {
        let followerCount = await followsCollection.countDocuments({ followedId: id })
        resolve(followerCount)
    })
}

Follow.countFollowingById = function(id) {

    return new Promise(async(resolve, reject) => {
        let count = await followsCollection.countDocuments({ authorId: id })
        resolve(count)
    })
}

module.exports = Follow