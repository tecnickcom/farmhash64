/*
Package farmhash64 implements the FarmHash64 hash function.

The code in this file is an extract from:
https://github.com/dgryski/go-farm/commits/master

That is a golang translation of the Google's C++ code:
https://github.com/google/farmhash

  - Copyright (c) 2014 Google, Inc.
  - Copyright (c) 2014 Damian Gryski
  - Copyright (c) 2016-2017 Nicola Asuni

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
package farmhash64

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
	lo uint64
	hi uint64
}

// PLATFORM

func rotate32(val uint32, shift uint) uint32 {
	return ((val >> shift) | (val << (32 - shift)))
}

func rotate64(val uint64, shift uint) uint64 {
	return ((val >> shift) | (val << (64 - shift)))
}

func fetch32(s []byte, idx int) uint32 {
	return uint32(s[idx+0]) | uint32(s[idx+1])<<8 | uint32(s[idx+2])<<16 | uint32(s[idx+3])<<24
}

func fetch64(s []byte, idx int) uint64 {
	return uint64(s[idx+0]) | uint64(s[idx+1])<<8 | uint64(s[idx+2])<<16 | uint64(s[idx+3])<<24 |
		uint64(s[idx+4])<<32 | uint64(s[idx+5])<<40 | uint64(s[idx+6])<<48 | uint64(s[idx+7])<<56
}

// FARMHASH NA

func shiftMix(val uint64) uint64 {
	return val ^ (val >> 47)
}

func mur(a, h uint32) uint32 {
	// Helper from Murmur3 for combining two 32-bit values.
	a *= c1
	a = rotate32(a, 17)
	a *= c2
	h ^= a
	h = rotate32(h, 19)

	return h*5 + 0xe6546b64
}

// Merge a 64 bit integer into 32 bit.
func mix64To32(x uint64) uint32 {
	return mur(uint32(x>>32), uint32((x<<32)>>32))
}

func hashLen16Mul(u, v, mul uint64) uint64 {
	// Murmur-inspired hashing.
	a := (u ^ v) * mul
	a ^= (a >> 47)
	b := (v ^ a) * mul
	b ^= (b >> 47)
	b *= mul

	return b
}

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

		return hashLen16Mul(slen+(uint64(a)<<3), uint64(fetch32(s, int(slen-4))), mul)
	}

	if slen > 0 {
		a := s[0]
		b := s[slen>>1]
		c := s[slen-1]
		y := uint32(a) + (uint32(b) << 8)
		z := uint32(slen) + (uint32(c) << 2)

		return shiftMix(uint64(y)*k2^uint64(z)*k0) * k2
	}

	return k2
}

// This probably works well for 16-byte strings as well, but it may be overkill
// in that case.
func hashLen17to32(s []byte) uint64 {
	slen := len(s)
	mul := k2 + uint64(slen*2)
	a := fetch64(s, 0) * k1
	b := fetch64(s, 8)
	c := fetch64(s, slen-8) * mul
	d := fetch64(s, slen-16) * k2

	return hashLen16Mul(rotate64(a+b, 43)+rotate64(c, 30)+d, a+rotate64(b+k2, 18)+c, mul)
}

// Return a 16-byte hash for 48 bytes.  Quick and dirty.
// Callers do best to use "random-looking" values for a and b.
func weakHashLen32WithSeedsWords(w, x, y, z, a, b uint64) (uint64, uint64) {
	a += w
	b = rotate64(b+a+z, 21)
	c := a
	a += x
	a += y
	b += rotate64(a, 44)

	return a + z, b + c
}

// Return a 16-byte hash for s[0] ... s[31], a, and b.  Quick and dirty.
func weakHashLen32WithSeeds(s []byte, a, b uint64) (uint64, uint64) {
	return weakHashLen32WithSeedsWords(fetch64(s, 0),
		fetch64(s, 8),
		fetch64(s, 16),
		fetch64(s, 24),
		a,
		b)
}

// Return an 8-byte hash for 33 to 64 bytes.
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

	return hashLen16Mul(rotate64(e+f, 43)+rotate64(g, 30)+h, e+rotate64(f+a, 18)+g, mul)
}

// FarmHash64 returns a 64-bit fingerprint hash for a string.
func FarmHash64(s []byte) uint64 {
	slen := len(s)

	var seed uint64 = 81

	if slen <= 16 {
		return hashLen0to16(s)
	}

	if slen <= 32 {
		return hashLen17to32(s)
	}

	if slen <= 64 {
		return hashLen33to64(s)
	}

	// For strings over 64 bytes we loop.
	// Internal state consists of 56 bytes: v, w, x, y, and z.
	v := uint128{0, 0}
	w := uint128{0, 0}
	x := seed*k2 + fetch64(s, 0)
	y := seed*k1 + 113
	z := shiftMix(y*k2+113) * k2
	// Set end so that after the loop we have 1 to 64 bytes left to process.
	endIdx := ((slen - 1) / 64) * 64
	last64Idx := endIdx + ((slen - 1) & 63) - 63
	last64 := s[last64Idx:]

	for len(s) > 64 {
		x = rotate64(x+y+v.lo+fetch64(s, 8), 37) * k1
		y = rotate64(y+v.hi+fetch64(s, 48), 42) * k1
		x ^= w.hi
		y += v.lo + fetch64(s, 40)
		z = rotate64(z+w.lo, 33) * k1
		v.lo, v.hi = weakHashLen32WithSeeds(s, v.hi*k1, x+w.lo)
		w.lo, w.hi = weakHashLen32WithSeeds(s[32:], z+w.hi, y+fetch64(s, 16))
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
	v.lo, v.hi = weakHashLen32WithSeeds(s, v.hi*mul, x+w.lo)
	w.lo, w.hi = weakHashLen32WithSeeds(s[32:], z+w.hi, y+fetch64(s, 16))
	x, z = z, x

	return hashLen16Mul(hashLen16Mul(v.lo, w.lo, mul)+shiftMix(y)*k0+z, hashLen16Mul(v.hi, w.hi, mul)+x, mul)
}

// FarmHash32 returns a 32-bit fingerprint hash for a string.
// NOTE: This is NOT equivalent to the original Fingerprint32 function.
func FarmHash32(s []byte) uint32 {
	return mix64To32(FarmHash64(s))
}
