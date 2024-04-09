/*
This library implements the farmhash64 and farmhash32 hash functions for strings.

FarmHash is a family of hash functions.

FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.

The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.

All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
This is a Rust port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).

This code has been ported/translated by Nicola Asuni (Tecnick.com) to Rust code.
*/

// BASICS

// Some primes between 2^63 and 2^64 for various uses.
const K0: u64 = 0xc3a5c85c97cb3127;
const K1: u64 = 0xb492b66fbe98f273;
const K2: u64 = 0x9ae16a3b2f90404f;

// Magic numbers for 32-bit hashing.  Copied from Murmur3.
const C1: u32 = 0xcc9e2d51;
const C2: u32 = 0x1b873593;

struct Uint128 {
    hi: u64,
    lo: u64,
}

// PLATFORM

#[inline]
fn rotate32(val: u32, shift: u32) -> u32 {
    val.rotate_right(shift)
}

#[inline]
fn rotate64(val: u64, shift: u32) -> u64 {
    val.rotate_right(shift)
}

#[inline]
fn fetch32(s: &[u8], idx: usize) -> u64 {
    u64::from(s[idx + 0])
        | (u64::from(s[idx + 1]) << 8)
        | (u64::from(s[idx + 2]) << 16)
        | (u64::from(s[idx + 3]) << 24)
}

#[inline]
fn fetch64(s: &[u8], idx: usize) -> u64 {
    u64::from(s[idx + 0])
        | (u64::from(s[idx + 1]) << 8)
        | (u64::from(s[idx + 2]) << 16)
        | (u64::from(s[idx + 3]) << 24)
        | (u64::from(s[idx + 4]) << 32)
        | (u64::from(s[idx + 5]) << 40)
        | (u64::from(s[idx + 6]) << 48)
        | (u64::from(s[idx + 7]) << 56)
}

// FARMHASH NA

#[inline]
fn shift_mix(val: u64) -> u64 {
    val ^ (val >> 47)
}

#[inline]
fn mur(a: u32, h: u32) -> u32 {
    let mut a: u32 = u32::from(a);
    let mut h: u32 = u32::from(h);
    a = a.wrapping_mul(u32::from(C1));
    a = rotate32(a, 17);
    a = a.wrapping_mul(u32::from(C2));
    h ^= a;
    h = rotate32(h, 19);
    (h.wrapping_mul(5)).wrapping_add(0xe6546b64)
}

// Merge a 64 bit integer into 32 bit.
#[inline]
fn mix_64_to_32(x: u64) -> u32 {
    mur((x >> 32) as u32, ((x << 32) >> 32) as u32)
}

#[inline]
fn hash_len_16_mul(u: u64, v: u64, mul: u64) -> u64 {
    let a = (u ^ v).wrapping_mul(mul);
    let a = a ^ (a >> 47);
    let b = (v ^ a).wrapping_mul(mul);
    let b = b ^ (b >> 47);
    b.wrapping_mul(mul)
}

#[inline]
fn hash_len_0_to_16(s: &[u8]) -> u64 {
    let slen = s.len() as u64;

    if slen >= 8 {
        let mul = K2.wrapping_add(slen.wrapping_mul(2));
        let a = fetch64(s, 0).wrapping_add(K2);
        let b = fetch64(s, (slen - 8) as usize);
        let c = rotate64(b, 37).wrapping_mul(mul).wrapping_add(a);
        let d = (rotate64(a, 25).wrapping_add(b)).wrapping_mul(mul);

        return hash_len_16_mul(c, d, mul);
    }

    if slen >= 4 {
        let mul = K2.wrapping_add(slen.wrapping_mul(2));
        let a = fetch32(s, 0);

        return hash_len_16_mul(
            slen.wrapping_add(a << 3),
            fetch32(s, (slen - 4) as usize),
            mul,
        );
    }

    if slen > 0 {
        let a = s[0];
        let b = s[(slen >> 1) as usize];
        let c = s[(slen - 1) as usize];
        let y = u32::from(a).wrapping_add(u32::from(b) << 8);
        let z = u32::from(slen as u32).wrapping_add(u32::from(c) << 2);

        return shift_mix((u64::from(y).wrapping_mul(K2)) ^ (u64::from(z).wrapping_mul(K0)))
            .wrapping_mul(K2);
    }

    K2
}

