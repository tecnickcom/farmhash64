package farmhash64

/*
#include "../../src/farmhash64.h"
#include "../../src/farmhash64.c"
*/
import "C"

// FarmHash64 returns a 64-bit fingerprint hash for a string.
func FarmHash64(s string) uint64 {
	return uint64(C.farmhash64(C.CString(s), C.size_t(len(s))))
}

// FarmHash32 returns a 32-bit fingerprint hash for a string.
func FarmHash32(s string) uint32 {
	return uint32(C.farmhash32(C.CString(s), C.size_t(len(s))))
}
