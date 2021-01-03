/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test('#example Test GET /api/books', (done) => {
    chai.request(server)
      .get('/api/books')
      .end((_err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  }).timeout(4000);
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite('Routing tests', () => {

    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', (done) => {
        const currentTimeStamp = Date.now();
        chai.request(server)
          .post('/api/books')
          .send({
            title: `SampleTitle - ${currentTimeStamp}`
          })
          .end((_err, res) => {
            assert.equal(res.status, 200)
            done()
          })
      }).timeout(4000);

      test('Test POST /api/books with no title given', (done) => {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end((_err, res) => {
            assert.equal(res.status, 400)
            assert.equal(res.text, 'missing required field title')
            done()
          })
      }).timeout(4000);
    });

    suite('GET /api/books => array of books', () => {
      test('Test GET /api/books', (done) => {
        chai.request(server)
          .get('/api/books')
          .end((_err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');

            // get LastObject
            lastObject = res.body.pop()
            done()
          });
      });
    }).timeout(4000);

    /*
    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        //done();
      });

      test('Test GET /api/books/[id] with valid id in db',  function(done){
        //done();
      });
    });
    */

    /*
    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      test('Test POST /api/books/[id] with comment', function(done){
        //done();
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        //done();
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        //done();
      });
    });
    */

    /*
    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        //done();
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        //done();
      });
    });
    */
  });
});
