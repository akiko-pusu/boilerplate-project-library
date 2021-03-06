/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const mongoUtil = require('../connection.js');
// To validate MongoDB's document id.
const ObjectId = require('mongodb').ObjectID;

const {
  body
} = require('express-validator');

// for Bulk escape posted data
const validateBody = [
  body('*').trim().escape()
];

module.exports = function (app) {

  app.route('/api/books')
    .get(async (_req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const collection = mongoUtil.getCollection('books');
      const result = await getBooks(collection);

      return res.json(result);
    })

    .post(validateBody, async (req, res) => {
      // validationが必要
      // MongoDBの処理を待つので async functionにする
      //
      let title = req.body.title;

      if (!title || title.length === 0) {
        // 本来は400が妥当だけれどfcc側のテストでは200を期待しているのでコメントアウト
        // res.status(400)
        return res.send(`missing required field title`)
      }
      //response will contain new book object including atleast _id and title
      const collection = mongoUtil.getCollection('books');
      const result = await registerBook(collection, title);

      return res.json(result);
    })

    .delete(async (_req, res) => {
      const collection = mongoUtil.getCollection('books');
      const result = await deleteBooks(collection);

      if (result === undefined || !result.result.ok) {
        return res.send('delete failed.');
      }

      console.log(`Removed: ${result.deletedCount} documents`);
      return res.send('complete delete successful');
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      const bookid = req.params.id;

      // _id must be a single String of 12 bytes or a string of 24 hex characters
      if (bookid === undefined || bookid.length === 0 || !ObjectId.isValid(bookid)) {
        res.status(400)
        return res.send('_id error')
      }

      const collection = mongoUtil.getCollection('books');
      const result = await getBook(collection, bookid);

      if (!result || !result._id) {
        return res.send('no book exists')
      }
      return res.json(result);
    })

    .post(validateBody, async (req, res) => {
      const comment = req.body.comment;
      const bookid = req.params.id;

      // _id must be a single String of 12 bytes or a string of 24 hex characters
      if (bookid === undefined || bookid.length === 0 || !ObjectId.isValid(bookid)) {
        res.status(400)
        return res.send('_id error')
      }

      if (comment === undefined || comment.length === 0) {
        return res.send('missing required field comment');
      }

      const collection = mongoUtil.getCollection('books');
      const result = await updateBook(collection, bookid, comment);

      if (!result || !result._id) {
        return res.send('no book exists')
      }
      return res.json(result);
    })

    .delete(async (req, res) => {
      const bookid = req.params.id;

      // _id must be a single String of 12 bytes or a string of 24 hex characters
      if (bookid === undefined || bookid.length === 0 || !ObjectId.isValid(bookid)) {
        res.status(400)
        return res.send('_id error')
      }

      const collection = mongoUtil.getCollection('books');
      const result = await deleteBooks(collection, bookid);

      if (result == undefined || result.deletedCount == 0) {
        return res.send('no book exists')
      }
      return res.send('delete successful');
    });

  // booksを取得する
  async function getBooks(collection) {
    // アグリゲーションに渡すパイプラインを指定
    // $projectは抽出するフィールドの指定。1が抽出対象で、本来はcommentsフィールドがあるが、一覧では
    // コメントの件数を表示させるため、commentcountという集計用フィールドを定義し$sizeで配列の件数をセット
    // 新規登録時点ではコメントが0（commentsフィールドが無い）の場合があるのでifNullを利用
    const pipeline = [{
      '$project': {
        '_id': 1,
        'title': 1,
        'commentcount': {
          '$size': {
            '$ifNull': [
              '$comments', []
            ]
          }
        }
      }
    }];

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
    // findAndModifyWriteOpResult (Object) をresultとして返してくれる
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
    throw 'Failed to insertOne.';
  }

  // Find one document.
  // Ref. https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#findOne
  async function getBook(collection, bookid) {
    // Return resultCallback(error, result)
    // Ref.https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#~resultCallback
    return await collection.findOne({
      _id: ObjectId(bookid)
    })
  }

  async function updateBook(collection, bookid, comment) {
    // findOneAndUpdate() を利用
    // https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOneAndUpdate
    // findAndModifyWriteOpResult (オブジェクト)をコールバックで返す
    const callbackResult = await collection.findOneAndUpdate({
      _id: ObjectId(bookid)
    }, {
      $push: {
        comments: comment
      }
    }, {
      returnOriginal: false
    });
    if (callbackResult.ok === 1) {
      return callbackResult.value;
    }
    throw 'Failed to findOneAndUpdate.';
  }

  // Delete one or all
  // Ref. https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteMany
  async function deleteBooks(collection, bookid) {
    let filter = {};
    if (bookid) {
      filter._id = ObjectId(bookid);
    }
    // Return deleteWriteOpCallback(error, result) / deleteWriteOpResult
    // Ref.https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~deleteWriteOpCallback
    return await collection.deleteMany(filter);
  }
};
