# FarmHash64

*Provides farmhash64, a portable C99 64-bit hash function*

[![Donate via PayPal](https://img.shields.io/badge/donate-paypal-87ceeb.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&currency_code=GBP&business=paypal@tecnick.com&item_name=donation%20for%20farmhash64%20project)
*Please consider supporting this project by making a donation via [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&currency_code=GBP&business=paypal@tecnick.com&item_name=donation%20for%20farmhash64%20project)*

![farmhash64 logo](doc/images/logo.png)

* **category:**    Libraries
* **license:**     [LICENSE](https://github.com/tecnickcom/farmhash64/blob/main/LICENSE)
* **cvs:**         https://github.com/tecnickcom/farmhash64

[![check](https://github.com/tecnickcom/farmhash64/actions/workflows/check.yaml/badge.svg)](https://github.com/tecnickcom/farmhash64/actions/workflows/check.yaml)



## Description

FarmHash is a family of hash functions.

This is a C99 translation of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash
(https://github.com/google/farmhash).

FarmHash64 provides a portable 64-bit hash function for strings (byte array).
The function mix the input bits thoroughly but is not suitable for cryptography.

All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.

For more information please consult https://github.com/google/farmhash



## Getting Started

The reference code of this application is written in C language and includes wrappers for GO and Python.

A wrapper Makefile is available to allows building the project in a Linux-compatible system with simple commands.  
All the artifacts and reports produced using this Makefile are stored in the *target* folder.  

To see all available options:
```
make help
```

use the command ```make all``` to build and test all the implementations.


### Python Usage Example

```
# copy this code in the same directory of farmhash64 library

import farmhash64 as vh

print('\nUSAGE EXAMPLE:\n')

vhash = vh.farmhash64("Lorem ipsum dolor sit amet")
print('vh.farmhash64("Lorem ipsum dolor sit amet")')
print("Variant Hash (DEC): %d" % vhash)
print("Variant Hash (HEX): %x\n" % vhash)
```
