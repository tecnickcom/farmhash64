#!/usr/bin/env Rscript

# @category   Example
# @author     Nicola Asuni <info@tecnick.com>
# @link       https://github.com/tecnickcom/farmhash64

# Usage example for farmhash64 R wrapper
# https://github.com/tecnickcom/farmhash64

library(farmhash64)

h <- farmhash64("X")
print(h)
# [1] ""

