'use strict';

var utils = require('../utils/writer.js');
var Signature = require('../service/SignatureService');

module.exports.v1SignatureDELETE = function v1SignatureDELETE (req, res, next, xSignature, xSignatureKey) {
  Signature.v1SignatureDELETE(xSignature, xSignatureKey)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.v1SignatureGET = function v1SignatureGET (req, res, next, xSignature, xSignatureKey) {
  Signature.v1SignatureGET(xSignature, xSignatureKey)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.v1SignaturePOST = function v1SignaturePOST (req, res, next, body) {
  Signature.v1SignaturePOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
