const User = require("../models/User")
const Post = require("../models/Post")

exports.mustBeLoggedIn = function(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        req.flash("errors", "You must be logged in to perform that action.")
        req.session.save(function() {
            res.redirect("/")
        });
    }
}
exports.login = function(req, res) {
    let user = new User(req.body)
    user.login().then(function(result) {
        req.session.user = {
            avatar: user.data.avatar,
            username: user.data.username,
            _id: user.data._id
        }

        req.session.save(function() {
            res.redirect("/")
        })

    }).catch(function(e) {
        req.flash('errors', e)
            //req.session.flash.errors = [e]
        req.session.save(function() {
            res.redirect("/")
        })
    })
}

exports.logout = function(req, res) {
    req.session.destroy(function() {
        res.redirect("/")
    })
}

exports.register = function(req, res) {
    let user = new User(req.body, true)
    user.register().then(() => {
        req.session.user = { username: user.data.username, avatar: user.data.avatar, _id: user.data._id }
        req.session.save(function() {
            res.redirect("/")
        })
    }).catch((regErrors) => {
        user.errors.forEach(function(error) {
            req.flash('regErrors', error)
        })
        req.session.save(function() {
            res.redirect("/")
        })
    })

}
exports.home = function(req, res) {
    if (req.session.user) {
        res.render("home-dashboard")
    } else {
        res.render("home-guest", { errors: req.flash('errors'), regErrors: req.flash('regErrors') })
    }
}

exports.ifUserExists = function(req, res, next) {
    User.findByUserName(req.params.username).then(function(userDoc) {
        req.profileUser = userDoc
        next()
    }).catch(function() {
        res.render("404")
    })
}

exports.profilePostsScreen = function(req, res) {

    Post.fincByAuthorId(req.profileUser._id).then(function(posts) {
        res.render("../views/profile", {
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar
        })
    }).catch(function() {
        rs.render("404")
    })


}