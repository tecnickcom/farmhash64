# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

# Use bash as shell (Note: Ubuntu now uses dash which doesn't support PIPESTATUS).
SHELL=/bin/bash

# CVS path (path to the parent dir containing the project)
CVSPATH=github.com/tecnickcom

# Project owner
OWNER=Tecnick.com

# Project vendor
VENDOR=tecnickcom

# Project name
PROJECT=farmhash64

# Project version
VERSION=$(shell cat ../VERSION)

# Project release number (packaging build number)
RELEASE=$(shell cat ../RELEASE)

# Name of RPM or DEB package
PKGNAME=${VENDOR}-${PROJECT}

# Current directory
CURRENTDIR=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# GO lang path
ifneq ($(GOPATH),)
	ifeq ($(findstring $(GOPATH),$(CURRENTDIR)),)
		# the defined GOPATH is not valid
		GOPATH=
	endif
endif
ifeq ($(GOPATH),)
	# extract the GOPATH
	GOPATH=$(firstword $(subst /src/, ,$(CURRENTDIR)))
endif

# Add the GO binary dir in the PATH
export PATH := $(GOPATH)/bin:$(PATH)


# --- MAKE TARGETS ---

# Display general help about this command
.PHONY: help
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "GOPATH=$(GOPATH)"
	@echo "The following commands are available:"
	@echo ""
	@echo "    make qa          : Run all the tests and static analysis reports"
	@echo "    make test        : Run the unit tests"
	@echo ""
	@echo "    make format      : Format the source code"
	@echo "    make fmtcheck    : Check if the source code has been formatted"
	@echo "    make vet         : Check for suspicious constructs"
	@echo "    make lint        : Check for style errors"
	@echo "    make coverage    : Generate the coverage report"
	@echo "    make cyclo       : Generate the cyclomatic complexity report"
	@echo "    make ineffassign : Detect ineffectual assignments"
	@echo "    make misspell    : Detect commonly misspelled words in source files"
	@echo "    make structcheck : Find unused struct fields"
	@echo "    make varcheck    : Find unused global variables and constants"
	@echo "    make errcheck    : Check that error return values are used"
	@echo "    make staticcheck : Suggest code simplifications"
	@echo "    make astscan     : GO AST scanner"
	@echo ""
	@echo "    make docs        : Generate source code documentation"
	@echo ""
	@echo "    make deps        : Get the dependencies"
	@echo "    make clean       : Remove any build artifact"
	@echo ""

# Alias for help target
all: clean format deps qa

# Run the unit tests
.PHONY: test
test:
	@mkdir -p target/test
	@mkdir -p target/report
	GOPATH=$(GOPATH) \
	go test \
	-tags ${STATIC_TAG} \
	-covermode=atomic \
	-bench=. \
	-race \
	-cpuprofile=target/report/cpu.out \
	-memprofile=target/report/mem.out \
	-mutexprofile=target/report/mutex.out \
	-coverprofile=target/report/coverage.out \
	-v ./src | \
	tee >(PATH=$(GOPATH)/bin:$(PATH) go-junit-report > target/test/report.xml); \
	test $${PIPESTATUS[0]} -eq 0

# Format the source code
.PHONY: format
format:
	@find ./src -type f -name "*.go" -exec gofmt -s -w {} \;

# Check if the source code has been formatted
.PHONY: fmtcheck
fmtcheck:
	@mkdir -p target
	@find ./src -type f -name "*.go" -exec gofmt -s -d {} \; | tee target/format.diff
	@test ! -s target/format.diff || { echo "ERROR: the source code has not been formatted - please use 'make format' or 'gofmt'"; exit 1; }

# Check for syntax errors
.PHONY: vet
vet:
	GOPATH=$(GOPATH) \
	go vet ./src

# Check for style errors
.PHONY: lint
lint:
	GOPATH=$(GOPATH) PATH=$(GOPATH)/bin:$(PATH) golint ./src

# Generate the coverage report
.PHONY: coverage
coverage:
	@mkdir -p target/report
	GOPATH=$(GOPATH) \
	go tool cover -html=target/report/coverage.out -o target/report/coverage.html

