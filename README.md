# FarmHash64

*Provides farmhash64, a portable C99 64-bit hash function*

[![Master Build Status](https://secure.travis-ci.org/tecnickcom/farmhash64.png?branch=master)](https://travis-ci.org/tecnickcom/farmhash64?branch=master)
[![Master Coverage Status](https://coveralls.io/repos/tecnickcom/farmhash64/badge.svg?branch=master&service=github)](https://coveralls.io/github/tecnickcom/farmhash64?branch=master)
[![GoDoc](https://godoc.org/github.com/tecnickcom/farmhash64/go/src?status.svg)](https://godoc.org/github.com/tecnickcom/farmhash64/go/src)

* **category**    Libraries
* **license**     MIT (see LICENSE)
* **link**        https://github.com/tecnickcom/farmhash64


## Description

FarmHash is a family of hash functions.

This is a C99 translation of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash
(https://github.com/google/farmhash).

FarmHash64 provides a portable 64-bit hash function for strings (byte array).
The function mix the input bits thoroughly but is not suitable for cryptography.

All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.

For more information please consult https://github.com/google/farmhash


## Getting Started

This application is written in C language and it is C99 compatible.

This project can be built using CMake.
A wrapper Makefile is available to allows building the project in a Linux-compatible system with simple commands.  
All the artifacts and reports produced using this Makefile are stored in the *target* folder.  

To see all available options:
```
make help
```

To execute all the default test builds and generate reports in the current environment:
```
make test
```

To format the code (please use this command before submitting any pull request):
```
make format
```

To build a library:
```
make build
```
Set *VH_BUILD_SHARED_LIB* in config.mk to build a static or shared library.


## Python Module

A shared library can be built using the command:
```
make python
```


### Python Usage Example

```
# copy this code in the same directory of libpyfarmhash64 library

import libpyfarmhash64 as vh

print('\nUSAGE EXAMPLE:\n')

vhash = vh.farmhash64("Lorem ipsum dolor sit amet")
print('vh.farmhash64("Lorem ipsum dolor sit amet")')
print("Variant Hash (DEC): %d" % vhash)
print("Variant Hash (HEX): %x\n" % vhash)
```
