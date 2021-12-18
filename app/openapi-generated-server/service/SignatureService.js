'use strict';


/**
 * Deletes a signature
 *
 * xSignature String 
 * xSignatureKey String 
 * no response value expected for this operation
 **/
exports.v1SignatureDELETE = function(xSignature,xSignatureKey) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Retrieves a Signature with the unsigned message
 *
 * xSignature String 
 * xSignatureKey String 
 * returns SignatureBodyResponse
 **/
exports.v1SignatureGET = function(xSignature,xSignatureKey) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "message" : "sample unsigned message",
  "ttl" : 86400
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Create a Signature
 *
 * body SignatureRequest Signature request (optional)
 * returns SignatureCreateResponse
 **/
exports.v1SignaturePOST = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "signature-key" : "a41ef0929dbda09abd519facf2f371f0",
  "signature" : "VOsOZh/m/5+O1kLPPPaAq1py6ziXBxBgKudyamjdPcKT0cZHC3XHs0+bSpgck1NnHc/hYTqCTWY9 LhE8DGuMlmlepkrP+asqohoQM66JYVlCyEdePzdB8E9VzGYWA5cfMdKAP0Y6WQee4Km/gBhZIECT JWUucAvgUCNZLyLzHcviaFzHgCQek08z71vIz0hACsz3qHBAgEQrepX8B/K7jCT1yEwiNZ5xWa2R 23moz2vAbXW8pDOVB6xEtqv4j2mHXgdUVnIjMJeOgz6X4A7pSl/Xh59i6UkswHrgwDz9rRzmvSyk SkdlLTZdnsDH+QR+rd3sAAZC6T2zismlAU6NWw==",
  "ttl" : 86400
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

