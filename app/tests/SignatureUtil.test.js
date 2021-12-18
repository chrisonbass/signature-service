import fs from 'fs';
import { ok, equal } from 'assert';
import Signature from '../src/service/Signature.js';

describe('Signature Utility', function() {
    const signatureService = new Signature();
    const unsignedMessage = "hello world";
    let basePath = signatureService.basePath;
    let signedMessage;
    let publicKey;
    describe('#signMessage()', function() {
        it('should return signed string', async function() {
            signedMessage = await signatureService.signMessage(unsignedMessage);
            ok(signedMessage);
            equal(typeof signedMessage, "string");
        });

        it('create a public key on Signature instance', async function() {
            publicKey = await signatureService.publicKey();
            ok(publicKey);
            equal(typeof publicKey, "string");
        });
    });

    describe('#decryptSignedMessage()', function() {
        it('should return previously used unsigned message', async function() {
            const service = new Signature();
            const message = await service.decryptSignedMessage(signedMessage, publicKey);
            service.cleanup();
            equal(message, unsignedMessage); 
        });
    });

    describe('#cleanup()', function() {
        it('should remove the temp directory used to create signature', async function() {
            await signatureService.cleanup();
            equal(fs.existsSync(basePath), false); 
        });
    });

});