// This probably works well for 16-byte strings as well, but it may be overkill
// in that case.
#[inline]
fn hash_len_17_to_32(s: &[u8]) -> u64 {
    let slen = s.len();
    let mul = K2.wrapping_add((slen * 2) as u64);
    let a = fetch64(s, 0).wrapping_mul(K1);
    let b = fetch64(s, 8);
    let c = fetch64(s, slen - 8).wrapping_mul(mul);
    let d = fetch64(s, slen - 16).wrapping_mul(K2);

    hash_len_16_mul(
        rotate64(a.wrapping_add(b), 43)
            .wrapping_add(rotate64(c, 30))
            .wrapping_add(d),
        a.wrapping_add(rotate64(b.wrapping_add(K2), 18))
            .wrapping_add(c),
        mul,
    )
}

// Return an 8-byte hash for 33 to 64 bytes.
#[inline]
fn hash_len_33_to_64(s: &[u8]) -> u64 {
    let slen = s.len();
    let mul = K2.wrapping_add((slen as u64).wrapping_mul(2));
    let a = fetch64(s, 0).wrapping_mul(K2);
    let b = fetch64(s, 8);
    let c = fetch64(s, slen - 8).wrapping_mul(mul);
    let d = fetch64(s, slen - 16).wrapping_mul(K2);
    let y = rotate64(a.wrapping_add(b), 43)
        .wrapping_add(rotate64(c, 30))
        .wrapping_add(d);
    let z = hash_len_16_mul(
        y,
        a.wrapping_add(rotate64(b.wrapping_add(K2), 18))
            .wrapping_add(c),
        mul,
    );
    let e = fetch64(s, 16).wrapping_mul(mul);
    let f = fetch64(s, 24);
    let g = (y.wrapping_add(fetch64(s, slen - 32))).wrapping_mul(mul);
    let h = (z.wrapping_add(fetch64(s, slen - 24))).wrapping_mul(mul);

    hash_len_16_mul(
        rotate64(e.wrapping_add(f), 43)
            .wrapping_add(rotate64(g, 30))
            .wrapping_add(h),
        e.wrapping_add(rotate64(f.wrapping_add(a), 18))
            .wrapping_add(g),
        mul,
    )
}

// Return a 16-byte hash for 48 bytes.  Quick and dirty.
// Callers do best to use "random-looking" values for a and b.
#[inline]
fn weak_hash_len_32_with_seeds_words(w: u64, x: u64, y: u64, z: u64, a: u64, b: u64) -> Uint128 {
    let a = a.wrapping_add(w);
    let b = rotate64(b.wrapping_add(a).wrapping_add(z), 21);
    let c = a;
    let a = a.wrapping_add(x);
    let a = a.wrapping_add(y);
    let b = b.wrapping_add(rotate64(a, 44));

    Uint128 {
        hi: b.wrapping_add(c),
        lo: a.wrapping_add(z),
    }
}

// Return a 16-byte hash for s[0] ... s[31], a, and b.  Quick and dirty.
#[inline]
fn weak_hash_len_32_with_seeds(s: &[u8], a: u64, b: u64) -> Uint128 {
    weak_hash_len_32_with_seeds_words(
        fetch64(s, 0),
        fetch64(s, 8),
        fetch64(s, 16),
        fetch64(s, 24),
        a,
        b,
    )
}

