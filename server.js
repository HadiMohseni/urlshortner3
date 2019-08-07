'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true})
  .then(() => console.log('Connected'))
  .catch(error => console.log(error));

var Schema = mongoose.Schema;
var url = new Schema({
  name : {type:String},
  shortUrl : {type:Number}
});
 
var Url = mongoose.model('Url', url);

var counter = new Schema({name : {type:String}, num : {type:Number}});
var Counter = mongoose.model('Counter', counter);
//console.log('is n');
function isURL(str) {
  //console.log(str);
  var pattern = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$'); // fragment locator
  return pattern.test(str);
}

app.post('/api/shorturl/new',
         function(req,res){
            var dns = require('dns');
            var w3 = dns.lookup('google.com', function (err, addresses, family) {
                console.log(addresses);
              });
            Counter.findOne({name:'urlCounter'},function (err, data) {
                  console.log('findOne runs...');
                  
                  if(!data && isURL(req.body.url)) {
                    console.log('There is no urlCounter:(');
                    var urlCounter = new Counter({name:'urlCounter',num:0});
                    
                    urlCounter.save(function (err, urlCounter) {
                    console.log('ffffffffffffffff');
                    if (err) return console.error(err);
                    console.log(urlCounter.name+' saved sucessfully.');
                    });
                    
                    var newUrl = new Url({name:req.body.url, shortUrl : 0});
                    Url.findOne({name:newUrl.name},function(err,urlData){
                      if(!urlData ){
                        newUrl.save(function (err, newUrl) {
                          if (err) return console.error(err);
                          console.log(newUrl.name+' saved sucessfully.');
                        });         
                      }
                    })
                    res.json({original_url:req.body.url, short_url:0})
                  }else if(isURL(req.body.url)){
                      console.log('We have already urlCounter:)');
                      console.log(data.num);
                      
                      Url.findOne({name:req.body.url},function(err,urlData){
                        if(!urlData){
                          data.num = data.num+1;
                          data.save(function (err) {    
                            if (err) return console.error(err);
                          })
                          var newUrl = new Url({name:req.body.url, shortUrl : data.num});
                          newUrl.save(function (err, newUrl) {
                            if (err) return console.error(err);
                            console.log(newUrl.name+' saved sucessfully.');
                            res.json({original_url:req.body.url, short_url:newUrl.shortUrl});
                        });         
                      } else{res.json({original_url:req.body.url, short_url:urlData.shortUrl})}
                    })
                    } else{res.json({original_url:'NOTHING', short_url:"NOTHING"})}
            })
          })

app.get('/api/shorturl/:shortNum',function(req,res){
    Url.findOne({shortUrl:req.params.shortNum},function(err,urlData){
      console.log('vdfsdf');
      if(urlData){
        console.log(urlData.name);
        //res.sendFile(urlData.name)
        //res.redirect(String(urlData.name))
        res.send('sddsds<script>window.location.href = "'+urlData.name+'"</script>')
      }else{
        console.log('elseelseelse');
        res.json({original_url:'NOTHING', short_url:"NOTHING"})
      }
    })
    //res.json({echo: req.params.shortNum})
  });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(port, function () {
  console.log('Node.js listening ...');
});