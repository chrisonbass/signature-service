import fs from 'fs';
import express from 'express';
import couchbase, {DocumentExistsError} from 'couchbase';
import {fileTypeFromFile} from 'file-type';
import { randomHash } from './src/utils/hash.js';
import SignatureRequest from './src/service/SignatureRequest.js';

const app = express();
const port = 3000
const hostname = '0.0.0.0';

let couchbaseCollection;
let signatureRequest;
(async () => {
  const cluster = await couchbase.connect('couchbase://signature-couchbase-db', {
    username: 'user',
    password: 'test1234',
  });
  const bucket = cluster.bucket('main');
  couchbaseCollection = bucket.defaultCollection();
  signatureRequest = new SignatureRequest(couchbaseCollection);
})();

const previouslySignedMessage = {
  key: 'fe03dfa574c9874029cb940bf20d709ca902b10a',
  signature: 'rFCP8/JCqc1Mo6f62RkQ1VXxa4LWyuivgjax074+iQulyf06H1MsJpTEEilUMfyD7AhsPlfkakHx\n' +
    '0g90KAId+J7j6WkCY3M4E30+/3cEkmlWaJdTG+0cpPJgmuV2cVNIv5CD7PFssKaP7Y6NBgt8HQDM\n' +
    'ljsAktg+4oklcMcamX3mGbYhs/xiDoMo+uCZ2lyQnyJrmZ/DDJr4EiLYWSTGU3aTlJ+fMiLN1pdU\n' +
    '4CxtSCUpe18GGEIFAQTsSY/zRYTJLXbL9/lKXHDmf0DtVkgVFvbvy5fBBuZROuGGP5CKF7+mxuGF\n' +
    'oU5zUg0kKeZWTP7vPjOoK/pFvfAzx5FRRiVm1A=='
};

async function main() {
  const unsignedMessage = {
    fileTypes: ["image/png", "image/jpg"]
  };
  const signedMessage = await signatureRequest.createSignature(unsignedMessage);
  console.log("==== SIGNED MESSAGE ===== \n", signedMessage, "\n ======= END SIGNED MESSAGE ======= \n");
  const retrievedMessage = await signatureRequest.getMessageFromSignature(previouslySignedMessage);
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
    /*
    const getResults = await couchbaseCollection.get(badKey);
    console.log("Got Result", {...getResults});
    const getResultsWithExpiry = await couchbaseCollection.get(badKey,{
      withExpiry: true
    });
    console.log("Got Result w/Expiry", {...getResultsWithExpiry});
    */
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