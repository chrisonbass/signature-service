import fs from 'fs';
import express from 'express';
import couchbase, {DocumentExistsError} from 'couchbase';
import {fileTypeFromFile} from 'file-type';
import { randomHash } from './src/utils/hash.js';

const app = express();
const port = 3000
const hostname = '0.0.0.0';

let cluster;
(async () => {
  cluster = await couchbase.connect('couchbase://signature-couchbase-db', {
    username: 'user',
    password: 'test1234',
  });
})();

async function main() {
  const bucket = cluster.bucket('main');
  const collection = bucket.defaultCollection();
  const expireKey = `signature-service::test-object::will-expire-test`;
  const badKey = `signature-service::test-object::bad-key-test`;
  const badObject = {
    "name": "new-object",
    "value": "updated-object-002"
  };
  const testKey = `signature-service::test-object::${randomHash(10)}`;
  const testObject = {
    "name": "test-object",
    "value": randomHash(10)
  };
  try {
    const result = await collection.upsert(testKey, testObject);
    console.log("Inserted new");
    /*
    const getResults = await collection.get(badKey);
    console.log("Got Result", {...getResults});
    const getResultsWithExpiry = await collection.get(badKey,{
      withExpiry: true
    });
    console.log("Got Result w/Expiry", {...getResultsWithExpiry});
    */
    const setExpireResults = await collection.insert(expireKey, {
      name: "finite-object",
      value: "will expire"
    }, {
      expiry: 10
    });
    console.log("Inserted Object that expires")
    const badResult = await collection.insert(badKey, badObject);
  } catch (e) {
    const docExists = e instanceof DocumentExistsError;
    if (!docExists) {
      console.error("Error inserting doc");
      console.error(e);
    } else {
      console.log("Couldn't insert record that exists");
    }
  }
};

const respondWithCode = (res, code, body) => {
  res.status(code);
  res.send(body);
};

const validators = {
  bucketRequestHasPath: (req, res, next) => {
    const {params} = req;
    console.log("validating params", params);
    if (!params['0'] || !`${params['0']}`.trim()) {
      respondWithCode(res, 400, {
        message: "Missing file path in request"
      });
      return;
    }
    next();
  }
};

app.get('/', async (req, res) => {
  await main();
  res.send('Hello World!');
});

app.get('/bucket/:bucket_name/*', validators.bucketRequestHasPath, async (req, res) => {
  console.log("handling bucket path get");
  const {params} = req;
  const fileMeta = {
    bucket: params.bucket_name,
    path: params['0']
  };
  if (fileMeta.path === "my/test-image-001.jpg") {
    const filePath = './test-image.jpg';
    const fileType = await fileTypeFromFile(filePath);
    const fileBinary = fs.readFileSync(filePath);
    if (fileType && fileType.mime) {
      res.setHeader("Content-Type", fileType.mime);
    }
    res.send(fileBinary);
    return;
  }
  res.send(fileMeta);
});

app.listen(port, hostname, () => {
  console.log("new");
  console.log(`Example app listening at http://${hostname}:${port}`)
});