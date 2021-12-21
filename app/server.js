import express from 'express';
import couchbase from 'couchbase';
import Signature from './src/controllers/Signature.js';
import authenticateSignature from './src/authorize/authenticateSignature.js';
import bodyHasMessage from './src/validator/bodyHasMessage.js';

const app = express();
const port = 3000
const hostname = '0.0.0.0';

let couchbaseCollection;
let signatureController;
const serviceSetup = async () => {
  // Connect to couchbase
  const cluster = await couchbase.connect('couchbase://signature-couchbase-db', {
    username: 'user',
    password: 'test1234',
  });
  // Select main bucket
  const bucket = cluster.bucket('main');
  // Retrieve default collection for this service
  couchbaseCollection = bucket.defaultCollection();
  // Intialize signature controller
  signatureController = new Signature(couchbaseCollection);
};

const main = async () => {
  await serviceSetup();

  // Add JSON body parsing
  app.use(express.json());

  // Retrieve message
  // const getMessage = signatureController.getMessage.bind(signatureController);
  app.get('/', authenticateSignature, signatureController.getMessage);

  // Create message
  // const createMessage = signatureController.createMessage.bind(signatureController);
  app.put('/', bodyHasMessage, signatureController.createMessage);

  app.listen(port, hostname, () => {
    console.log("new");
    console.log(`Example app listening at http://${hostname}:${port}`)
  });
};

main();