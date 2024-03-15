/** FarmHash64 Javascript Library
 *
 * farmhash64.js
 *
 *
 * The Library farmhash64 implements the FarmHash64 and FarmHash32 hash functions for strings.
 *
 * FarmHash is a family of hash functions.
 *
 * FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
 * It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.
 *
 * The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.
 *
 * All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
 * This is a Java port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
 *
 * This code has been ported/translated by Nicola Asuni (Tecnick.com) to JavaScript code.
 *
 * NOTE: Javascript has no support for unsigned integers, so the 64-bit integers are
 *       represented as objects with two properties: hi and lo.
 *       The function toString() is provided to convert the 64-bit integer to an hexadecimal string.
 *
 * @category   Libraries
 * @license    see LICENSE file
 * @link       https://github.com/tecnickcom/farmhash64
 */

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

function padL08(s) {
    return ("00000000" + s).slice(-8);
}

function toHex(h) {
    return padL08(h.hi.toString(16)) + padL08(h.lo.toString(16));
}

/**
 * Represents a 64-bit unsigned integer.
 * @typedef {Object} Uint64
 * @property {number} hi - The high 32 bits of the 64-bit integer.
 * @property {number} lo - The low 32 bits of the 64-bit integer.
 * @property {function} hex - Converts the 64-bit integer to a fixed-length hexadecimal string.
 */
const Uint64 = {
    hi: 0,
    lo: 0,
    hex() {
        return toHex(this);
    }
}

function u64Add(a, b) {
    const losum = a.lo + b.lo;
    const cb = losum >>> 0 < a.lo >>> 0 || losum >>> 0 < b.lo >>> 0 ? 1 : 0;
    return {
        hi: (a.hi + b.hi + cb) >>> 0,
        lo: (a.lo + b.lo) >>> 0,
    };
}

function u32Split16(a) {
    return {
        hi: (a >>> 16) & 0xffff,
        lo: (a >>> 0) & 0xffff,
    };
}

function u32Mul(a, b) {
    const x = u32Split16(a);
    const y = u32Split16(b);
    return (x.lo * y.lo + (((x.hi * y.lo + x.lo * y.hi) << 16) >>> 0)) >>> 0;
}

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

function u64Mul(a, b) {
    return u64Add({
            hi: (u32Mul(a.hi, b.lo) + u32Mul(a.lo, b.hi)) >>> 0,
            lo: 0,
        },
        u32Mul64(a.lo, b.lo)
    );
}

function u32RotR(a, s) {
    if (s <= 0 || s >= 32) {
        return a >>> 0;
    }
    return ((a << (32 - s)) >>> 0) | (a >>> s);
}

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

function u64ShiftL(a, s) {
    if (s <= 0 || s >= 64) {
        return {
            hi: a.hi >>> 0,
            lo: a.lo >>> 0,
        };
    }
    if (s < 32) {
        return {
            hi: (a.lo >>> (32 - s)) | ((a.hi << s) >>> 0),
            lo: (a.lo << s) >>> 0,
        };
    }
    return {
        hi: (a.lo << (s - 32)) >>> 0,
        lo: 0,
    };
}

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
            lo: (a.hi << (32 - s)) | (a.lo >>> s),
        };
    }
    return {
        hi: 0,
        lo: a.hi >>> (s - 32),
    };
}

function u64XOR(a, b) {
    return {
        hi: (a.hi ^ b.hi) >>> 0,
        lo: (a.lo ^ b.lo) >>> 0,
    };
}

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

function fetchU64(s, i) {
    const lo =
        (s[i + 0] >>> 0) |
        ((s[i + 1] << 8) >>> 0) |
        ((s[i + 2] << 16) >>> 0) |
        ((s[i + 3] << 24) >>> 0);
    const hi =
        ((s[i + 4] << 32) >>> 0) |
        ((s[i + 5] << 40) >>> 0) |
        ((s[i + 6] << 48) >>> 0) |
        ((s[i + 7] << 56) >>> 0);
    return {
        hi: hi >>> 0,
        lo: lo >>> 0,
    };
}

function shiftMix(v) {
    return u64XOR(v, u64ShiftR(v, 47));
}

function mur(a, h) {
    a = u32Mul(a, c1);
    a = u32RotR(a, 17);
    a = u32Mul(a, c2);
    h = h ^ a;
    h = u32RotR(h, 19);
    return (u32Mul(h, 5) + 0xe6546b64) >>> 0;
}

function mix64To32(v) {
    return mur(v.hi, v.lo);
}

