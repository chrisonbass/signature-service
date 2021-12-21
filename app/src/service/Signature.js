import fs from 'fs';
import { fromUrlSafe, toUrlSafe } from '../utils/base64.js';

import execCommand from '../utils/execCommand.js';
import { randomHash } from '../utils/hash.js';

async function setupKeys(privateKeyPath, publicKeyPath, callback) {
    const publicKeyExists = fs.existsSync(publicKeyPath);
    if (publicKeyExists) {
        return;
    }
    // create root path
    const rootPath = privateKeyPath.substr(0, privateKeyPath.lastIndexOf("/"));
    await execCommand(`mkdir -p ${rootPath}`);
    // create private and public keys
    await execCommand(`openssl genrsa -out ${privateKeyPath} 2048`);
    await execCommand(`openssl rsa -in ${privateKeyPath} \
        -pubout \
        -out ${publicKeyPath}`);
}

export default class Signature {
    constructor(){
        this.basePath = `/tmp/${randomHash()}`;
        this.privateKeyFileName = "private.pem";
        this.publicKeyFileName = "public.pem";
    }

    publicKeyPath() {
        return `${this.basePath}/${this.publicKeyFileName}`;
    }

    privateKeyPath() {
        return `${this.basePath}/${this.privateKeyFileName}`;
    }

    async publicKey() {
        setupKeys(this.privateKeyPath(), this.publicKeyPath());
        return (await execCommand(`cat ${this.publicKeyPath()} | base64`))
            .toString('utf-8').trim();
    }
    
    async signMessage(message) {
        const cleanedMessage = JSON.stringify({message});
        const publicKeyPath = this.publicKeyPath();
        const privateKeyPath = this.privateKeyPath();
        const messagePath = `${this.basePath}/unsigned-message.txt`;
        await setupKeys(privateKeyPath, publicKeyPath);
        fs.writeFileSync(messagePath, cleanedMessage);
        const encodedMessage = (await execCommand(`openssl rsautl -sign \
            -inkey ${privateKeyPath} \
            -in ${messagePath} | \
            base64`)).toString('utf-8').trim();
        const urlSafeMessage = toUrlSafe(encodedMessage);
        return urlSafeMessage;
    }

    async decryptSignedMessage(signedMessage, publicKey) {
        const publicKeyPathTemp = this.publicKeyPath() + "_tmp";
        const publicKeyPath = this.publicKeyPath();
        const messagePath = `${this.basePath}/message.txt`;
        await execCommand(`mkdir -p ${this.basePath}`);
        const convertedSigned = fromUrlSafe(signedMessage);
        fs.writeFileSync(messagePath, convertedSigned);
        fs.writeFileSync(publicKeyPathTemp, publicKey);
        await execCommand(`cat ${publicKeyPathTemp} | base64 --decode > ${publicKeyPath}`);
        const jsonMessage = (await execCommand(`cat ${messagePath} | \
            base64 --decode | \
            openssl rsautl -inkey ${publicKeyPath} \
            -pubin`)).toString('utf-8').trim();
        const message = jsonMessage && jsonMessage.length && JSON.parse(jsonMessage);
        return message && message.message;
    }

    async cleanup() {
        if (fs.existsSync(this.basePath)) {
            return (await execCommand(`rm -rf ${this.basePath}`)).toString('utf-8').trim();
        }
        return (await Promise.resolve());
    }
}