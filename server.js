'use strict';

var express = require('express');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var dns = require('dns');
var cors = require('cors');
var shortId = require("shortid");
var validUrl = require('valid-url');
var schema = mongoose.Schema;
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);

app.use(cors());


/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use('/public', express.static(process.cwd() + '/public'));

console.log(process.cwd());

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var shortURLSchema = new schema({
    url: String,
    shortid: String
 
});

var ShortcutURL = mongoose.model('ShortcutURL',shortURLSchema)

app.post('/api/shorturl/new',function(req,res){

var url =req.body.url;
if (validUrl.isUri(url)){
  
    var short = shortId.generate();
    var urlEntry = new ShortcutURL({url:url, shortid:short});
    urlEntry.save(function(err,data){
      if(err){
        res.end('error saving the data');
        return console.log(err);}
      else{
          res.json({"original_url":url,"short_url":'http://'+req.headers['host']+'/'+short});
      }
    })   
} 
else {
    res.json({error:"invalid URL"});
}
 }) 


app.get("/:id" ,function(req,res){
   var shortId = req.params.id;
  console.log(shortId);
   ShortcutURL.find({shortid:shortId},function(err,data){
    if(err){
      
      return console.log('read',err);
    }
  else{
    console.log(data);
    if(data.length >0){
     res.redirect(data[0].url); 
    }
    else{
      res.end('Unable to find the id');
    }
     
  }


})
})


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});