# Report cyclomatic complexity
.PHONY: cyclo
cyclo:
	@mkdir -p target/report
	GOPATH=$(GOPATH) gocyclo -avg ./src | tee target/report/cyclo.txt ; test $${PIPESTATUS[0]} -eq 0

# Detect ineffectual assignments
.PHONY: ineffassign
ineffassign:
	@mkdir -p target/report
	GOPATH=$(GOPATH) ineffassign ./src | tee target/report/ineffassign.txt ; test $${PIPESTATUS[0]} -eq 0

# Detect commonly misspelled words in source files
.PHONY: misspell
misspell:
	@mkdir -p target/report
	GOPATH=$(GOPATH) misspell -error ./src | tee target/report/misspell.txt ; test $${PIPESTATUS[0]} -eq 0

# Find unused struct fields.
.PHONY: structcheck
structcheck:
	@mkdir -p target/report
	GOPATH=$(GOPATH) structcheck -a ./src | tee target/report/structcheck.txt

# Find unused global variables and constants.
.PHONY: varcheck
varcheck:
	@mkdir -p target/report
	GOPATH=$(GOPATH) varcheck -e ./src | tee target/report/varcheck.txt

# Check that error return values are used.
.PHONY: errcheck
errcheck:
	@mkdir -p target/report
	GOPATH=$(GOPATH) errcheck ./src | tee target/report/errcheck.txt

# Suggest code simplifications"
.PHONY: staticcheck
staticcheck:
	@mkdir -p target/report
	GOPATH=$(GOPATH) staticcheck ./src | tee target/report/staticcheck.txt

# AST scanner
.PHONY: astscan
astscan:
	@mkdir -p target/report
	GOPATH=$(GOPATH) gosec ./src/... | tee target/report/astscan.txt ; test $${PIPESTATUS[0]} -eq 0 || true

# Generate source docs
.PHONY: docs
docs:
	@mkdir -p target/docs
	nohup sh -c 'GOPATH=$(GOPATH) godoc -http=127.0.0.1:6060' > target/godoc_server.log 2>&1 &
	wget --directory-prefix=target/docs/ --execute robots=off --retry-connrefused --recursive --no-parent --adjust-extension --page-requisites --convert-links http://127.0.0.1:6060/pkg/github.com/${VENDOR}/${PROJECT}/ ; kill -9 `lsof -ti :6060`
	@echo '<html><head><meta http-equiv="refresh" content="0;./127.0.0.1:6060/pkg/'${CVSPATH}'/'${PROJECT}'/index.html"/></head><a href="./127.0.0.1:6060/pkg/'${CVSPATH}'/'${PROJECT}'/index.html">'${PKGNAME}' Documentation ...</a></html>' > target/docs/index.html

# Alias to run targets: fmtcheck test vet lint coverage
.PHONY: qa
qa: fmtcheck test vet lint coverage cyclo ineffassign misspell structcheck varcheck errcheck staticcheck astscan

# --- INSTALL ---

# Get the dependencies
.PHONY: deps
deps:
	GOPATH=$(GOPATH) go get -tags ${STATIC_TAG} -v ./src
	GOPATH=$(GOPATH) go get github.com/inconshreveable/mousetrap
	GOPATH=$(GOPATH) go get golang.org/x/lint/golint
	GOPATH=$(GOPATH) go get github.com/jstemmer/go-junit-report
	GOPATH=$(GOPATH) go get github.com/axw/gocov/gocov
	GOPATH=$(GOPATH) go get github.com/fzipp/gocyclo
	GOPATH=$(GOPATH) go get github.com/gordonklaus/ineffassign
	GOPATH=$(GOPATH) go get github.com/client9/misspell/cmd/misspell
	GOPATH=$(GOPATH) go get github.com/opennota/check/cmd/structcheck
	GOPATH=$(GOPATH) go get github.com/opennota/check/cmd/varcheck
	GOPATH=$(GOPATH) go get github.com/kisielk/errcheck
	GOPATH=$(GOPATH) go get honnef.co/go/tools/cmd/staticcheck
	GOPATH=$(GOPATH) go get github.com/securego/gosec/cmd/gosec/...

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf ./target
	GOPATH=$(GOPATH) go clean -i ./...
