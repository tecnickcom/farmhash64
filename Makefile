# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Project owner
OWNER=tecnickcom

# Project vendor
VENDOR=${OWNER}

# Lowercase VENDOR name for Docker
LCVENDOR=$(shell echo "${VENDOR}" | tr '[:upper:]' '[:lower:]')

# CVS path (path to the parent dir containing the project)
CVSPATH=github.com/${VENDOR}

# Project name
PROJECT=farmhash64

# Project version
VERSION=$(shell cat VERSION)

# Project release number (packaging build number)
RELEASE=$(shell cat RELEASE)

# Current directory
CURRENTDIR=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Target directory
TARGETDIR=$(CURRENTDIR)target

# Docker command
ifeq ($(DOCKER),)
	DOCKER=docker
endif

# --- MAKE TARGETS ---

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make c      : Build and test the C version"
	@echo "    make cgo    : Build and test the GO C-wrapper version"
	@echo "    make go     : Build and test the GO version"
	@echo "    make python : Build and test the Python version"
	@echo "    make clean  : Remove any build artifact"
	@echo "    make dbuild : Build everything inside a Docker container"
	@echo "    make tag    : Tag the Git repository"
	@echo ""

all: clean c cgo go java javascript python

# Build and test the C version
.PHONY: c
c:
	cd c && make all

# Build and test the CGO version
.PHONY: cgo
cgo:
	cd cgo && make all

# Build and test the GO version
.PHONY: go
go:
	cd go && make all

# Build and test the Python version
.PHONY: python
python:
	cd python && make all

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf target
	cd c && make clean
	cd cgo && make clean
	cd go && make clean
	cd python && make clean
	@mkdir -p $(TARGETDIR)

# Build everything inside a Docker container
.PHONY: dbuild
dbuild: dockerdev
	@mkdir -p $(TARGETDIR)
	@rm -rf $(TARGETDIR)/*
	@echo 0 > $(TARGETDIR)/make.exit
	CVSPATH=$(CVSPATH) VENDOR=$(LCVENDOR) PROJECT=$(PROJECT) MAKETARGET='$(MAKETARGET)' $(CURRENTDIR)/dockerbuild.sh
	@exit `cat $(TARGETDIR)/make.exit`

# Build a base development Docker image
.PHONY: dockerdev
dockerdev:
	$(DOCKER) build --pull --tag ${LCVENDOR}/dev_${PROJECT} --file ./resources/docker/Dockerfile.dev ./resources/docker/

# Publish Documentation in GitHub (requires writing permissions)
.PHONY: pubdocs
pubdocs:
	rm -rf ./target/DOCS
	rm -rf ./target/gh-pages
	mkdir -p ./target/DOCS/c
	cp -r ./c/target/build/doc/html/* ./target/DOCS/c/
	# mkdir -p ./target/DOCS/cgo
	# cp -r ./cgo/target/docs/* ./target/DOCS/cgo/
	# mkdir -p ./target/DOCS/go
	# cp -r ./go/target/docs/* ./target/DOCS/go/
	# mkdir -p ./target/DOCS/python
	# cp -r ./python/target/doc/farmhash64.html ./target/DOCS/python/
	# cp ./resources/doc/index.html ./target/DOCS/
	git clone git@github.com:tecnickcom/farmhash64.git ./target/gh-pages
	cd target/gh-pages && git checkout gh-pages
	mv -f ./target/gh-pages/.git ./target/DOCS/
	rm -rf ./target/gh-pages
	cd ./target/DOCS/ && \
	git add . -A && \
	git commit -m 'Update documentation' && \
	git push origin gh-pages --force

# Tag the Git repository
.PHONY: tag
tag:
	git tag -a "v$(VERSION)" -m "Version $(VERSION)" && \
	git push origin --tags
