# FarmHash64

*Provides farmhash64 and farmhash32 hash functions in multiple languages*

[![Donate via PayPal](https://img.shields.io/badge/donate-paypal-87ceeb.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&currency_code=GBP&business=paypal@tecnick.com&item_name=donation%20for%20farmhash64%20project)
*Please consider supporting this project by making a donation via [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&currency_code=GBP&business=paypal@tecnick.com&item_name=donation%20for%20farmhash64%20project)*

![farmhash64 logo](doc/images/logo.png)

* **category:**    Libraries
* **license:**     [LICENSE](https://github.com/tecnickcom/farmhash64/blob/main/LICENSE)
* **cvs:**         https://github.com/tecnickcom/farmhash64

[![check](https://github.com/tecnickcom/farmhash64/actions/workflows/check.yaml/badge.svg)](https://github.com/tecnickcom/farmhash64/actions/workflows/check.yaml)



## Description

FarmHash is a family of hash functions.

FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.

The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.

All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.

This is a port of the original Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash) in multiple languages by Nicola Asuni (Tecnick.com):

- C (header-only compatible with CPP)
- CGO (C wrapper)
- GO
- Java
- Javascript
- PHP
- Python (C wrapper)
- R (C wrapper)
- Rust
- Zig

## Getting Started

The reference code of this application is written in header-only C language.

A Makefile is available to allows building the project in a Linux-compatible system with simple commands.  
All the artifacts and reports produced using this Makefile are stored in the *target* folder inside each language directory.  

To see all available options:
```
make help
```

Use the command ```make all``` to build and test all the implementations.
