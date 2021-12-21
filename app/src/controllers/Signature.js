import SignatureRequest from "../service/SignatureRequest.js";


export default class Signature {
  constructor(couchbaseCollection) {
    this.signatureRequest = new SignatureRequest(couchbaseCollection);
    this.getMessage = this.getMessage.bind(this);
    this.createMessage = this.createMessage.bind(this);
  }

  async getMessage(req, res){
    const {params} = req;
    const {key, signature} = params;
    try {
      const message = await this.signatureRequest.getMessageFromSignature({key, signature});
      res.send({ message });
    } catch (e) {
        res.status(400);
        res.send({
          message: "Error retrieving message",
          error: e && e.getMessage || e
        });
    }
  }

  async createMessage (req, res) {
    const {params} = req;
    try {
      const signedResponse =  await this.signatureRequest.createSignature(params.message, params.ttl);
      res.send(signedResponse);
    } catch (e) {
      res.status(400);
      res.send({
        message: "Error creating signed message",
        error: e && e.getMessage && e.getMessage() || e    
      });
    }
  }
}
