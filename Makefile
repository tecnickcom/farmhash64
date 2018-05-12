# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------

# List special make targets that are not associated with files
.PHONY: help c cgo go python clean

# --- MAKE TARGETS ---

# Display general help about this command
help:
	@echo ""
	@echo "FarmHash64 Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make c          : Build and test the C version"
	@echo "    make cgo        : Build and test the CGO version"
	@echo "    make go         : Build and test the GO version"
	@echo "    make python     : Build and test the Python version"
	@echo "    make clean      : Remove any build artifact"
	@echo ""

all: clean c cgo go python

# Build and test the C version
c:
	cd c && make all

# Build and test the GO version
cgo:
	cd cgo && make all

# Build and test the GO version
go:
	cd go && make all

# Build and test the Python version
python:
	cd python && make all

# Remove any build artifact
clean:
	rm -rf target
	cd c && make clean
	cd cgo && make clean
	cd go && make clean
	cd python && make clean
