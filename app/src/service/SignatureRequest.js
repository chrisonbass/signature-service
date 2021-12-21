import Signature from './Signature.js';
import { randomHash } from '../utils/hash.js';

export const FULL_DAY_SECONDS = 60 * 60 * 24;

export default class SignatureRequest {

  constructor(couchbaseCollection) {
    this.couchbaseCollection = couchbaseCollection;
  }

  async createSignature(message, ttl = FULL_DAY_SECONDS) {
    const service = new Signature();
    const key = randomHash();
    const signature = await service.signMessage(message);
    const publicKey = await service.publicKey();
    await service.cleanup();
    await this.couchbaseCollection.insert(key, {publicKey}, {
      expiry: ttl
    });
    return {
      key,
      signature
    };
  }

  async getMessageFromSignature({key, signature}) {
    const service = new Signature();
    const keyResult = await this.couchbaseCollection.get(key);  
    const publicKey = keyResult && 
          keyResult.content && 
          keyResult.content.publicKey;
    if (publicKey) {
      const message = await service
        .decryptSignedMessage(signature, publicKey);
      await service.cleanup();
      return message;
    }
  }
}