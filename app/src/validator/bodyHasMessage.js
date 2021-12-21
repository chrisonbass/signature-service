import respondWithCode from "../utils/respondWithCode.js";

// Validate post request
const bodyHasMessage = (req, res, next) => {
    const {body} = req;
    if(!body || !body.message || !`${body.message}`.trim()) {
        return respondWithCode(res, 400, {
            message: "Missing `message`"
        });
    }
    req.params.message = body.message;
    return next();
}

export default bodyHasMessage;