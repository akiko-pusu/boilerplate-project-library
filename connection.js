require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB;

const connectOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

var _db;

module.exports = {
  connectToServer: (callback) => {
    MongoClient.connect(url, connectOption, (err, client) => {
      try {
        _db = client.db('fcc')
        console.log(`connection start: ` + _db.s.namespace)
      } catch {
        console.log('Database connection failed. Please confirm your MongoDB setting.')
      }
      return callback(err);
    })
  },

  getDb: function () {
    return _db
  },

  getCollection: function (collectionName) {
    return _db.collection(collectionName)
  }
}
