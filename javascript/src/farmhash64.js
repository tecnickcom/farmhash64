/** FarmHash64 JavaScript Library
 *
 * farmhash64.js
 *
 * This library implements the farmhash64 and farmhash32 hash functions for strings.
 *
 * FarmHash is a family of hash functions.
 *
 * FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
 * It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.
 *
 * The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.
 *
 * All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
 * This is Nicola Asuni's (Tecnick.com) JavaScript rewrite of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
 *
 * NOTE: JavaScript has no support for unsigned integers.
 *       The function strFarmhash64Hex is provided to calculate the 64-bit hash value from a string and return it as a fixed-length hexadecimal string.
 *
 * @category   Libraries
 * @license    see LICENSE file
 * @link       https://github.com/tecnickcom/farmhash64
 */

"use strict";

const k0 = {
    hi: 0xc3a5c85c,
    lo: 0x97cb3127,
};
const k1 = {
    hi: 0xb492b66f,
    lo: 0xbe98f273,
};
const k2 = {
    hi: 0x9ae16a3b,
    lo: 0x2f90404f,
};

const c1 = 0xcc9e2d51;
const c2 = 0x1b873593;

// Add two 64-bit values represented as {hi,lo} pairs of 32-bit halves.
function u64Add(a, b) {
    const losum = a.lo + b.lo;
    const cb = losum >>> 0 < a.lo >>> 0 || losum >>> 0 < b.lo >>> 0 ? 1 : 0;
    return {
        hi: (a.hi + b.hi + cb) >>> 0,
        lo: (losum) >>> 0,
    };
}

// Split a 32-bit value into its high and low 16-bit halves.
function u32Split16(a) {
    return {
        hi: (a >>> 16) & 0xffff,
        lo: (a >>> 0) & 0xffff,
    };
}

// Multiply two 32-bit values, truncated to 32 bits.
function u32Mul(a, b) {
    const x = u32Split16(a);
    const y = u32Split16(b);
    return (x.lo * y.lo + (((x.hi * y.lo + x.lo * y.hi) << 16) >>> 0)) >>> 0;
}

// Multiply two 32-bit values into a 64-bit result.
function u32Mul64(a, b) {
    const x = u32Split16(a);
    const y = u32Split16(b);
    const s = {
        hi: u32Mul(x.hi, y.hi),
        lo: u32Mul(x.lo, y.lo),
    };
    const t = u32Mul(x.hi, y.lo);
    const u = u32Mul(x.lo, y.hi);
    const v = {
        hi: t >>> 16,
        lo: (t << 16) >>> 0,
    };
    const w = {
        hi: u >>> 16,
        lo: (u << 16) >>> 0,
    };
    return u64Add(u64Add(s, v), w);
}

// Multiply two 64-bit values, truncated to 64 bits.
function u64Mul(a, b) {
    return u64Add({
            hi: (u32Mul(a.hi, b.lo) + u32Mul(a.lo, b.hi)) >>> 0,
            lo: 0,
        },
        u32Mul64(a.lo, b.lo)
    );
}

// Rotate a 32-bit value right by the given number of bits.
// Shifts of 0 or of 32 and above return the value unchanged.
function u32RotR(a, s) {
    if (s <= 0 || s >= 32) {
        return a >>> 0;
    }
    return (((a << (32 - s)) >>> 0) | (a >>> s)) >>> 0;
}

// Rotate a 64-bit value right by the given number of bits.
// Shifts of 0 or of 64 and above return the value unchanged.
function u64RotR(a, s) {
    if (s <= 0 || s >= 64) {
        return {
            hi: a.hi >>> 0,
            lo: a.lo >>> 0,
        };
    }
    if (s < 32) {
        const sl = 32 - s;
        return {
            hi: (((a.lo << sl) >>> 0) | (a.hi >>> s)) >>> 0,
            lo: (((a.hi << sl) >>> 0) | (a.lo >>> s)) >>> 0,
        };
    }
    if (s === 32) {
        return {
            hi: a.lo >>> 0,
            lo: a.hi >>> 0,
        };
    }
    const sl = 64 - s;
    const sr = s - 32;
    return {
        hi: (((a.hi << sl) >>> 0) | (a.lo >>> sr)) >>> 0,
        lo: (((a.lo << sl) >>> 0) | (a.hi >>> sr)) >>> 0,
    };
}

