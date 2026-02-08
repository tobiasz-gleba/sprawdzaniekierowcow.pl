FROM mysql:8.0

RUN microdnf install -y \
    openssh \
    lftp \
    gzip \
    bash \
 && microdnf clean all

COPY backup.sh /backup.sh
RUN chmod +x /backup.sh

ENTRYPOINT ["/backup.sh"]
