/*
Package farmhash64 implements the FarmHash64 hash functions for strings.

FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
It is designed to be fast and provide good hash distribution.

The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.

Usage:

To use the FarmHash64 function, pass a byte slice representing the string to be hashed.
The function returns a uint64 value representing the hash.

Example:

	package main

	import (
		"fmt"
		"github.com/tecnickcom/farmhash64/cgo/src/farmhash64"
	)

	func main() {
		str := "Hello, World!"
		hash := farmhash64.FarmHash64([]byte(str))
		fmt.Printf("Hash: %d\n", hash)
	}

Output:

	Hash: 1234567890

Note:
The package uses cgo to interface with the C implementation of FarmHash64.

For more information about FarmHash64, refer to the original C implementation:
https://github.com/google/farmhash
*/
package farmhash64

/*
#include "../../c/src/farmhash64.h"
#include "../../c/src/farmhash64.c"
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