// Shift a 64-bit value left by the given number of bits.
// Shifts of 0 or of 64 and above return the value unchanged.
function u64ShiftL(a, s) {
    if (s <= 0 || s >= 64) {
        return {
            hi: a.hi >>> 0,
            lo: a.lo >>> 0,
        };
    }
    if (s < 32) {
        return {
            hi: ((a.lo >>> (32 - s)) | ((a.hi << s) >>> 0)) >>> 0,
            lo: (a.lo << s) >>> 0,
        };
    }
    return {
        hi: (a.lo << (s - 32)) >>> 0,
        lo: 0,
    };
}

// Shift a 64-bit value right by the given number of bits.
// Shifts of 0 or of 64 and above return the value unchanged.
function u64ShiftR(a, s) {
    if (s <= 0 || s >= 64) {
        return {
            hi: a.hi >>> 0,
            lo: a.lo >>> 0,
        };
    }
    if (s < 32) {
        return {
            hi: a.hi >>> s,
            lo: (((a.hi << (32 - s)) >>> 0) | (a.lo >>> s)) >>> 0,
        };
    }
    return {
        hi: 0,
        lo: a.hi >>> (s - 32),
    };
}

// XOR two 64-bit values.
function u64XOR(a, b) {
    return {
        hi: (a.hi ^ b.hi) >>> 0,
        lo: (a.lo ^ b.lo) >>> 0,
    };
}

// Fetch a 32-bit little-endian integer from a byte array.
function fetchU32(s, i) {
    const lo =
        (s[i + 0] >>> 0) |
        ((s[i + 1] << 8) >>> 0) |
        ((s[i + 2] << 16) >>> 0) |
        ((s[i + 3] << 24) >>> 0);
    return {
        hi: 0,
        lo: lo >>> 0,
    };
}

// Fetch a 64-bit little-endian integer from a byte array.
function fetchU64(s, i) {
    const lo =
        (s[i + 0] >>> 0) |
        ((s[i + 1] << 8) >>> 0) |
        ((s[i + 2] << 16) >>> 0) |
        ((s[i + 3] << 24) >>> 0);
    const hi =
        ((s[i + 4]) >>> 0) |
        ((s[i + 5] << 8) >>> 0) |
        ((s[i + 6] << 16) >>> 0) |
        ((s[i + 7] << 24) >>> 0);
    return {
        hi: hi >>> 0,
        lo: lo >>> 0,
    };
}

// XOR a 64-bit value with itself shifted right by 47 bits.
function shiftMix(v) {
    return u64XOR(v, u64ShiftR(v, 47));
}

// Combine a 32-bit value into a running hash using the MurmurHash3 mixing step.
function mur(a, h) {
    a = u32Mul(a, c1);
    a = u32RotR(a, 17);
    a = u32Mul(a, c2);
    h = h ^ a;
    h = u32RotR(h, 19);
    return (u32Mul(h, 5) + 0xe6546b64) >>> 0;
}

// Reduce a 64-bit value to 32 bits using the MurmurHash3 mixing step.
function mix64To32(v) {
    return mur(v.hi, v.lo);
}

// Return a 64-bit hash for 16 bytes given as two 64-bit words, multiplied by a constant.
function hashLen16Mul(u, v, mul) {
    let a = u64Mul(u64XOR(u, v), mul);
    a = u64XOR(a, u64ShiftR(a, 47));
    let b = u64Mul(u64XOR(v, a), mul);
    b = u64XOR(b, u64ShiftR(b, 47));
    b = u64Mul(b, mul);
    return b;
}

