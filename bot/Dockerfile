FROM node:24.14-trixie-slim

RUN apt update && \
    apt install -y \
        build-essential \
        python3

COPY ./entrypoint.sh /entrypoint
RUN chmod +x /entrypoint
ENTRYPOINT [ "/entrypoint" ]

USER node
