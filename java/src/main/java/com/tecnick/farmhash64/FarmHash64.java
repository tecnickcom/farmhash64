/*
Package farmhash64 implements the FarmHash64 and FarmHash32 hash functions for strings.

FarmHash is a family of hash functions.

FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.

The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.

All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
This is a Java port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).

This code has been ported/translated by Nicola Asuni (Tecnick.com) to Java code.
*/
package com.tecnick.farmhash64;

public class FarmHash64 {

	private static final int c1 = 0xcc9e2d51;
	private static final int c2 = 0x1b873593;

	private static final long k0 = 0xc3a5c85c97cb3127L;
	private static final long k1 = 0xb492b66fbe98f273L;
	private static final long k2 = 0x9ae16a3b2f90404fL;

	private static class UInt128 {
		public long lo;
		public long hi;
	}

	private static int rotate32(int val, int shift) {
		return (val >>> shift) | (val << (32 - shift));
	}

	private static long rotate64(long val, int shift) {
		return (val >>> shift) | (val << (64 - shift));
	}

	private static long fetch32(byte[] s, int idx) {
		return (s[idx + 0] & 0xFFL)
				| ((s[idx + 1] & 0xFFL) << 8)
				| ((s[idx + 2] & 0xFFL) << 16)
				| ((s[idx + 3] & 0xFFL) << 24);
	}

	private static long fetch64(byte[] s, int idx) {
		return (s[idx + 0] & 0xFFL)
				| ((s[idx + 1] & 0xFFL) << 8)
				| ((s[idx + 2] & 0xFFL) << 16)
				| ((s[idx + 3] & 0xFFL) << 24)
				| ((s[idx + 4] & 0xFFL) << 32)
				| ((s[idx + 5] & 0xFFL) << 40)
				| ((s[idx + 6] & 0xFFL) << 48)
				| ((s[idx + 7] & 0xFFL) << 56);
	}

	private static long shiftMix(long val) {
		return val ^ (val >>> 47);
	}

	private static int mur(int a, int h) {
		// Helper from Murmur3 for combining two 32-bit values.
		a *= c1;
		a = rotate32(a, 17);
		a *= c2;
		h ^= a;
		h = rotate32(h, 19);

		return ((h * 5) + 0xe6546b64);
	}

	private static int mix64To32(long x) {
		return mur((int) (x >>> 32), (int) ((x << 32) >>> 32));
	}

	private static long hashLen16Mul(long u, long v, long mul) {
		// Murmur-inspired hashing.
		long a = (u ^ v) * mul;
		a ^= (a >>> 47);
		long b = (v ^ a) * mul;
		b ^= (b >>> 47);
		b *= mul;

		return b;
	}

	private static long hashLen0to16(byte[] s) {
		long slen = s.length;

		if (slen >= 8) {
			long mul = k2 + slen * 2;
			long a = fetch64(s, 0) + k2;
			long b = fetch64(s, (int) (slen - 8));
			long c = rotate64(b, 37) * mul + a;
			long d = (rotate64(a, 25) + b) * mul;

			return hashLen16Mul(c, d, mul);
		}

		if (slen >= 4) {
			long mul = k2 + slen * 2;
			long a = fetch32(s, 0);

			return hashLen16Mul(slen + (a << 3), fetch32(s, (int) (slen - 4)), mul);
		}

		if (slen > 0) {
			long a = s[0] & 0xFFL;
			long b = s[(int) (slen >> 1)] & 0xFFL;
			long c = s[(int) (slen - 1)] & 0xFFL;
			long y = a + (b << 8);
			long z = slen + (c << 2);

			return shiftMix(y * k2 ^ z * k0) * k2;
		}

		return k2;
	}

	private static long hashLen17to32(byte[] s) {
		int slen = s.length;
		long mul = k2 + (long) slen * 2;
		long a = fetch64(s, 0) * k1;
		long b = fetch64(s, 8);
		long c = fetch64(s, slen - 8) * mul;
		long d = fetch64(s, slen - 16) * k2;

		return hashLen16Mul(rotate64(a + b, 43) + rotate64(c, 30) + d, a + rotate64(b + k2, 18) + c, mul);
	}

