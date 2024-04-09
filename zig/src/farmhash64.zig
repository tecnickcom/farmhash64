//! This library implements the farmhash64 and farmhash32 hash functions for strings.
//!
//! FarmHash is a family of hash functions.
//!
//! FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
//! It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.
//!
//! The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.
//!
//! All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
//! This is a Zig port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
//!
//! This code has been ported/translated by Nicola Asuni (Tecnick.com) to Zig code.

// BASICS

// Some primes between 2^63 and 2^64 for various uses.
const K0: u64 = 0xc3a5c85c97cb3127;
const K1: u64 = 0xb492b66fbe98f273;
const K2: u64 = 0x9ae16a3b2f90404f;

// Magic numbers for 32-bit hashing. Copied from Murmur3.
const C1: u32 = 0xcc9e2d51;
const C2: u32 = 0x1b873593;

const Uint128 = packed struct {
    hi: u64 = 0,
    lo: u64 = 0,
};

// PLATFORM

fn rotate32(val: u32, shift: u32) u32 {
    return (val >> @as(u5, @truncate(shift))) | (val << @as(u5, @truncate((32 - shift))));
}

fn rotate64(val: u64, shift: u32) u64 {
    return (val >> @as(u6, @truncate(shift))) | (val << @as(u6, @truncate((64 - shift))));
}

fn fetch32(s: []const u8, idx: usize) u64 {
    return @as(u64, s[idx + 0]) | (@as(u64, s[idx + 1]) << 8) | (@as(u64, s[idx + 2]) << 16) | (@as(u64, s[idx + 3]) << 24);
}

fn fetch64(s: []const u8, idx: usize) u64 {
    return @as(u64, s[idx + 0]) | (@as(u64, s[idx + 1]) << 8) | (@as(u64, s[idx + 2]) << 16) | (@as(u64, s[idx + 3]) << 24) | (@as(u64, s[idx + 4]) << 32) | (@as(u64, s[idx + 5]) << 40) | (@as(u64, s[idx + 6]) << 48) | (@as(u64, s[idx + 7]) << 56);
}

// FARMHASH NA

fn shift_mix(val: u64) u64 {
    return val ^ (val >> 47);
}

fn mur(pa: u32, ph: u32) u32 {
    var a: u32 = pa;
    var h: u32 = ph;
    a *%= C1;
    a = rotate32(a, 17);
    a *%= C2;
    h ^= a;
    h = rotate32(h, 19);
    return (h *% 5) +% 0xe6546b64;
}

// Merge a 64 bit integer into 32 bit.
fn mix_64_to_32(x: u64) u32 {
    return mur(@as(u32, @truncate(x >> 32)), @as(u32, @truncate((x << 32) >> 32)));
}

fn hash_len_16_mul(u: u64, v: u64, mul: u64) u64 {
    var a: u64 = (u ^ v) *% mul;
    a = a ^ (a >> 47);
    var b: u64 = (v ^ a) *% mul;
    b = b ^ (b >> 47);
    return b *% mul;
}

fn hash_len_0_to_16(s: []const u8) u64 {
    const slen: u64 = @as(u64, s.len);

    if (slen >= 8) {
        const mul: u64 = K2 +% (slen *% 2);
        const a: u64 = fetch64(s, 0) +% K2;
        const b: u64 = fetch64(s, @as(usize, @truncate((slen - 8))));
        const c: u64 = rotate64(b, 37) *% mul +% a;
        const d: u64 = (rotate64(a, 25) +% b) *% mul;

        return hash_len_16_mul(c, d, mul);
    }

    if (slen >= 4) {
        const mul: u64 = K2 +% (slen *% 2);
        const a: u64 = fetch32(s, 0);

        return hash_len_16_mul(
            slen +% (a << 3),
            fetch32(s, @as(usize, @truncate((slen - 4)))),
            mul,
        );
    }

    if (slen > 0) {
        const a: u8 = s[0];
        const b: u8 = s[@as(usize, @truncate(slen >> 1))];
        const c: u8 = s[@as(usize, @truncate(slen - 1))];
        const y: u32 = @as(u32, a) +% (@as(u32, b) << 8);
        const z: u32 = @as(u32, @truncate(slen)) +% (@as(u32, c) << 2);

        return shift_mix(@as(u64, y) *% K2 ^ @as(u64, z) *% K0) *% K2;
    }

    return K2;
}

fn hash_len_17_to_32(s: []const u8) u64 {
    const slen: usize = s.len;
    const mul: u64 = K2 +% @as(u64, slen * 2);
    const a: u64 = fetch64(s, 0) *% K1;
    const b: u64 = fetch64(s, 8);
    const c: u64 = fetch64(s, slen - 8) *% mul;
    const d: u64 = fetch64(s, slen - 16) *% K2;

    return hash_len_16_mul(
        rotate64(a +% b, 43) +% rotate64(c, 30) +% d,
        a +% rotate64(b +% K2, 18) +% c,
        mul,
    );
}

