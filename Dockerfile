FROM gcc:13 AS builder

RUN apt-get update && apt-get install -y make git tar gzip unzip wget libpq-dev libssl-dev && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/premake/premake-core/releases/download/v5.0.0-beta2/premake-5.0.0-beta2-linux.tar.gz && tar -xzf premake-5.0.0-beta2-linux.tar.gz && mv premake5 /usr/local/bin
WORKDIR /fullstackserver
COPY . .
RUN premake5 gmake
RUN make config=release

FROM amazonlinux:2023

RUN dnf update -y && dnf install -y libstdc++ openssl-libs postgresql-libs

WORKDIR /fullstackserver
COPY --from=builder /fullstackserver/bin/Release/fullstackserver .
CMD ["./fullstackserver"]
