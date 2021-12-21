import fs from 'fs';
import express from 'express';
import couchbase, {DocumentExistsError} from 'couchbase';
import {fileTypeFromFile} from 'file-type';
import { randomHash } from './src/utils/hash.js';
import SignatureRequest from './src/service/SignatureRequest.js';
import Signature from './src/controllers/Signature.js';
import authenticateSignature from './src/authorize/authenticateSignature.js';

const app = express();
const port = 3000
const hostname = '0.0.0.0';

let couchbaseCollection;
let signatureController;
const serviceSetup = (async () => {
  const cluster = await couchbase.connect('couchbase://signature-couchbase-db', {
    username: 'user',
    password: 'test1234',
  });
  const bucket = cluster.bucket('main');
  couchbaseCollection = bucket.defaultCollection();
  signatureController = new Signature(couchbaseCollection);
})();

const respondWithCode = (res, code, body) => {
  res.status(code);
  res.send(body);
};

const validators = {
  bucketRequestHasPath: (req, res, next) => {
    const {params} = req;
    console.log("validating params", params);
    if (!params['0'] || !`${params['0']}`.trim()) {
      return respondWithCode(res, 400, {
        message: "Missing file path in request"
      });
    }
    next();
  },
  // Validate post request
  bodyHasMessage: (req, res, next) => {
    const {body} = req;
    if(!body || !body.message || !`${body.message}`.trim()) {
      return respondWithCode(res, 400, {
        message: "Missing `message`"
      });
    }
    req.params.message = body.message;
    return next();
  }
};

serviceSetup.then(() => {
  // Add JSON body parsing
  app.use(express.json());

  // Retrieve message
  const getMessage = signatureController.getMessage.bind(signatureController);
  app.get('/', authenticateSignature, getMessage);

  // Create message
  const createMessage = signatureController.createMessage.bind(signatureController);
  app.put('/', validators.bodyHasMessage, createMessage);

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


});


async function main() {
  const expireKey = `signature-service::test-object::will-expire-test`;
  const badKey = `signature-service::test-object::bad-key-test`;
  const badObject = {
    "name": "new-object",
    "value": "updated-object-002"
  };
  const testKey = `signature-service::test-object::${randomHash(10)}`;
  const testObject = {
    "name": "test-object",
    "value": new Date().toLocaleString()
  };
  try {
    const result = await couchbaseCollection.upsert(testKey, testObject);
    console.log("Inserted new");
    const getResultsWithExpiry = await couchbaseCollection.get(badKey,{
      withExpiry: true
    });
    console.log("Got Result w/Expiry", {...getResultsWithExpiry});
    const setExpireResults = await couchbaseCollection.insert(expireKey, {
      name: "finite-object",
      value: "will expire"
    }, {
      expiry: 10
    });
    console.log("Inserted Object that expires")
    const badResult = await couchbaseCollection.insert(badKey, badObject);
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
