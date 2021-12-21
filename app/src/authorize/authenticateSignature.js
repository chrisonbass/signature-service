
export default (req, res, next) => {
  const {query} = req;
  if ( query.key && query.signature ) {
    req.params.key = query.key;
    req.params.signature = query.signature;
  } else {
    res.status(400);
    res.send({
      message: "Missing `key` and `signature` in query"
    });
    return;
  }
  return next();
};