	private static UInt128 weakHashLen32WithSeedsWords(long w, long x, long y, long z, long a, long b) {
		a += w;
		b = rotate64(b + a + z, 21);
		long c = a;
		a += x;
		a += y;
		b += rotate64(a, 44);

		UInt128 result = new UInt128();
		result.lo = a + z;
		result.hi = b + c;

		return result;
	}

	private static UInt128 weakHashLen32WithSeeds(byte[] s, int idx, long a, long b) {
		return weakHashLen32WithSeedsWords(
				fetch64(s, idx + 0),
				fetch64(s, idx + 8),
				fetch64(s, idx + 16),
				fetch64(s, idx + 24),
				a,
				b);
	}

	private static long hashLen33to64(byte[] s) {
		int slen = s.length;
		long mul = k2 + (long) slen * 2;
		long a = fetch64(s, 0) * k2;
		long b = fetch64(s, 8);
		long c = fetch64(s, slen - 8) * mul;
		long d = fetch64(s, slen - 16) * k2;
		long y = rotate64(a + b, 43) + rotate64(c, 30) + d;
		long z = hashLen16Mul(y, a + rotate64(b + k2, 18) + c, mul);
		long e = fetch64(s, 16) * mul;
		long f = fetch64(s, 24);
		long g = (y + fetch64(s, slen - 32)) * mul;
		long h = (z + fetch64(s, slen - 24)) * mul;

		return hashLen16Mul(
			rotate64(e + f, 43) + rotate64(g, 30) + h, e + rotate64(f + a, 18) + g, 
			mul
		);
	}

	public static long farmhash64(byte[] s) {
		int slen = s.length;

		long seed = 81;

		if (slen <= 16) {
			return hashLen0to16(s);
		}

		if (slen <= 32) {
			return hashLen17to32(s);
		}

		if (slen <= 64) {
			return hashLen33to64(s);
		}

		// For strings over 64 bytes we loop.
		// Internal state consists of 56 bytes: v, w, x, y, and z.
		UInt128 v = new UInt128();
		UInt128 w = new UInt128();
		long x = seed * k2 + fetch64(s, 0);
		long y = seed * k1 + 113;
		long z = shiftMix(y * k2 + 113) * k2;
		long tmp = 0;

		// Set end so that after the loop we have 1 to 64 bytes left to process.
		int endIdx = ((slen - 1) / 64) * 64;
		int last64Idx = endIdx + ((slen - 1) & 63) - 63;
		int idx = 0;

		while (slen > 64) {
			x = rotate64(x + y + v.lo + fetch64(s, idx + 8), 37) * k1;
			y = rotate64(y + v.hi + fetch64(s, idx + 48), 42) * k1;
			x ^= w.hi;
			y += v.lo + fetch64(s, idx + 40);
			z = rotate64(z + w.lo, 33) * k1;
			v = weakHashLen32WithSeeds(s, idx, v.hi * k1, x + w.lo);
			w = weakHashLen32WithSeeds(s, idx + 32, z + w.hi, y + fetch64(s, idx + 16));
			tmp = x;
			x = z;
			z = tmp;
			idx += 64;
			slen -= 64;
		}

		long mul = k1 + ((z & 0xFFL) << 1);

		// Make s point to the last 64 bytes of input.
		idx = last64Idx;
		w.lo += ((long) slen - 1) & 63;
		v.lo += w.lo;
		w.lo += v.lo;
		x = rotate64(x + y + v.lo + fetch64(s, idx + 8), 37) * mul;
		y = rotate64(y + v.hi + fetch64(s, idx + 48), 42) * mul;
		x ^= w.hi * 9;
		y += v.lo * 9 + fetch64(s, idx + 40);
		z = rotate64(z + w.lo, 33) * mul;
		v = weakHashLen32WithSeeds(s, idx, v.hi * mul, x + w.lo);
		w = weakHashLen32WithSeeds(s, idx + 32, z + w.hi, y + fetch64(s, idx + 16));
		tmp = x;
		x = z;
		z = tmp;

		return hashLen16Mul(
			hashLen16Mul(v.lo, w.lo, mul) + shiftMix(y) * k0 + z, 
			hashLen16Mul(v.hi, w.hi, mul) + x,
			mul
		);
	}

	public static int farmhash32(byte[] s) {
		return mix64To32(farmhash64(s));
	}

}