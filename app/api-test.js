import http from 'http';

const baseUrl = "http://localhost:3000";
const testMessage = {
  message: {
    name: "test",
    time: new Date().toLocaleString()
  }
};

let result;

async function callApi(url, options) {
    console.log("==== NEW REQUEST STARTED ====\n");
    console.log(JSON.stringify({url, options}, null, 2));
    let requestBody;
    let userRequestOptions = {};
    let requestHeaders;
    if (options && options.body) {
        const {body, ...otherOptions} = options;
        requestBody = body;
        userRequestOptions = otherOptions;
    }
    if (options && options.headers) {
        const {headers, ...otherOptions} = options;
        requestHeaders = headers;
        userRequestOptions = {
            ...userRequestOptions,
            otherOptions
        };
        if (userRequestOptions.body) {
            delete userRequestOptions.body;
        }
    }
    const requestUrl = new URL(url);
    return new Promise((resolve, reject) => {
        const path = requestUrl.search ? `${requestUrl.pathname}${requestUrl.search}` : requestUrl.pathname;
        const requestOptions = {
           host: requestUrl.hostname,
           path,
           port: requestUrl.port,
           ...userRequestOptions 
        };
        console.log("==== REQUEST OPTIONS ====\n");
        console.log(JSON.stringify(requestOptions, null, 2));
        console.log("\n==== END REQUEST OPTIONS ====\n");

        console.log("==== SENDING REQUEST ====\n");
        const request = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (line) => {
                console.log("RECEIVED DATA:\n");
                data += line;
            });
            res.on('end', () => {
                const status = res.statusCode;
                let parsedData = '';
                if (data && data.trim()) {
                    console.log("=== RESPONSE Body ===\n");
                    console.log(data);
                    console.log("\n === END RESPONSE Body ===\n");
                    try {
                        parsedData = JSON.parse(data.trim());
                    } catch (e) {
                        parsedData = data.trim();
                    }
                } 

                console.log("==== NEW REQUEST ENDED ====\n");
                if (status >= 200 && status < 400) {
                    resolve(parsedData);
                } else {
                    reject(parsedData);
                }
            });
        });
        request.on('error', (err) => {
            console.log("\n==== Request Error ====\n");
            console.error(err);
            console.log("\n==== END Request Error ====\n");
            console.log("==== NEW REQUEST ENDED ====\n");
            reject(err);
        });
        if (requestHeaders && Object.keys(requestHeaders).length) {
            Object.keys(requestHeaders).forEach((header) => {
                request.setHeader(header.toLowerCase(), requestHeaders[header]);
            });
        }
        if (requestBody) {
            const data = new TextEncoder().encode(JSON.stringify(requestBody));             
            console.log("\n==== REQUEST BODY ====\n");
            console.log(JSON.stringify(requestBody, null, 2));
            console.log("\n==== END REQUEST BODY ====\n");
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Content-Length', data.length);
            request.write(data, () => {
                console.log("Wrote Data -- Calling END");
                request.end();
            });
        } else {
            request.end();
        }
    });
}

async function main() {
    // Create Message
    console.log("Creating Message");
    try {
        result = await callApi(baseUrl, {
            method: "PUT",
            body: testMessage
        });
        console.log("Create Result", result);
        console.log("\n");
    } catch (e) {
        console.error("Error while creating message\n", e);
    }

    const {key, signature} = result;

    // Retrieve Message using Signed URl
    console.log("Retrieving message via signed url");
    const signedUrl = `${baseUrl}?key=${key}&signature=${signature}`;
    try {
        result = await callApi(signedUrl);
        console.log("Signed URL Result", result);
        console.log("\n");
    } catch (e) {
        console.error("Error while retrieving message with signed url\n", e);
    }
}

setTimeout(main, 1200);
