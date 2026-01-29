FROM alpine:latest

RUN apk add --no-cache bash curl jq dos2unix

COPY setup.sh /setup.sh
RUN dos2unix /setup.sh && chmod +x /setup.sh

ENTRYPOINT ["/setup.sh"]
