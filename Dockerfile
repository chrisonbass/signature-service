FROM node

COPY ./app /app

RUN apt update; \
    apt upgrade -y; \
    apt install -y openssl;

RUN echo "[ ] Testing openssl build ====="; \
    echo "[ ] Generating message ==="; \
    echo "My Test Message" >> message.txt;
RUN echo "[ ] Generating private key"; \
    openssl genrsa -out private.pem 2048; \
    echo "[ ] Generating public key"; \
    openssl rsa -in private.pem -pubout -out public.pem;
RUN echo "[ ] Signing message"; \
    openssl rsautl -sign -inkey private.pem -in message.txt -out message.ssl; \
    echo "[ ] Getting output of signed message with public key"; \
    openssl rsautl -inkey public.pem -pubin -in message.ssl;