// Return a 64-bit hash for 0 to 16 bytes.
function hashLen0to16(s) {
    const slen = s.length;
    const slen64 = {
        hi: 0,
        lo: slen >>> 0,
    };

    if (slen >= 8) {
        const mul = u64Add(
            k2,
            u64Add(slen64, slen64)
        );
        const a = u64Add(fetchU64(s, 0), k2);
        const b = fetchU64(s, slen - 8);
        const br = u64RotR(b, 37);
        const dr = u64RotR(a, 25);
        const c = u64Add(u64Mul(br, mul), a);
        const d = u64Mul(u64Add(dr, b), mul);

        return hashLen16Mul(c, d, mul);
    }

    if (slen >= 4) {
        const mul = u64Add(
            k2,
            u64Add(slen64, slen64)
        );
        const a = fetchU32(s, 0);
        const u = u64Add(slen64, u64ShiftL(a, 3));
        const v = fetchU32(s, slen - 4);
        return hashLen16Mul(u, v, mul);
    }

    if (slen > 0) {
        const a = s[0] >>> 0;
        const b = s[slen >>> 1] >>> 0;
        const c = s[slen - 1] >>> 0;
        const y = (a + (b << 8)) >>> 0;
        const z = (slen + (c << 2)) >>> 0;

        return u64Mul(
            shiftMix(
                u64XOR(
                    u64Mul({
                            hi: 0,
                            lo: y,
                        },
                        k2
                    ),
                    u64Mul({
                            hi: 0,
                            lo: z,
                        },
                        k0
                    )
                )
            ),
            k2
        );
    }

    return k2;
}

// Return a 64-bit hash for 17 to 32 bytes.
function hashLen17to32(s) {
    const slen = s.length;
    const slen64 = {
        hi: 0,
        lo: slen >>> 0,
    };
    const mul = u64Add(
        k2,
        u64Add(slen64, slen64)
    );
    const a = u64Mul(fetchU64(s, 0), k1);
    const b = fetchU64(s, 8);
    const c = u64Mul(fetchU64(s, slen - 8), mul);
    const d = u64Mul(fetchU64(s, slen - 16), k2);

    return hashLen16Mul(
        u64Add(u64Add(u64RotR(u64Add(a, b), 43), u64RotR(c, 30)), d),
        u64Add(u64Add(a, u64RotR(u64Add(b, k2), 18)), c),
        mul
    );
}

// Return a 64-bit hash for 33 to 64 bytes.
function hashLen33to64(s) {
    const slen = s.length;
    const slen64 = {
        hi: 0,
        lo: slen >>> 0,
    };
    const mul = u64Add(
        k2,
        u64Add(slen64, slen64)
    );
    const a = u64Mul(fetchU64(s, 0), k2);
    const b = fetchU64(s, 8);
    const c = u64Mul(fetchU64(s, slen - 8), mul);
    const d = u64Mul(fetchU64(s, slen - 16), k2);
    const y = u64Add(u64Add(u64RotR(u64Add(a, b), 43), u64RotR(c, 30)), d);
    const z = hashLen16Mul(
        y,
        u64Add(u64Add(a, u64RotR(u64Add(b, k2), 18)), c),
        mul
    );
    const e = u64Mul(fetchU64(s, 16), mul);
    const f = fetchU64(s, 24);
    const g = u64Mul(u64Add(y, fetchU64(s, slen - 32)), mul);
    const h = u64Mul(u64Add(z, fetchU64(s, slen - 24)), mul);
    return hashLen16Mul(
        u64Add(u64Add(u64RotR(u64Add(e, f), 43), u64RotR(g, 30)), h),
        u64Add(u64Add(e, u64RotR(u64Add(f, a), 18)), g),
        mul
    );
}

// Return a 128-bit weak hash for four 64-bit words and two seeds.
// Callers do best to use "random-looking" values for a and b.
function weakHashLen32WithSeedsWords(w, x, y, z, a, b) {
    a = u64Add(a, w);
    b = u64RotR(u64Add(u64Add(b, a), z), 21);
    const c = a;
    a = u64Add(a, x);
    a = u64Add(a, y);
    b = u64Add(b, u64RotR(a, 44));
    return {
        hi: u64Add(b, c),
        lo: u64Add(a, z),
    };
}

// Return a 128-bit weak hash for the 32 bytes of s starting at idx and two seeds.
function weakHashLen32WithSeeds(s, idx, a, b) {
    return weakHashLen32WithSeedsWords(
        fetchU64(s, idx + 0),
        fetchU64(s, idx + 8),
        fetchU64(s, idx + 16),
        fetchU64(s, idx + 24),
        a,
        b
    );
}

