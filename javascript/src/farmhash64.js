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

function u64Add(a, b) {
    const rst =
        ((a.lo & 0x7fffffff) + (b.lo & 0x7fffffff)) >>> 0 > 0x7fffffff ? 1 : 0;
    return {
        hi: (a.hi + b.hi + rst) >>> 0,
        lo: (a.lo + b.lo) >>> 0,
    };
}

function u32Split16(a) {
    return {
        hi: ((a >>> 16) & 0xffff) >>> 0,
        lo: (a & 0xffff) >>> 0,
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
        lo: u32Mul(x.lo, y.lo)
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
    return (a << (32 - s)) | (a >>> s);
}

function u64RotR(a, s) {
    if (s <= 0 || s >= 64) {
        return {
            hi: a.hi >>> 0,
            lo: a.lo >>> 0,
        };
    }
    if (s < 32) {
        return {
            hi: (a.hi << (32 - s)) | (a.lo >>> s),
            lo: (a.lo << (32 - s)) | (a.hi >>> s),
        };
    }
    if (s === 32) {
        return {
            hi: a.lo >>> 0,
            lo: a.hi >>> 0,
        };
    }
    return {
        hi: (a.lo << (64 - s)) | (a.hi >>> (s - 32)),
        lo: (a.hi << (64 - s)) | (a.lo >>> (s - 32)),
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
        s.charCodeAt(i + 0) |
        (s.charCodeAt(i + 1) << 8) |
        (s.charCodeAt(i + 2) << 16) |
        (s.charCodeAt(i + 3) << 24);
    return {
        hi: 0,
        lo: lo,
    };
}

function fetchU64(s, i) {
    const lo =
        s.charCodeAt(i + 0) |
        (s.charCodeAt(i + 1) << 8) |
        (s.charCodeAt(i + 2) << 16) |
        (s.charCodeAt(i + 3) << 24);
    const hi =
        (s.charCodeAt(i + 4) << 32) |
        (s.charCodeAt(i + 5) << 40) |
        (s.charCodeAt(i + 6) << 48) |
        (s.charCodeAt(i + 7) << 56);
    return {
        hi: hi,
        lo: lo,
    };
}

function shiftMix(v) {
    return u64XOR(v, u64ShiftR(v, 47));
}

function mur(a, h) {
    a *= c1;
    a = u32RotR(a, 17);
    a *= c2;
    h ^= a;
    h = u32RotR(h, 19);

    return (h * 5 + 0xe6546b64) >>> 0;
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
    slen = s.length;
    if (slen >= 8) {
        mul = u64Add(
            k2,
            u64Mul(slen, {
                hi: 0,
                lo: 2,
            })
        );
        a = u64Add(fetchU64(s, 0), k2);
        b = fetchU64(s, slen - 8);
        c = u64Add(u64Mul(u64RotR(b, 37), mul), a);
        d = u64Mul(u64Add(u64RotR(a, 25), b), mul);
        return hashLen16Mul(c, d, mul);
    }
    if (slen >= 4) {
        mul = u64Add(
            k2,
            u64Mul(slen, {
                hi: 0,
                lo: 2,
            })
        );
        a = fetchU32(s, 0);
        return hashLen16Mul(
            u64Add(slen, u64ShiftL(a, 3)),
            fetchU32(s, slen - 4),
            mul
        );
    }

    if (slen > 0) {
        a = s.charCodeAt(0) >>> 0;
        b = s.charCodeAt(slen >>> 1) >>> 0;
        c = s.charCodeAt(slen - 1) >>> 0;
        y = (a + (b << 8)) >>> 0;
        z = (slen + (c << 2)) >>> 0;


        yk2 = u64Mul({
                hi: 0,
                lo: y,
            },
            k2
        );

        zk0 = u64Mul({
                hi: 0,
                lo: z,
            },
            k0
        );

        xor = u64XOR(yk2, zk0);

        sm = shiftMix(xor);

        console.error(s, toString(yk2), toString(zk0), toString(xor), toString(sm)); //DEBUG

        return u64Mul(sm, k2);


        /*
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
        */
    }

    return k2;
}

function hashLen17to32(s) {
    slen = s.length;
    mul = u64Add(
        k2,
        u64Mul(slen, {
            hi: 0,
            lo: 2,
        })
    );
    a = u64Mul(fetchU64(s, 0), k1);
    b = fetchU64(s, 8);
    c = u64Mul(fetchU64(s, slen - 8), mul);
    d = u64Mul(fetchU64(s, slen - 16), k2);
    return hashLen16Mul(
        u64Add(u64Add(u64RotR(u64Add(a, b), 43), u64RotR(c, 30)), d),
        u64Add(u64Add(a, u64RotR(u64Add(b, k2), 18)), c),
        mul
    );
}

function hashLen33to64(s) {
    slen = s.length;
    mul = u64Add(
        k2,
        u64Mul(slen, {
            hi: 0,
            lo: 2,
        })
    );
    a = u64Add(fetchU64(s, 0), k2);
    b = fetchU64(s, 8);
    c = u64Mul(fetchU64(s, slen - 8), mul);
    d = u64Mul(fetchU64(s, slen - 16), k2);
    y = u64Add(u64Add(u64RotR(u64Add(a, b), 43), u64RotR(c, 30)), d);
    z = hashLen16Mul(y, u64Add(u64Add(a, u64RotR(u64Add(b, k2), 18)), c), mul);
    e = u64Mul(fetchU64(s, 16), mul);
    f = fetchU64(s, 24);
    g = u64Add(y, u64Mul(fetchU64(s, slen - 32), mul));
    h = u64Add(z, u64Mul(fetchU64(s, slen - 24), mul));
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

function farmhash64(s) {
    slen = s.length;

    const seed = 81;

    if (slen <= 16) {
        return hashLen0to16(s);
    }

    if (slen <= 32) {
        return hashLen17to32(s);
    }

    if (slen <= 64) {
        return hashLen33to64(s);
    }

    v = {
        hi: 0,
        lo: 0,
    };
    w = {
        hi: 0,
        lo: 0,
    };
    x = u64Add(u64Mul(seed, k2), fetchU64(s, 0));
    y = u64Add(u64Mul(seed, k1), 113);
    z = u64Mul(shiftMix(u64Add(u64Mul(y, k2), 113)), k2);

    endIdx = ((slen - 1) / 64) * 64;
    last64Idx = endIdx + ((slen - 1) & 63) - 63;
    idx = 0;

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
    x = u64XOR(x, u64Mul(w.hi, 9));
    y = u64Add(y, u64Add(u64Mul(v.lo, 9), fetchU64(s, idx + 40)));
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

function padL08(s) {
    return ("00000000" + s).slice(-8);
}

function toString(h) {
    return padL08(h.hi.toString(16)) + padL08(h.lo.toString(16));
}

function parseHex(hs) {
    return {
        hi: parseInt(hs.substring(0, 8), 16) >>> 0,
        lo: parseInt(hs.substring(8, 16), 16) >>> 0,
    };
}

if (typeof module !== "undefined") {
    module.exports = {
        farmhash32: farmhash32,
        farmhash64: farmhash64,
        parseHex: parseHex,
        toString: toString,

        u32Mul: u32Mul,
    };
}