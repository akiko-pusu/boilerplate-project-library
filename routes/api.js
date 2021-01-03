/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const mongoUtil = require('../connection.js');

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      // const db = mongoUtil.getDb()
      const collection = mongoUtil.getCollection('books');
      await getBooks(collection);

      return res.json({ status: 'ok' });
    })

    .post(function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
    });

  async function getBooks(collection) {
    const pipeline = [
      {
        '$project': {
          '_id': 1,
          'title': 1,
          'commentcount': {
            '$size': '$comments'
          }
        }
      }
    ];

    // See http://bit.ly/Node_aggregate for the aggregate() docs
    const aggCursor = collection.aggregate(pipeline);

    await aggCursor.forEach(document => {
      console.log(`${document._id}: ${document.title}, count: ${document.commentcount}`);
    });
  }
};
