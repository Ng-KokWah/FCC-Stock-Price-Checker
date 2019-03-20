/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const request = require('request');
//var moment = require('moment');
var yahooFinance = require('yahoo-finance');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const alphaAPI = process.env.alpha;

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stock = "";
      var like = req.query.like;
      
      var ipaddress = req.headers['x-forwarded-for'].split(',')[0];
      
      if(like == null || like == "") {
        like = false; 
      }
    
      stock = req.query.stock;
      if(Array.isArray(stock)) {
        stock = stock[0];
      }
    
      if(stock == null || stock == "") {
        res.json({error: "symbol is empty!"});
      }
      else {
        yahooFinance.quote({
        symbol: stock,
        modules: [ 'price' ]
        }, function (err, quotes) {
           if(err == null || err == "") {
              if(like == "true") {
               like = true;
             }
             if(like == "false") {
               like = false; 
             }
             
             if(like == true) {
               MongoClient.connect(CONNECTION_STRING, function(err, db) {
                var dbo = db.db("stockprice");
        
                dbo.collection("likes").findOne({stock: stock}, function(err, result) {
                  if(result == null || result == "") {
                    //check ipaddrmapping for entry if it exists res with error same ip detected
                    dbo.collection("ipaddrmapping").findOne({stock: stock, ip: ipaddress}, function(err, r2) {
                      if(r2 == null || r2 == "") {
                        //add new records to likes & ipaddrmapping
                        //set likes == 1
                        //add records to likes collection
                        dbo.collection("likes").insertOne({stock: stock, likes: 1}, function(err, r3) {
                          if (err) throw err;
                        });  
                        
                        
                        //add records to ipaddrmapping
                        dbo.collection("ipaddrmapping").insertOne({stock: stock, ip: ipaddress}, function(err, r4) {
                          if (err) throw err;
                        });   
                        
                        res.json({stockdata: {stock: stock, price: quotes.price.regularMarketPrice, likes: 1}});
                      }
                      else {
                         //ip already exists
                        res.json({error: "This IP has already liked this stock once!"});
                      }
                    });
                  }
                  else {
                    //check ipaddrmapping for entry if it exists res with error same ip detected
                    dbo.collection("ipaddrmapping").findOne({stock: stock, ip: ipaddress}, function(err, r2) {
                      if(r2 == null || r2 == "") {
                        
                          //add new records to likes & ipaddrmapping
                          //likes++
                          var likeNum = result.likes;
                          likeNum++;
                          
                          var addtolikesdb = {stock: stock, likes: likeNum};
                          var addtoipdb = {stock: stock, ip: ipaddress};
                        
                          //delete old records from likes collection
                          dbo.collection("likes").deleteOne({stock: stock}, function(err, obj) {
                            if (err) throw err;
                          });
                        
                          //add records to likes collection
                          dbo.collection("likes").insertOne(addtolikesdb, function(err, r3) {
                            if (err) throw err;
                          });  
                        
                        
                          //add records to ipaddrmapping
                          dbo.collection("ipaddrmapping").insertOne(addtoipdb, function(err, r4) {
                            if (err) throw err;
                          });   
                          res.json({stockdata: {stock: stock, price: quotes.price.regularMarketPrice, likes: parseInt(likeNum)}});
                      }
                      else { 
                         //ip already exists
                        res.json({error: "This IP has already liked this stock once!"});
                      }
                    });
                  }
                });
               });
             }
             else {
               MongoClient.connect(CONNECTION_STRING, function(err, db) {
                var dbo = db.db("stockprice");
        
                dbo.collection("likes").findOne({stock: stock}, function(err, result) {
                  if(result == null || result == "") {
                    res.json({stockdata: {stock: stock, price: quotes.price.regularMarketPrice, likes: 0}});
                  }
                  else {
                    res.json({stockdata: {stock: stock, price: quotes.price.regularMarketPrice, likes: parseInt(result.likes)}});
                  }
                });
               });
             }   
           }
           else {
              res.json({invalid: "invalid symbol given"}); 
           }
        });
      }
    
    });
    
};
