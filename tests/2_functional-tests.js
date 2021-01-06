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
  let lastObject = {};
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
  }).timeout(1000);
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
            title: `SampleTitle - ${currentTimeStamp}`,
            comments: ['1st comment']
          })
          .end((_err, res) => {
            assert.equal(res.status, 200);
            done();
          })
      }).timeout(4000);

      test('Test POST /api/books with no title given', (done) => {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          })
      }).timeout(4000);

      // Must be html entity escaped
      test('Test POST /api/books with html tag', (done) => {
        chai.request(server)
          .post('/api/books')
          .send({
            title: '<b>should escaped</b>'
          })
          .end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, '&lt;b&gt;should escaped&lt;&#x2F;b&gt;');
            done();
          })
      }).timeout(4000);
    });

    suite('GET /api/books => array of books', function () {
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
            lastObject = res.body.pop();
            done()
          });
      }).timeout(1000);
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', (done) => {
        const id = '8faf84b9d50ae9233ea21a13';
        chai.request(server)
          .get(`/api/books/${id}`)
          .end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, `no book exists`);
            done();
          });
      }).timeout(4000);

      test('Test GET /api/books/[id] with valid id in db', (done) => {
        const id = lastObject._id;
        console.log(lastObject._id);
        chai.request(server)
          .get(`/api/books/${id}`)
          .end((_err, res) => {
            assert.equal(res.status, 200)
            const document = res.body;
            console.log(document);
            assert.isObject(document, 'response should be an object');
            assert.isArray(document.comments, 'comments', 'has comments');
            assert.property(document, 'title', 'has title');
            assert.property(document, '_id', 'has _id');
            done();
          });
      }).timeout(4000);

      test('Test GET /api/books/[id] with invalid format id', (done) => {
        const id = '8faf84';
        chai.request(server)
          .get(`/api/books/${id}`)
          .end((_err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, `_id error`);
            done();
          });
      }).timeout(4000);
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment, id not in db', (done) => {
        const id = '8faf84b9d50ae9233ea21a13';
        chai.request(server)
          .post(`/api/books/${id}`)
          .send({
            comment: `New Comment for ${id}`
          })
          .end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, `no book exists`);
            done();
          });
      }).timeout(4000);

      test('Test POST /api/books/[id] with comment', (done) => {
        const id = lastObject._id;
        const beforeCommentsCount = lastObject.commentcount;
        chai.request(server)
          .post(`/api/books/${id}`)
          .send({
            comment: `New Comment for ${id}`
          })
          .end((_err, res) => {
            assert.equal(res.status, 200)
            const document = res.body;
            assert.isObject(document, 'response should be an object');
            assert.isArray(document.comments, 'comments', 'has comments');
            assert.property(document, 'title', 'has title');
            assert.property(document, '_id', 'has _id');
            assert.equal(document.comments.length, beforeCommentsCount + 1)
            done();
          });
      }).timeout(4000);

      test('Test POST /api/books/[id] without comment field', (done) => {
        const id = lastObject._id;
        chai.request(server)
          .post(`/api/books/${id}`)
          .send({})
          .end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, `missing required field comment`);
            done();
          });
      }).timeout(4000);
    });

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
