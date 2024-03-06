# FarmHash64

*Provides farmhash64, a portable C 64-bit hash function*

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
This is a Java port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).

This code has been ported/translated by Nicola Asuni (Tecnick.com) to multiple languages:

- C (header-only)
- CGO
- GO
- Java
- Python
- Rust


## Getting Started

The reference code of this application is written in C language and includes wrappers for GO and Python.

A wrapper Makefile is available to allows building the project in a Linux-compatible system with simple commands.  
All the artifacts and reports produced using this Makefile are stored in the *target* folder.  

To see all available options:
```
make help
```

use the command ```make all``` to build and test all the implementations.
