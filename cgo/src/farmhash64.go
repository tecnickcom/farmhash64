/*
Package farmhash64 implements the FarmHash64 and FarmHash32 hash functions for strings.

FarmHash is a family of hash functions.

FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.

The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.

All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
This is a CGO port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).

This code has been ported/translated by Nicola Asuni (Tecnick.com) to CGO code.
*/
package farmhash64

/*
#include "../../c/src/farmhash64.h"
*/
import "C"
import "unsafe"

// FarmHash64 returns a 64-bit fingerprint hash for a string.
func FarmHash64(s []byte) uint64 {
	slen := len(s)

	var p unsafe.Pointer

	if slen > 0 {
		p = unsafe.Pointer(&s[0]) /* #nosec */
	}

	return uint64(C.farmhash64((*C.char)(p), C.size_t(slen)))
}

// FarmHash32 returns a 32-bit fingerprint hash for a string.
func FarmHash32(s []byte) uint32 {
	slen := len(s)

	var p unsafe.Pointer

	if slen > 0 {
		p = unsafe.Pointer(&s[0]) /* #nosec */
	}

	return uint32(C.farmhash32((*C.char)(p), C.size_t(slen)))
}
