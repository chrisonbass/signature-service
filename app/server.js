const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');


const tmpDir = crypto.randomBytes(20).toString('hex').substr(0, 8);
const tmpPath = `/tmp/${tmpDir}`;
let messageUnsigned;
let messageSigned;

console.log("Testings commands");

async function execCommand(cmd) {
  return new Promise((resolve, reject) => {
    console.log(cmd);
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function parseArgs(){
  const args = process.argv;
  let message;
  let isDecrypt = false;
  let flagMessage = false;
  let flagDecrypt = false;
  for(const arg of args) {
    console.log(`arg = ${arg}`);
    const parsedArg = arg.toLowerCase().trim();
    if (parsedArg === "-m" || parsedArg === "-message") {
      flagMessage = true;
    }
    else if (flagMessage === true) {
      message = arg;
    }
    else if (parsedArg === "-d" || parsedArg === "-decrypt") {
      flagDecrypt = true;
    }
    else if (flagDecrypt === true) {
      isDecrypt = true;
    }
  }
  return {message, isDecrypt};
}

async function setupTempSpace() {
  try {
    await execCommand(`mkdir ${tmpPath}`);
  } catch (e) {
    console.error("Error creating temp directory", e);
  }
}

async function createKeys() {
  try {
    await execCommand(`openssl genrsa -out ${tmpPath}/private.pem 2048`);
  } catch (e) {
    console.error("Error creating private key", e);
  }
  try {
    await execCommand(`openssl rsa -in ${tmpPath}/private.pem -pubout -out ${tmpPath}/public.pem`);
  } catch (e) {
    console.error("Error creating public key", e);
  }
}

async function createSignedMessage() {
  const prPath = `${tmpPath}/private.pem`;
  const pbPath = `${tmpPath}/public.pem`;
  const umPath = `${tmpPath}/unsigned-message.txt`;
  const smPath = `${tmpPath}/signed-message.txt`;
  fs.writeFileSync(umPath, messageUnsigned);
  await execCommand(`openssl rsautl -sign -inkey ${prPath} -in ${umPath} | base64 >> ${smPath}`);
  messageSigned = fs.readFileSync(smPath).toString('utf8');
  console.log("==== Signed Message ====");
  console.log({
    message: messageSigned.trim(),
    key: (await execCommand(`cat ${pbPath} | base64`)).trim()
  });
}

async function cleanup() {
  await execCommand(`rm -rf ${tmpPath}`);
}

async function main() {
  const args = parseArgs();
  if (args.isDecrypt) {
    messageSigned = args.message;
  } else {
    messageUnsigned = args.message;
  }
  if (!messageSigned && !messageUnsigned) {
    console.error("Missing required option -m '<message>'");
    return;
  }
  await setupTempSpace();
  await createKeys();
  if (!args.isDecrypt) {
    await createSignedMessage();
  }
  await cleanup();
}

main();