# MAKEFILE
#
# @author      Nicola Asuni <info@tecnick.com>
# @link        https://github.com/tecnickcom/farmhash64
# ------------------------------------------------------------------------------


SHELL=/bin/bash
.SHELLFLAGS=-o pipefail -c

# Project name
PROJECT=farmhash64

# Project version
VERSION=$(shell cat ../VERSION)

# Project release number (packaging build number)
# RELEASE=$(shell cat ../RELEASE)

# --- MAKE TARGETS ---

# Display general help about this command
.PHONY: 
help:
	@echo ""
	@echo "$(PROJECT) Makefile."
	@echo "The following commands are available:"
	@echo ""
	@echo "    make build   : Build the library"
	@echo "    make clean   : Remove any build artifact"
	@echo "    make doc     : Generate source code documentation"
	@echo "    make format  : Format the source code"
	@echo "    make test    : Run the unit tests"
	@echo "    make tidy    : Check the code using clang-tidy"
	@echo "    make version : Set version from VERSION file"
	@echo ""

.PHONY: all
all: clean version format test tidy build doc

# Build the library
.PHONY: build
build:
	@mkdir -p target/build
	@echo -e "\n\n*** BUILD RELEASE ***\n"
	rm -rf target/build/*
	cd target/build && \
	cmake -DCMAKE_C_FLAGS=$(CMAKE_C_FLAGS) \
	-DCMAKE_TOOLCHAIN_FILE=$(CMAKE_TOOLCHAIN_FILE) \
	-DCMAKE_BUILD_TYPE=Release \
	-DCMAKE_INSTALL_PREFIX=$(CMAKE_INSTALL_PATH) \
	-DBUILD_SHARED_LIB=$(VH_BUILD_SHARED_LIB) \
	-DBUILD_DOXYGEN=$(VH_BUILD_DOXYGEN) \
	../.. | tee cmake.log ; test $${PIPESTATUS[0]} -eq 0 && \
	export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:./ && \
	make | tee make.log ; test $${PIPESTATUS[0]} -eq 0
	cd target/build && \
	export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:./ && \
	env CTEST_OUTPUT_ON_FAILURE=1 make test | tee build.log ; test $${PIPESTATUS[0]} -eq 0

# Remove any build artifact
.PHONY: clean
clean:
	rm -rf target

# Generate source code documentation
.PHONY: doc
doc:
	cd target/build && \
	make doc | tee doc.log ; test $${PIPESTATUS[0]} -eq 0

# Format the source code
.PHONY: format
format:
	astyle --style=allman --recursive --suffix=none 'src/*.h'
	astyle --style=allman --recursive --suffix=none 'test/*.c'

# Build and run the unit tests
.PHONY: test
test: testcpp
	@mkdir -p target/test/test
	@echo -e "\n\n*** BUILD TEST ***\n"
	rm -rf target/test/*
	mkdir -p target/test/coverage
	cd target/test && \
	cmake -DCMAKE_C_FLAGS=$(CMAKE_C_FLAGS) \
	-DCMAKE_TOOLCHAIN_FILE=$(CMAKE_TOOLCHAIN_FILE) \
	-DCMAKE_BUILD_TYPE=Coverage \
	-DCMAKE_INSTALL_PREFIX=$(CMAKE_INSTALL_PATH) \
	-DBUILD_SHARED_LIB=$(VH_BUILD_SHARED_LIB) \
	-DBUILD_DOXYGEN=$(VH_BUILD_DOXYGEN) \
	../.. | tee cmake.log ; test $${PIPESTATUS[0]} -eq 0 && \
	export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:./ && \
	make | tee make.log ; test $${PIPESTATUS[0]} -eq 0 && \
	lcov --zerocounters --directory . && \
	lcov --capture --initial --directory . --output-file coverage/farmhash64.cov && \
	env CTEST_OUTPUT_ON_FAILURE=1 make test | tee test.log ; test $${PIPESTATUS[0]} -eq 0 && \
	lcov --no-checksum --directory . --capture --output-file coverage/farmhash64.info && \
	lcov --remove coverage/farmhash64.info '*/test/*' '*/usr/include/x86_64-linux-gnu/bits*' --output-file coverage/farmhash64.info && \
	genhtml -o coverage -t "farmhash64 Test Coverage" coverage/farmhash64.info
ifeq ($(VH_BUILD_DOXYGEN),ON)
	cd target && \
	make doc | tee doc.log ; test $${PIPESTATUS[0]} -eq 0
endif

# Test C code compatibility with C++
.PHONY: testcpp
testcpp:
	find ./src -type f -name '*.h' -exec gcc -c -pedantic -Werror -Wall -Wextra -Wcast-align -Wundef -Wformat-security -std=c++17 -x c++ -o /dev/null {} \;

# use clang-tidy
.PHONY: tidy
tidy:
	clang-tidy -checks='*,-clang-analyzer-security.insecureAPI.DeprecatedOrUnsafeBufferHandling,-altera-unroll-loops,-altera-id-dependent-backward-branch,-bugprone-easily-swappable-parameters,-cppcoreguidelines-avoid-magic-numbers,-readability-magic-numbers,-readability-identifier-length,-llvmlibc-restrict-system-libc-headers,-llvm-header-guard,-llvm-include-order,-android-cloexec-open,-hicpp-no-assembler,-hicpp-signed-bitwise,-clang-analyzer-alpha.*' -header-filter=.* -p . src/*.h

# Remove all installed files (excluding configuration files)
.PHONY: uninstall
uninstall:
	rm -rf $(PATHINSTLIB)
	rm -rf $(PATHINSTDOC)

# Set the version from VERSION file
.PHONY: version
version:
	sed -i "s/PROJECT_NUMBER.*=.*$$/PROJECT_NUMBER = $(VERSION)/" doc/Doxyfile
