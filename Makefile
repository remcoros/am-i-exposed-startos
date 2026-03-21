export PATH := /snap/bin:$(PATH)

PKG_ID := $(shell yq e ".id" manifest.yaml)
PKG_VERSION := $(shell yq e ".version" manifest.yaml)
TS_FILES := $(shell find ./ -name \*.ts -not -path '*/node_modules/*')

.DELETE_ON_ERROR:

all: verify

arm:
	@rm -f docker-images/x86_64.tar
	@ARCH=aarch64 $(MAKE)

x86:
	@rm -f docker-images/aarch64.tar
	@ARCH=x86_64 $(MAKE)

verify: $(PKG_ID).s9pk
	@start-sdk verify s9pk $(PKG_ID).s9pk
	@echo " Done!"
	@echo "   Filesize: $(shell du -h $(PKG_ID).s9pk) is ready"

install: $(PKG_ID).s9pk
	start-cli package install $(PKG_ID).s9pk

clean:
	rm -rf docker-images
	rm -f $(PKG_ID).s9pk
	rm -f scripts/embassy.js

scripts/embassy.js: $(TS_FILES)
	~/.deno/bin/deno run --allow-read --allow-write --allow-env --allow-net scripts/bundle.ts

docker-images/x86_64.tar: Dockerfile docker_entrypoint.sh
ifeq ($(ARCH),aarch64)
else
	@echo "Building package for x86_64..."
	mkdir -p docker-images
	docker buildx build --platform=linux/amd64 --tag start9/$(PKG_ID)/main:$(PKG_VERSION) --build-arg ARCH=x86_64 -o type=docker,dest=docker-images/x86_64.tar .
endif

docker-images/aarch64.tar: Dockerfile docker_entrypoint.sh
ifeq ($(ARCH),x86_64)
else
	@echo "Building package for aarch64..."
	mkdir -p docker-images
	docker buildx build --platform=linux/arm64 --tag start9/$(PKG_ID)/main:$(PKG_VERSION) --build-arg ARCH=aarch64 -o type=docker,dest=docker-images/aarch64.tar .
endif

$(PKG_ID).s9pk: manifest.yaml instructions.md LICENSE icon.png scripts/embassy.js docker-images/x86_64.tar docker-images/aarch64.tar
ifeq ($(ARCH),aarch64)
	@echo "start-sdk: Preparing aarch64 package ..."
else ifeq ($(ARCH),x86_64)
	@echo "start-sdk: Preparing x86_64 package ..."
else
	@echo "start-sdk: Preparing Universal Package ..."
endif
	@start-sdk pack

.PHONY: all arm x86 verify install clean
