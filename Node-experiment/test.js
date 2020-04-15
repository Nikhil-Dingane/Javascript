let http=require("http")

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
ourApp.listen(3000)