// Generate a pseudorandom byte array of the given size, used by the unit tests.
function _testData(size) {
    const kt = {
        hi: 0xc3a5c85c,
        lo: 0x97cb3127,
    };
    const data = new Uint8Array(size);
    let a = {
        hi: 0,
        lo: 9,
    };
    let b = {
        hi: 0,
        lo: 777,
    };
    for (let i = 0; i < size; i++) {
        a = u64Add(a, b);
        b = u64Add(b, a);
        a = u64Mul(u64XOR(a, u64ShiftR(a, 41)), kt);
        b = u64Add(u64Mul(u64XOR(b, u64ShiftR(b, 41)), kt), {
            hi: 0,
            lo: i,
        });
        data[i] = (u64ShiftR(b, 37).lo & 0xff);
    }
    return data;
}

/**
 * Returns a 64-bit fingerprint hash for a byte array.
 *
 * This function is not suitable for cryptography.
 *
 * @param {Uint8Array} s - The input byte array to hash.
 * @returns {object} The 64-bit hash value as an object with properties `hi` and `lo`, representing the high and low 32 bits respectively.
 */
function farmhash64(s) {
    let slen = s.length;


    if (slen <= 32) {
        if (slen <= 16) {
            return hashLen0to16(s);
        }

        return hashLen17to32(s);
    }

    if (slen <= 64) {
        return hashLen33to64(s);
    }

    let v = {
        hi: {
            hi: 0,
            lo: 0,
        },
        lo: {
            hi: 0,
            lo: 0,
        },
    };

    let w = {
        hi: {
            hi: 0,
            lo: 0,
        },
        lo: {
            hi: 0,
            lo: 0,
        },
    };

    const seed = {
        hi: 0,
        lo: 81,
    };

    const a113 = {
        hi: 0,
        lo: 113,
    };

    let x = u64Add(u64Mul(seed, k2), fetchU64(s, 0));
    let y = u64Add(u64Mul(seed, k1), a113);
    let z = u64Mul(shiftMix(u64Add(u64Mul(y, k2), a113)), k2);

    const endIdx = ((slen - 1) >>> 6) << 6;
    const last64Idx = endIdx + (((slen - 1) >>> 0) & 63) - 63;

    let idx = 0;

    while (slen > 64) {
        x = u64Mul(
            u64RotR(u64Add(u64Add(u64Add(x, y), v.lo), fetchU64(s, idx + 8)), 37),
            k1
        );
        y = u64Mul(u64RotR(u64Add(u64Add(y, v.hi), fetchU64(s, idx + 48)), 42), k1);
        x = u64XOR(x, w.hi);
        y = u64Add(y, u64Add(v.lo, fetchU64(s, idx + 40)));
        z = u64Mul(u64RotR(u64Add(z, w.lo), 33), k1);
        v = weakHashLen32WithSeeds(s, idx, u64Mul(v.hi, k1), u64Add(x, w.lo));
        w = weakHashLen32WithSeeds(
            s,
            idx + 32,
            u64Add(z, w.hi),
            u64Add(y, fetchU64(s, idx + 16))
        );
        const tmp = x;
        x = z;
        z = tmp;
        idx += 64;
        slen -= 64;
    }

    const mul = u64Add(k1, {
        hi: 0,
        lo: (((z.lo >>> 0) & 0xff) << 1) >>> 0,
    });
    idx = last64Idx;
    w.lo = u64Add(w.lo, {
        hi: 0,
        lo: ((slen - 1) & 63) >>> 0,
    });
    v.lo = u64Add(v.lo, w.lo);
    w.lo = u64Add(w.lo, v.lo);
    x = u64Mul(
        u64RotR(u64Add(u64Add(u64Add(x, y), v.lo), fetchU64(s, idx + 8)), 37),
        mul
    );
    y = u64Mul(u64RotR(u64Add(u64Add(y, v.hi), fetchU64(s, idx + 48)), 42), mul);
    x = u64XOR(
        x,
        u64Mul(w.hi, {
            hi: 0,
            lo: 9,
        })
    );
    y = u64Add(
        y,
        u64Add(
            u64Mul(v.lo, {
                hi: 0,
                lo: 9,
            }),
            fetchU64(s, idx + 40)
        )
    );
    z = u64Mul(u64RotR(u64Add(z, w.lo), 33), mul);
    v = weakHashLen32WithSeeds(s, idx, u64Mul(v.hi, mul), u64Add(x, w.lo));
    w = weakHashLen32WithSeeds(
        s,
        idx + 32,
        u64Add(z, w.hi),
        u64Add(y, fetchU64(s, idx + 16))
    );
    const tmp = x;
    x = z;
    z = tmp;

    return hashLen16Mul(
        u64Add(u64Add(hashLen16Mul(v.lo, w.lo, mul), u64Mul(shiftMix(y), k0)), z),
        u64Add(hashLen16Mul(v.hi, w.hi, mul), x),
        mul
    );
}

