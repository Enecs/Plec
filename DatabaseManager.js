const mongoDb = require('mongodb');
module.exports = class DatabaseManager {
  constructor(config) {
    this.config = config;
    this.raw = null;
    this.db = null;
    this.isDisabled = this.config.mongo_uri == null;
  }

  async init() {
    if (this.isDisabled) return;
    if (!this.config.mongo_uri) throw Error('Missing Mongo URI');
    this.raw = await mongoDb.MongoClient.connect(this.config.mongo_uri, {}).catch(err => (console.error(err), null));
    if (!this.raw) throw Error('Mongo URI Failed');
    const urlTokens = /\w\/([^?]*)/g.exec(this.config.mongo_uri)
    if (!urlTokens) throw Error('Missing Table Name');
    this.db = this.raw.db(urlTokens && urlTokens[1]);
    return true;
  }

  insertOne(collection, ...args) {
    if (this.isDisabled) throw "[Function Disabled] Database URI was set to null.";
    return this.db.collection(collection).insertOne(...args);
  }
  updateOne(collection, ...args) {
    if (this.isDisabled) throw "[Function Disabled] Database URI was set to null.";
    return this.db.collection(collection).updateOne(...args);
  }

  find(collection, ...args) {
    if (this.isDisabled) throw "[Function Disabled] Database URI was set to null.";
    return this.db.collection(collection).find(...args)?.toArray();
  }
  findOne(collection, ...args) {
    if (this.isDisabled) throw "[Function Disabled] Database URI was set to null.";
    return this.db.collection(collection).findOne(...args);
  }

  deleteOne(collection, ...args) {
    if (this.isDisabled) throw "[Function Disabled] Database URI was set to null.";
    return this.db.collection(collection).deleteOne(...args);
  }

}