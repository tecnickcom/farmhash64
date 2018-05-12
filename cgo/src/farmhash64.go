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