function hashLen16Mul(u, v, mul) {
    a = u64Mul(u64XOR(u, v), mul);
    a = u64XOR(a, u64ShiftR(a, 47));
    b = u64Mul(u64XOR(v, a), mul);
    b = u64XOR(b, u64ShiftR(b, 47));
    b = u64Mul(b, mul);
    return b;
}

function hashLen0to16(s) {
    const slen = s.length;
    const slen64 = {
        hi: 0,
        lo: slen >>> 0,
    };

    if (slen >= 8) {
        const mul = u64Add(
            k2,
            u64Mul(slen64, {
                hi: 0,
                lo: 2,
            })
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
            u64Mul(slen64, {
                hi: 0,
                lo: 2,
            })
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

function hashLen17to32(s) {
    const slen = s.length;
    const slen64 = {
        hi: 0,
        lo: slen >>> 0,
    };
    const mul = u64Add(
        k2,
        u64Mul(slen64, {
            hi: 0,
            lo: 2,
        })
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

function hashLen33to64(s) {
    const slen = s.length;
    const slen64 = {
        hi: 0,
        lo: slen >>> 0,
    };
    const mul = u64Add(
        k2,
        u64Mul(slen64, {
            hi: 0,
            lo: 2,
        })
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

function weakHashLen32WithSeedsWords(w, x, y, z, a, b) {
    a = u64Add(a, w);
    b = u64RotR(u64Add(u64Add(b, a), z), 21);
    c = a;
    a = u64Add(a, x);
    a = u64Add(a, y);
    b = u64Add(b, u64RotR(a, 44));
    return {
        hi: u64Add(b, c),
        lo: u64Add(a, z),
    };
}

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

function _testData(size) {
    const k0 = {
        hi: 0xc3a5c85c,
        lo: 0x97cb3127,
    };
    const data = new Uint8Array(size);
    var a = {
        hi: 0,
        lo: 9,
    };
    var b = {
        hi: 0,
        lo: 777,
    };
    for (let i = 0; i < size; i++) {
        a = u64Add(a, b);
        b = u64Add(b, a);
        a = u64Mul(u64XOR(a, u64ShiftR(a, 41)), k0);
        b = u64Add(u64Mul(u64XOR(b, u64ShiftR(b, 41)), k0), {
            hi: 0,
            lo: i,
        });
        data[i] = (u64ShiftR(b, 37).lo & 0xff);
    }
    return data;
}

/**
 * Calculates the 64-bit FarmHash hash value for the given byte array.
 *
 * @param {Uint8Array} s - The input byte array to be hashed.
 * @returns {object} The 64-bit hash value as an object with properties `hi` and `lo`, representing the high and low 32 bits respectively.
 */
function farmhash64(s) {
    var slen = s.length;

    if (slen <= 16) {
        return hashLen0to16(s);
    }

    if (slen <= 32) {
        return hashLen17to32(s);
    }

    if (slen <= 64) {
        return hashLen33to64(s);
    }

    var v = {
        hi: {
            hi: 0,
            lo: 0,
        },
        lo: {
            hi: 0,
            lo: 0,
        },
    };

    var w = {
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

    var x = u64Add(u64Mul(seed, k2), fetchU64(s, 0));
    var y = u64Add(u64Mul(seed, k1), a113);
    var z = u64Mul(shiftMix(u64Add(u64Mul(y, k2), a113)), k2);

    const endIdx = ((slen - 1) >>> 6) << 6;
    const last64Idx = endIdx + (((slen - 1) >>> 0) & 63) - 63;

    var idx = 0;

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
        tmp = x;
        x = z;
        z = tmp;
        idx += 64;
        slen -= 64;
    }

    mul = u64Add(k1, {
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
    tmp = x;
    x = z;
    z = tmp;

    return hashLen16Mul(
        u64Add(u64Add(hashLen16Mul(v.lo, w.lo, mul), u64Mul(shiftMix(y), k0)), z),
        u64Add(hashLen16Mul(v.hi, w.hi, mul), x),
        mul
    );
}

function farmhash32(s) {
    return mix64To32(farmhash64(s));
}

function strFarmhash64(str) {
    const s = new TextEncoder().encode(str);
    return farmhash64(s);
}

function strFarmhash32(str) {
    const s = new TextEncoder().encode(str);
    return farmhash32(s);
}

if (typeof module !== "undefined") {
    module.exports = {
        farmhash32: farmhash32,
        farmhash64: farmhash64,
        strFarmhash32: strFarmhash32,
        strFarmhash64: strFarmhash64,
        toHex: toHex,
        _testData: _testData,
    };
}