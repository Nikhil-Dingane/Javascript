const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    res.render('home-guest')
});

router.get("/about", function(req, res) {
    res.send("this is our about page")
})

module.exports = router