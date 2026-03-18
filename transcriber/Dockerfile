FROM python:3.14-slim-trixie

RUN apt update && \
    apt install -y \
        ffmpeg

RUN groupadd --gid 1000 snake && \
    useradd -s /bin/bash  --uid 1000 --gid 1000 -m snake

ENV PATH $PATH:/home/snake/.local/bin

COPY ./entrypoint.sh /entrypoint
RUN chmod +x /entrypoint
ENTRYPOINT [ "/entrypoint" ]
