import respondWithCode from "../utils/respondWithCode.js";

const bucketRequestHasPath = (req, res, next) => {
    const {params} = req;
    console.log("validating params", params);
    if (!params['0'] || !`${params['0']}`.trim()) {
        return respondWithCode(res, 400, {
        message: "Missing file path in request"
        });
    }
    next();
};

export default bucketRequestHasPath;