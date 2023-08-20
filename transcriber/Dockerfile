FROM python:3.11.4-slim-bookworm

RUN apt update && \
    apt install -y \
        sudo

RUN groupadd --gid 1000 snake && \
    useradd -s /bin/bash  --uid 1000 --gid 1000 -m snake
RUN echo 'snake ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

ENV PATH $PATH:/home/snake/.local/bin

COPY ./entrypoint.sh /entrypoint
RUN chmod +x /entrypoint
ENTRYPOINT [ "/entrypoint" ]
