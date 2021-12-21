
export default (req, res, next) => {
  const {query} = req;
  const headerKey = req.get("X-Signature-Key");
  const headerSignature = req.get("X-Signature");
  if ( query.key && query.signature ) {
    req.params.key = query.key;
    req.params.signature = query.signature;
  } 
  else if ( headerKey && headerSignature) {
    req.params.key = headerKey;
    req.params.signature = headerSignature;
  } else {
    res.status(400);
    res.send({
      message: "Missing `key` and `signature`"
    });
    return;
  }
  return next();
};