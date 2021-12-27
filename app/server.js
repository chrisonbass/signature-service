import express from 'express';
import Signature from './src/controllers/Signature.js';
import authenticateSignature from './src/authorize/authenticateSignature.js';
import bodyHasMessage from './src/validator/bodyHasMessage.js';
import CouchbaseService from './src/service/Couchbase.js';

const app = express();
const port = process.env.INTERNAL_PORT || 3000;
const hostname = '0.0.0.0';

let couchbaseCollection;
let signatureController;

const serviceSetup = async () => {
  // Intialize couchbase collection client
  couchbaseCollection = await CouchbaseService();

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
    console.log(`Example app listening at http://${hostname}:${port}`)
  });
};

main();