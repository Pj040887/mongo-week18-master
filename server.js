var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");
mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

var databaseURI = (process.env.MONGODB_URI ? process.env.MONGODB_URI : "mongodb://localhost/week18hw");
mongoose.connect(databaseURI);
var db = mongoose.connection;

db.on("error", function(error) 
{
  console.log
  console.log("Mongoose Error: ", error);
});

db.once("open", function() 
{
  console.log("Mongoose connection successful.");
});


app.get("/scrape", function(req, res) 
{

  request("http://www.reddit.com/r/programmerhumor", function(error, response, html) 
  {
    
    var $ = cheerio.load(html);
    var result = [];

   
    $("p.title").each(function(i, element) 
    {

    
    var title = $(this).text();

  
    var link = $(element).children().attr("href");

    result.push(
      {
      title: title,
      link: link
      });
    });
  
  res.json(result);
  });
});


app.get("/articles", function(req, res) 
{
  Article.find({}, function(err, doc)
  {
    if(err)
    {
      console.log(err);
      res.status(500).send(err);
    }
    else
    {
      res.json(doc);
    }
  });
});


app.post("/articles", function(req, res)
{
  console.log("request body: "+ JSON.stringify(req.body));
  var newArticle = new Article(req.body);
  console.log("new Article: " + JSON.stringify(newArticle, null, 2));
  Article.create(newArticle, function(err, doc)
  {
    if(err)
    {
      console.log(err);
      res.status(500).send(err);
    }
    else
    {
      console.log("returned doc = " + doc);
      res.json(doc);
    }
  })
})


app.get("/articles/:id", function(req, res) 
{
  
  Article.findOne({"_id": req.params.id}).populate("note").exec(function(err, doc)
  {
    if(err)
    {
      console.log(err);
      res.status(500).send(err);
    }
    else
    {
      console.log("returned doc = " + doc);
      res.json(doc);
    }
  })
});


app.get("/articles/delete/:id", function (req, res)
{
  Article.remove({"_id": req.params.id}, function(err, data)
  {
    if (err) 
    {
      res.status(500);
      console.log(err);
    }
    else
    {
      res.json(data);
    }
  });
  
});


app.post("/articles/:id", function(req, res) 
{
  console.log("new article: " + JSON.stringify(req.body, null, 2));
  var note = new Note(req.body);
  console.log("article object: " + JSON.stringify(note));
  note.save(function(error, doc) 
  {
    if (error) 
    {
      console.log(error);
    }
 
    else 
    {
      Article.findOneAndUpdate({"_id": req.params.id}, {"note": doc._id})
      .exec(function(err, doc)
      {
        if(error)
        {
          console.log(error);
        }
        else
        {
          res.json(doc);
        }
      })
    }
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, function() 
{
  console.log("App running on port 3000!");
});