// Return an 8-byte hash for 33 to 64 bytes.
fn hash_len_33_to_64(s: []const u8) u64 {
    const slen: usize = s.len;
    const mul: u64 = K2 +% (@as(u64, slen) *% 2);
    const a: u64 = fetch64(s, 0) *% K2;
    const b: u64 = fetch64(s, 8);
    const c: u64 = fetch64(s, slen - 8) *% mul;
    const d: u64 = fetch64(s, slen - 16) *% K2;
    const y: u64 = rotate64(a +% b, 43) +% rotate64(c, 30) +% d;
    const z: u64 = hash_len_16_mul(
        y,
        a +% rotate64(b +% K2, 18) +% c,
        mul,
    );
    const e: u64 = fetch64(s, 16) *% mul;
    const f: u64 = fetch64(s, 24);
    const g: u64 = (y +% fetch64(s, slen - 32)) *% mul;
    const h: u64 = (z +% fetch64(s, slen - 24)) *% mul;

    return hash_len_16_mul(
        rotate64(e +% f, 43) +% rotate64(g, 30) +% h,
        e +% rotate64(f +% a, 18) +% g,
        mul,
    );
}

// Return a 16-byte hash for 48 bytes.  Quick and dirty.
// Callers do best to use "random-looking" values for a and b.
fn weak_hash_len_32_with_seeds_words(w: u64, x: u64, y: u64, z: u64, pa: u64, pb: u64) Uint128 {
    var a: u64 = pa +% w;
    var b: u64 = rotate64(pb +% a +% z, 21);
    var c: u64 = a;
    a = a +% x;
    a = a +% y;
    b = b +% rotate64(a, 44);

    return Uint128{
        .hi = b +% c,
        .lo = a +% z,
    };
}

// Return a 16-byte hash for s[0] ... s[31], a, and b.  Quick and dirty.
fn weak_hash_len_32_with_seeds(s: []const u8, idx: usize, a: u64, b: u64) Uint128 {
    return weak_hash_len_32_with_seeds_words(
        fetch64(s, idx + 0),
        fetch64(s, idx + 8),
        fetch64(s, idx + 16),
        fetch64(s, idx + 24),
        a,
        b,
    );
}

// FarmHash64 returns a 64-bit fingerprint hash for a string.
pub fn farmhash64(s: []const u8) u64 {
    var slen: usize = s.len;

    if (slen <= 32) {
        if (slen <= 16) {
            return hash_len_0_to_16(s);
        }

        return hash_len_17_to_32(s);
    }

    if (slen <= 64) {
        return hash_len_33_to_64(s);
    }

    const seed: u64 = 81;

    // For strings over 64 bytes we loop.
    // Internal state consists of 56 bytes: v, w, x, y, and z.
    var v = Uint128{ .hi = 0, .lo = 0 };
    var w = Uint128{ .hi = 0, .lo = 0 };
    var x: u64 = (seed *% K2) +% fetch64(s, 0);
    var y: u64 = (seed *% K1) +% 113;
    var z: u64 = (shift_mix((y *% K2) +% 113)) *% K2;

    // Set end so that after the loop we have 1 to 64 bytes left to process.
    const end_idx: usize = ((slen - 1) >> 6) << 6;
    const last64_idx: usize = end_idx + ((slen - 1) & 63) - 63;
    var idx: usize = 0;

    while (slen > 64) {
        x = (rotate64(x +% y +% v.lo +% fetch64(s, idx + 8), 37)) *% K1;
        y = (rotate64(y +% v.hi +% fetch64(s, idx + 48), 42)) *% K1;
        x ^= w.hi;
        y = y +% (v.lo) +% fetch64(s, idx + 40);
        z = (rotate64(z +% w.lo, 33)) *% (K1);
        v = weak_hash_len_32_with_seeds(s, idx, v.hi *% K1, x +% w.lo);
        w = weak_hash_len_32_with_seeds(
            s,
            idx + 32,
            z +% w.hi,
            y +% fetch64(s, idx + 16),
        );
        const tmp = x;
        x = z;
        z = tmp;
        idx += 64;
        slen -= 64;
    }

    const mul: u64 = K1 +% ((z & 0xff) << 1);
    // Make s point to the last 64 bytes of input.
    idx = last64_idx;
    w.lo +%= (@as(u64, slen - 1) & 63);
    v.lo +%= w.lo;
    w.lo +%= v.lo;
    x = (rotate64(x +% y +% v.lo +% fetch64(s, idx + 8), 37)) *% mul;
    y = (rotate64(y +% v.hi +% fetch64(s, idx + 48), 42)) *% mul;
    x ^= w.hi *% 9;
    y = y +% (v.lo *% 9) +% fetch64(s, idx + 40);
    z = rotate64(z +% w.lo, 33) *% mul;
    v = weak_hash_len_32_with_seeds(s, idx, v.hi *% mul, x +% w.lo);
    w = weak_hash_len_32_with_seeds(
        s,
        idx + 32,
        z +% w.hi,
        y +% (fetch64(s, idx + 16)),
    );
    const tmp = x;
    x = z;
    z = tmp;

    return hash_len_16_mul(
        hash_len_16_mul(v.lo, w.lo, mul) +% (shift_mix(y) *% K0) +% z,
        hash_len_16_mul(v.hi, w.hi, mul) +% x,
        mul,
    );
}

// FarmHash32 returns a 32-bit fingerprint hash for a string.
// NOTE: This is NOT equivalent to the original Fingerprint32 function.
pub fn farmhash32(s: []const u8) u32 {
    return mix_64_to_32(farmhash64(s));
}
