/*
Package farmhash64 implements the FarmHash64 and FarmHash32 hash functions for strings.

FarmHash is a family of hash functions.

FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.

The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.

All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
This is Nicola Asuni's (Tecnick.com) GO rewrite of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
*/
package farmhash64

import (
	"encoding/binary"
	"math/bits"
)

// BASICS

// Some primes between 2^63 and 2^64 for various uses.
const (
	k0 uint64 = 0xc3a5c85c97cb3127
	k1 uint64 = 0xb492b66fbe98f273
	k2 uint64 = 0x9ae16a3b2f90404f
)

// Magic numbers for 32-bit hashing.  Copied from Murmur3.
const (
	c1 uint32 = 0xcc9e2d51
	c2 uint32 = 0x1b873593
)

type uint128 struct {
	hi uint64
	lo uint64
}

// PLATFORM

// Rotate a 32-bit integer right by the given number of bits.
func rotate32(val uint32, shift uint) uint32 {
	return bits.RotateLeft32(val, -int(shift))
}

// Rotate a 64-bit integer right by the given number of bits.
func rotate64(val uint64, shift uint) uint64 {
	return bits.RotateLeft64(val, -int(shift))
}

// Fetch a 32-bit little-endian integer from a byte array.
func fetch32(s []byte, idx int) uint64 {
	return uint64(binary.LittleEndian.Uint32(s[idx : idx+4]))
}

// Fetch a 64-bit little-endian integer from a byte array.
func fetch64(s []byte, idx int) uint64 {
	return binary.LittleEndian.Uint64(s[idx : idx+8])
}

// FARMHASH NA

// XOR a 64-bit value with itself shifted right by 47 bits.
func shiftMix(val uint64) uint64 {
	return val ^ (val >> 47)
}

// Combine a 32-bit value into a running hash using the MurmurHash3 mixing step.
func mur(a, h uint32) uint32 {
	a *= c1
	a = rotate32(a, 17)
	a *= c2
	h ^= a
	h = rotate32(h, 19)

	return h*5 + 0xe6546b64
}

// Reduce a 64-bit integer to 32 bits using the MurmurHash3 mixing step.
func mix64To32(x uint64) uint32 {
	return mur(uint32(x>>32), uint32(x))
}

// Return a 64-bit hash for 16 bytes given as two 64-bit words, multiplied by a constant.
func hashLen16Mul(u, v, mul uint64) uint64 {
	// Murmur-inspired hashing.
	a := (u ^ v) * mul
	a ^= (a >> 47)
	b := (v ^ a) * mul
	b ^= (b >> 47)
	b *= mul

	return b
}

// Return a 64-bit hash for 0 to 16 bytes.
func hashLen0to16(s []byte) uint64 {
	slen := uint64(len(s))

	if slen >= 8 {
		mul := k2 + slen*2
		a := fetch64(s, 0) + k2
		b := fetch64(s, int(slen-8))
		c := rotate64(b, 37)*mul + a
		d := (rotate64(a, 25) + b) * mul

		return hashLen16Mul(c, d, mul)
	}

	if slen >= 4 {
		mul := k2 + slen*2
		a := fetch32(s, 0)
		u := slen + (a << 3)
		v := fetch32(s, int(slen-4))

		return hashLen16Mul(u, v, mul)
	}

	if slen > 0 {
		a := s[0]
		b := s[slen>>1]
		c := s[slen-1]
		y := uint32(a) + (uint32(b) << 8)
		z := uint32(slen) + (uint32(c) << 2)

		return shiftMix((uint64(y)*k2)^(uint64(z)*k0)) * k2
	}

	return k2
}

// Return a 64-bit hash for 17 to 32 bytes.
func hashLen17to32(s []byte) uint64 {
	slen := len(s)
	mul := k2 + uint64(slen)*2
	a := fetch64(s, 0) * k1
	b := fetch64(s, 8)
	c := fetch64(s, slen-8) * mul
	d := fetch64(s, slen-16) * k2

	return hashLen16Mul(
		rotate64(a+b, 43)+rotate64(c, 30)+d,
		a+rotate64(b+k2, 18)+c,
		mul,
	)
}

