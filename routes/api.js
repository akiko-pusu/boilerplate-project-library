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
      const collection = mongoUtil.getCollection('books');
      const result = await getBooks(collection);

      return res.json(result);
    })

    .post(async function (req, res) {
      // validationが必要
      // MongoDBの処理を待つので async functionにする
      //
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      const collection = mongoUtil.getCollection('books');
      const result = await registerBook(collection, title);

      return res.json(result);
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

    // See https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#aggregate
    // for the aggregate() docs.
    // aggregate() returns AggregationCursor.
    // See https://mongodb.github.io/node-mongodb-native/3.3/api/AggregationCursor.html
    // 全て取り出すにはforEachを使う (AggregationCursor#toArray()はバッチサイズ1つ分だけ)
    const aggCursor = collection.aggregate(pipeline);
    const result = []
    await aggCursor.forEach(document => {
      result.push(document);
    });

    // toArray()の場合は1000件程度で残りはイテレーションしないと取れない
    // let result = await aggCursor.toArray();
    return result;
  }

  // bookを登録する
  async function registerBook(collection, title) {
    // insertOne() を利用
    // https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#insertOne
    // insertOneWriteOpResult (オブジェクト)をコールバックで返す
    const callbackResult = await collection.insertOne({
      title: title,
      comments: []
    });
    if (callbackResult.result.ok === 1) {
      return {
        _id: callbackResult.insertedId,
        title: title
      };
    }
    throw 'Failed to nsertOne.';
  }
};