/**
 * Returns a 32-bit fingerprint hash for a byte array.
 *
 * NOTE: This is NOT equivalent to the original Fingerprint32 function.
 * It is derived from farmhash64.
 *
 * This function is not suitable for cryptography.
 *
 * @param {Uint8Array} s - The input byte array to hash.
 * @returns {number} The 32-bit hash value.
 */
function farmhash32(s) {
    return mix64To32(farmhash64(s));
}

// Reusable UTF-8 encoder: constructing one per call is measurably slower.
const utf8Encoder = new TextEncoder();

/**
 * Returns a 64-bit fingerprint hash for the UTF-8 encoding of a string.
 *
 * @param {string} str - The input string to hash.
 * @returns {object} The 64-bit hash value as an object with properties `hi` and `lo`, representing the high and low 32 bits respectively.
 */
function strFarmhash64(str) {
    return farmhash64(utf8Encoder.encode(str));
}

/**
 * Returns a 32-bit fingerprint hash for the UTF-8 encoding of a string.
 *
 * @param {string} str - The input string to hash.
 * @returns {number} The 32-bit hash value.
 */
function strFarmhash32(str) {
    return farmhash32(utf8Encoder.encode(str));
}

// Left-pad a string with zeros to a length of 8 characters.
function padL08(s) {
    return ("00000000" + s).slice(-8);
}

/**
 * Converts a 32-bit number to an 8-character hexadecimal string.
 *
 * @param {number} n - The number to convert.
 * @returns {string} The hexadecimal representation of the number.
 */
function hex32(n) {
    return padL08((n >>> 0).toString(16));
}

/**
 * Converts a 64-bit {hi,lo} hash value to a 16-character hexadecimal string.
 *
 * @param {Object} h - The 64-bit hash value to convert.
 * @returns {string} The hexadecimal representation of the hash value.
 */
function hex64(h) {
    return padL08((h.hi >>> 0).toString(16)) + padL08((h.lo >>> 0).toString(16));
}

/**
 * Returns a 64-bit fingerprint hash for the UTF-8 encoding of a string,
 * as a 16-character hexadecimal string.
 *
 * @param {string} str - The input string to hash.
 * @returns {string} The 64-bit hash value as a fixed-length hexadecimal string.
 */
function strFarmhash64Hex(str) {
    return hex64(strFarmhash64(str));
}

/**
 * Returns a 32-bit fingerprint hash for the UTF-8 encoding of a string,
 * as an 8-character hexadecimal string.
 *
 * @param {string} str - The input string to hash.
 * @returns {string} The 32-bit hash value as a fixed-length hexadecimal string.
 */
function strFarmhash32Hex(str) {
    return hex32(strFarmhash32(str));
}

if (typeof module !== "undefined") {
    module.exports = {
        farmhash32: farmhash32,
        farmhash64: farmhash64,
        strFarmhash32: strFarmhash32,
        strFarmhash64: strFarmhash64,
        strFarmhash32Hex: strFarmhash32Hex,
        strFarmhash64Hex: strFarmhash64Hex,
        hex32: hex32,
        hex64: hex64,
        _testData: _testData,
        _u32RotR: u32RotR,
        _u64RotR: u64RotR,
        _u64ShiftL: u64ShiftL,
        _u64ShiftR: u64ShiftR,
    };
}