# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

# List special make targets that are not associated with files
.PHONY: help version build format clean

# Project name
PROJECT=farmhash64

# Project version
VERSION=$(shell cat ../VERSION)

# Project release number (packaging build number)
RELEASE=$(shell cat ../RELEASE)

# Include conda channels
include ../conda/channels.mk

# Conda environment
CONDA_ENV=../../env-${PROJECT}

# --- MAKE TARGETS ---

# Display general help about this command
help:
	@echo ""
	@echo "${PROJECT} Python Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make test    : Run the unit tests against source code"
	@echo "    make build   : Build and test a minified version of the library"
	@echo "    make format  : Format the source code"
	@echo "    make clean   : Remove any build artifact"
	@echo ""

all: clean format build

# Set the version from VERSION file
version:
	sed -i "s/version:.*$$/version: $(VERSION)/" ../conda/python/meta.yaml
	sed -i "s/number:.*$$/number: $(RELEASE)/" ../conda/python/meta.yaml
	sed -i "s/version=.*,$$/version='$(VERSION)',/" setup.py

# Build a minified version of the library
build: version
	../conda/setup-conda.sh
	${CONDA_ENV}/bin/conda build --prefix-length 128 --no-anaconda-upload --no-remove-work-dir --override-channels $(ARTIFACTORY_CONDA_CHANNELS) ../conda/python

# Format the source code
format:
	astyle --style=allman --recursive --suffix=none 'farmhash64/*.h'
	astyle --style=allman --recursive --suffix=none 'farmhash64/*.c'
	autopep8 --in-place --max-line-length=255 test/*.py

# Remove any build artifact
clean:
	rm -rf htmlcov build dist .cache .benchmarks tests/*.so tests/__pycache__ farmhash64/__pycache__ farmhash64.egg-info
	find . -type f -name '*.pyc' -exec rm -f {} \;