// FarmHash64 returns a 64-bit fingerprint hash for a string.
#[inline]
pub fn farmhash64(mut s: &[u8]) -> u64 {
    let slen = s.len();

    if slen <= 32 {
        if slen <= 16 {
            return hash_len_0_to_16(s);
        }

        return hash_len_17_to_32(s);
    }

    if slen <= 64 {
        return hash_len_33_to_64(s);
    }

    let seed: u64 = 81;

    // For strings over 64 bytes we loop.
    // Internal state consists of 56 bytes: v, w, x, y, and z.
    let mut v = Uint128 { hi: 0, lo: 0 };
    let mut w = Uint128 { hi: 0, lo: 0 };
    let mut x = (seed.wrapping_mul(K2)).wrapping_add(fetch64(s, 0));
    let mut y = (seed.wrapping_mul(K1)).wrapping_add(113);
    let mut z = (shift_mix((y.wrapping_mul(K2)).wrapping_add(113))).wrapping_mul(K2);

    // Set end so that after the loop we have 1 to 64 bytes left to process.
    let end_idx = ((slen - 1) >> 6) << 6;
    let last64_idx = end_idx + ((slen - 1) & 63) - 63;
    let last64 = &s[last64_idx..];

    while s.len() > 64 {
        x = (rotate64(
            x.wrapping_add(y)
                .wrapping_add(v.lo)
                .wrapping_add(fetch64(s, 8)),
            37,
        ))
        .wrapping_mul(K1);
        y = (rotate64(y.wrapping_add(v.hi).wrapping_add(fetch64(s, 48)), 42)).wrapping_mul(K1);
        x ^= w.hi;
        y = y.wrapping_add(v.lo).wrapping_add(fetch64(s, 40));
        z = (rotate64(z.wrapping_add(w.lo), 33)).wrapping_mul(K1);
        v = weak_hash_len_32_with_seeds(s, v.hi.wrapping_mul(K1), x.wrapping_add(w.lo));
        w = weak_hash_len_32_with_seeds(
            &s[32..],
            z.wrapping_add(w.hi),
            y.wrapping_add(fetch64(s, 16)),
        );
        std::mem::swap(&mut x, &mut z);
        s = &s[64..];
    }

    let mul = K1.wrapping_add((z & 0xff) << 1);
    // Make s point to the last 64 bytes of input.
    s = last64;
    w.lo = w.lo.wrapping_add((slen - 1) as u64 & 63);
    v.lo = v.lo.wrapping_add(w.lo);
    w.lo = w.lo.wrapping_add(v.lo);
    x = (rotate64(
        x.wrapping_add(y)
            .wrapping_add(v.lo)
            .wrapping_add(fetch64(s, 8)),
        37,
    ))
    .wrapping_mul(mul);
    y = (rotate64(y.wrapping_add(v.hi).wrapping_add(fetch64(s, 48)), 42)).wrapping_mul(mul);
    x ^= w.hi.wrapping_mul(9);
    y = y
        .wrapping_add(v.lo.wrapping_mul(9))
        .wrapping_add(fetch64(s, 40));
    z = (rotate64(z.wrapping_add(w.lo), 33)).wrapping_mul(mul);
    v = weak_hash_len_32_with_seeds(s, v.hi.wrapping_mul(mul), x.wrapping_add(w.lo));
    w = weak_hash_len_32_with_seeds(
        &s[32..],
        z.wrapping_add(w.hi),
        y.wrapping_add(fetch64(s, 16)),
    );
    std::mem::swap(&mut x, &mut z);

    return hash_len_16_mul(
        hash_len_16_mul(v.lo, w.lo, mul)
            .wrapping_add(shift_mix(y).wrapping_mul(K0))
            .wrapping_add(z),
        hash_len_16_mul(v.hi, w.hi, mul).wrapping_add(x),
        mul,
    );
}

// FarmHash32 returns a 32-bit fingerprint hash for a string.
// NOTE: This is NOT equivalent to the original Fingerprint32 function.
#[inline]
pub fn farmhash32(s: &[u8]) -> u32 {
    mix_64_to_32(farmhash64(s))
}
