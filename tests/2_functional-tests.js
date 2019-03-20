/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.stockdata.like, false);
         assert.equal(res.stockdata.stock, 'goog');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.stockdata.like, true);
          assert.equal(res.stockdata.stock, 'goog');
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.error, "This IP has already liked this stock once!");
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'amzn', stock: 'plxs'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.stockdata[0].stock, 'amzn');
          assert.equal(res.stockdata[1].stock, 'plxs');
          assert.equal(res.stockdata[0].like, false);
          assert.equal(res.stockdata[1].like, false);
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'amzn', stock: 'plxs'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.stockdata[0].stock, 'amzn');
          assert.equal(res.stockdata[1].stock, 'plxs');
          assert.equal(res.stockdata[0].like, true);
          assert.equal(res.stockdata[1].like, true);
          done();
        });
      });
      
    });

});
