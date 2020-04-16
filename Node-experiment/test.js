   let express = require("express")
   let ourApp = express()

   ourApp.use(express.urlencoded({ extended: false }))

   ourApp.get('/', function(req, res) {
       res.send(`
        <form action="/answer" method="POST"> 
             <p>What color is sky on the clear and sunny day?</p>
             <input name="skyColor" autocomplete="off">
             <button>Submit</button>
        </form>
        `)
   })
   ourApp.post("/answer", function(req, res) {
       if (req.body.skyColor == "blue") {
           res.send(`
                <p> This is the correct answer</p>
                <a href="/">Back to homepage</a>
            `)
       } else {
           res.send(`
                <p>This is not the correct answer</p>
                <a href="/">Back to homepage</a>
            `)
       }
   })

   ourApp.get("/answer", function(req, res) {
       res.send("Are you lost there is nothing to see here.")
   })

   ourApp.listen(3000)
       /* let http=require("http")
        
        let ourApp=http.createServer(function (req,res){
            if(req.url=="/")
            {
                res.end("Hello, and welcome to our website")
            }
            else if(req.url=="/about")
            {
                res.end("Thank you for your interest in our company")
            }
            else
            {
                res.end("Resource nout found")
            }
        })
        ourApp.listen(3000)*/