// Return a 64-bit hash for 33 to 64 bytes.
func hashLen33to64(s []byte) uint64 {
	slen := len(s)
	mul := k2 + uint64(slen)*2
	a := fetch64(s, 0) * k2
	b := fetch64(s, 8)
	c := fetch64(s, slen-8) * mul
	d := fetch64(s, slen-16) * k2
	y := rotate64(a+b, 43) + rotate64(c, 30) + d
	z := hashLen16Mul(y, a+rotate64(b+k2, 18)+c, mul)
	e := fetch64(s, 16) * mul
	f := fetch64(s, 24)
	g := (y + fetch64(s, slen-32)) * mul
	h := (z + fetch64(s, slen-24)) * mul

	return hashLen16Mul(
		rotate64(e+f, 43)+rotate64(g, 30)+h,
		e+rotate64(f+a, 18)+g,
		mul,
	)
}

// Return a 128-bit weak hash for four 64-bit words and two seeds.
// Callers do best to use "random-looking" values for a and b.
func weakHashLen32WithSeedsWords(w, x, y, z, a, b uint64) uint128 {
	a += w
	b = rotate64(b+a+z, 21)
	c := a
	a += x
	a += y
	b += rotate64(a, 44)

	return uint128{hi: b + c, lo: a + z}
}

// Return a 128-bit weak hash for the first 32 bytes of s and two seeds.
func weakHashLen32WithSeeds(s []byte, a, b uint64) uint128 {
	return weakHashLen32WithSeedsWords(
		fetch64(s, 0),
		fetch64(s, 8),
		fetch64(s, 16),
		fetch64(s, 24),
		a,
		b,
	)
}

// FarmHash64 returns a 64-bit fingerprint hash for a byte array.
// This function is not suitable for cryptography.
func FarmHash64(s []byte) uint64 {
	slen := len(s)

	if slen <= 32 {
		if slen <= 16 {
			return hashLen0to16(s)
		}

		return hashLen17to32(s)
	}

	if slen <= 64 {
		return hashLen33to64(s)
	}

	var seed uint64 = 81

	// For strings over 64 bytes we loop.
	// Internal state consists of 56 bytes: v, w, x, y, and z.

	v := uint128{0, 0}
	w := uint128{0, 0}
	x := seed*k2 + fetch64(s, 0)
	y := seed*k1 + 113
	z := shiftMix(y*k2+113) * k2

	// Set end so that after the loop we have 1 to 64 bytes left to process.
	endIdx := ((slen - 1) >> 6) << 6
	last64Idx := endIdx + ((slen - 1) & 63) - 63
	last64 := s[last64Idx:]

	for len(s) > 64 {
		x = rotate64(x+y+v.lo+fetch64(s, 8), 37) * k1
		y = rotate64(y+v.hi+fetch64(s, 48), 42) * k1
		x ^= w.hi
		y += v.lo + fetch64(s, 40)
		z = rotate64(z+w.lo, 33) * k1
		v = weakHashLen32WithSeeds(s, v.hi*k1, x+w.lo)
		w = weakHashLen32WithSeeds(s[32:], z+w.hi, y+fetch64(s, 16))
		x, z = z, x
		s = s[64:]
	}

	mul := k1 + ((z & 0xff) << 1)
	// Make s point to the last 64 bytes of input.
	s = last64
	w.lo += (uint64(slen-1) & 63)
	v.lo += w.lo
	w.lo += v.lo
	x = rotate64(x+y+v.lo+fetch64(s, 8), 37) * mul
	y = rotate64(y+v.hi+fetch64(s, 48), 42) * mul
	x ^= w.hi * 9
	y += v.lo*9 + fetch64(s, 40)
	z = rotate64(z+w.lo, 33) * mul
	v = weakHashLen32WithSeeds(s, v.hi*mul, x+w.lo)
	w = weakHashLen32WithSeeds(s[32:], z+w.hi, y+fetch64(s, 16))
	x, z = z, x

	return hashLen16Mul(hashLen16Mul(v.lo, w.lo, mul)+shiftMix(y)*k0+z, hashLen16Mul(v.hi, w.hi, mul)+x, mul)
}

// FarmHash32 returns a 32-bit fingerprint hash for a byte array.
// NOTE: This is NOT equivalent to the original Fingerprint32 function.
// It is derived from FarmHash64.
// This function is not suitable for cryptography.
func FarmHash32(s []byte) uint32 {
	return mix64To32(FarmHash64(s))
}
