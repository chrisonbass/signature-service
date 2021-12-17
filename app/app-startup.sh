# /bin/bash
echo "[ ] Testing openssl build";
echo "[ ] Generating message";
echo "My Test Message" >> message.txt;
echo "[ ] Generating private key";
echo "[ ] openssl genrsa -out private.pem 2048";
openssl genrsa -out private.pem 2048;
echo "[ ] Generating public key";
echo "[ ] openssl rsa -in private.pem -pubout -out public.pem";
openssl rsa -in private.pem -pubout -out public.pem;
echo "[ ] Signing message";
echo "[ ] openssl rsautl -sign -inkey private.pem -in message.txt -out message.ssl";
openssl rsautl -sign -inkey private.pem -in message.txt -out message.ssl;
echo "[ ] Encoding signed message";
echo "[ ] base64 message.ssl >> encoded-message.txt";
base64 message.ssl >> encoded-message.txt;
echo "[ ] Getting output of signed message with public key";
echo "[ ] openssl rsautl -inkey public.pem -pubin -in message.ssl";
openssl rsautl -inkey public.pem -pubin -in message.ssl;
echo "[ ] Getting output of encoded signed message with public key";
echo "[ ] cat encoded-message.txt | base64 --decode | openssl rsautl -inkey public.pem -pubin";
cat encoded-message.txt | base64 --decode | openssl rsautl -inkey public.pem -pubin;

# docker run -dit --name sigs -v I:\Websites\signature-service\app:/app --rm -p 8088:8080 signature-service-test 