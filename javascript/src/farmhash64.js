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
    lo: 0x97cb3127
};
const k1 = {
    hi: 0xb492b66f,
    lo: 0xbe98f273
};
const k2 = {
    hi: 0x9ae16a3b,
    lo: 0x2f90404f
};

const c1 = 0xcc9e2d51;
const c2 = 0x1b873593;

function u64Add(a, b) {
    const overflow =
        ((a.lo & 0x7fffffff) + (b.lo & 0x7fffffff)) >>> 0 > 0x7fffffff ? 1 : 0;
    return {
        hi: (a.hi + b.hi + overflow) >>> 0,
        lo: (a.lo + b.lo) >>> 0,
    };
}

function u64Mul(a, b) {
    const a00 = a.lo & 0xffff;
    const a16 = a.lo >>> 16;
    const b00 = b.lo & 0xffff;
    const b16 = b.lo >>> 16;
    const a0b0 = a00 * b00;
    const a0b16 = a00 * b16;
    const a16b0 = a16 * b00;
    const a16b16 = a16 * b16;
    const lo = a0b0 + (a0b16 << 16) + (a16b0 << 16);
    const hi = a.hi * b.hi + a16b16 + a0b16 + a16b0 + (lo >>> 16);
    return {
        hi: hi,
        lo: lo,
    };
}

function u32RotR(a, s) {
    if (s <= 0 || s >= 32) {
        return a >>> 0;
    }
    return (a >>> s) | (a << (32 - s));
}

function u64RotR(a, s) {
    if (s <= 0 || s >= 64) {
        return {
            hi: a.hi,
            lo: a.lo,
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
            hi: a.lo,
            lo: a.hi,
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
            hi: a.hi,
            lo: a.lo,
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
            hi: a.hi,
            lo: a.lo,
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
        hi: a.hi ^ b.hi,
        lo: a.lo ^ b.lo,
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
        mul = u64Add(k2, u64Mul(slen, {
            hi: 0,
            lo: 2
        }));
        a = u64Add(fetch64(s, 0), k2);
        b = fetch64(s, slen - 8);
        c = u64Add(u64Mul(rotate64(b, 37), mul), a);
        d = u64Mul(u64Add(rotate64(a, 25), b), mul);
        return hashLen16Mul(c, d, mul);
    }
    if (slen >= 4) {
        mul = u64Add(k2, u64Mul(slen, {
            hi: 0,
            lo: 2
        }));
        a = fetch32(s, 0);
        return hashLen16Mul(
            u64Add(slen, u64ShiftL(a, 3)),
            fetch32(s, slen - 4),
            mul
        );
    }

    if (slen > 0) {
        a = s.charCodeAt(0);
        b = s.charCodeAt(slen >>> 1);
        c = s.charCodeAt(slen - 1);
        y = a + (b << 8);
        z = slen + (c << 2);

        return u64Mul(
            shiftMix(
                u64XOR(u64Mul({
                    hi: 0,
                    lo: y
                }, k2), u64Mul({
                    hi: 0,
                    lo: z
                }, k0))
            ),
            k2
        );
    }

    return k2;
}

function hashLen17to32(s) {
    slen = s.length;
    mul = u64Add(k2, u64Mul(slen, {
        hi: 0,
        lo: 2
    }));
    a = u64Mul(fetch64(s, 0), k1);
    b = fetch64(s, 8);
    c = u64Mul(fetch64(s, slen - 8), mul);
    d = u64Mul(fetch64(s, slen - 16), k2);
    return hashLen16Mul(
        u64Add(u64Add(rotate64(u64Add(a, b), 43), rotate64(c, 30)), d),
        u64Add(u64Add(a, rotate64(u64Add(b, k2), 18)), c),
        mul
    );
}

function hashLen33to64(s) {
    slen = s.length;
    mul = u64Add(k2, u64Mul(slen, {
        hi: 0,
        lo: 2
    }));
    a = u64Add(fetch64(s, 0), k2);
    b = fetch64(s, 8);
    c = u64Mul(fetch64(s, slen - 8), mul);
    d = u64Mul(fetch64(s, slen - 16), k2);
    y = u64Add(u64Add(rotate64(u64Add(a, b), 43), rotate64(c, 30)), d);
    z = hashLen16Mul(y, u64Add(u64Add(a, rotate64(u64Add(b, k2), 18)), c), mul);
    e = u64Mul(fetch64(s, 16), mul);
    f = fetch64(s, 24);
    g = u64Add(y, u64Mul(fetch64(s, slen - 32)), mul);
    h = u64Add(z, u64Mul(fetch64(s, slen - 24)), mul);
    return hashLen16Mul(
        u64Add(u64Add(rotate64(u64Add(e, f), 43), rotate64(g, 30)), h),
        u64Add(u64Add(e, rotate64(u64Add(f, a), 18)), g),
        mul
    );
}

function weakHashLen32WithSeedsWords(w, x, y, z, a, b) {
    a = u64Add(a, w);
    b = rotate64(u64Add(u64Add(b, a), z), 21);
    c = a;
    a = u64Add(a, x);
    a = u64Add(a, y);
    b = u64Add(b, rotate64(a, 44));
    return {
        hi: u64Add(b, c),
        lo: u64Add(a, z),
    };
}

function weakHashLen32WithSeeds(s, idx, a, b) {
    return weakHashLen32WithSeedsWords(
        fetch64(s, idx + 0),
        fetch64(s, idx + 8),
        fetch64(s, idx + 16),
        fetch64(s, idx + 24),
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

    x = u64Add(u64Mul(seed, k2), fetch64(s, 0));
    y = u64Add(u64Mul(seed, k1), 113);
    z = u64Mul(shiftMix(u64Add(u64Mul(y, k2), 113)), k2);

    endIdx = ((slen - 1) / 64) * 64;
    last64Idx = endIdx + ((slen - 1) & 63) - 63;
    idx = 0;

    while (slen > 64) {
        x = u64Mul(
            rotate64(u64Add(u64Add(u64Add(x, y), v.lo), fetch64(s, idx + 8)), 37),
            k1
        );
        y = u64Mul(rotate64(u64Add(u64Add(y, v.hi), fetch64(s, idx + 48)), 42), k1);
        x = u64XOR(x, w.hi);
        y = u64Add(y, u64Add(v.lo, fetch64(s, idx + 40)));
        z = u64Mul(rotate64(u64Add(z, w.lo), 33), k1);
        v = weakHashLen32WithSeeds(s, idx, u64Mul(v.hi, k1), u64Add(x, w.lo));
        w = weakHashLen32WithSeeds(
            s,
            idx + 32,
            u64Add(z, w.hi),
            u64Add(y, fetch64(s, idx + 16))
        );
        tmp = x;
        x = z;
        z = tmp;
        idx += 64;
        slen -= 64;
    }

    mul = u64Add(k1, {
        hi: 0,
        lo: ((z.lo & 0xff) << 1) >>> 0
    });
    idx = last64Idx;
    w.lo = u64Add(w.lo, {
        hi: 0,
        lo: ((slen - 1) & 63) >>> 0,
    });
    v.lo = u64Add(v.lo, w.lo);
    w.lo = u64Add(w.lo, v.lo);
    x = u64Mul(
        rotate64(u64Add(u64Add(u64Add(x, y), v.lo), fetch64(s, idx + 8)), 37),
        mul
    );
    y = u64Mul(rotate64(u64Add(u64Add(y, v.hi), fetch64(s, idx + 48)), 42), mul);
    x = u64XOR(x, u64Mul(w.hi, 9));
    y = u64Add(y, u64Add(u64Mul(v.lo, 9), fetch64(s, idx + 40)));
    z = u64Mul(rotate64(u64Add(z, w.lo), 33), mul);
    v = weakHashLen32WithSeeds(s, idx, u64Mul(v.hi, mul), u64Add(x, w.lo));
    w = weakHashLen32WithSeeds(
        s,
        idx + 32,
        u64Add(z, w.hi),
        u64Add(y, fetch64(s, idx + 16))
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
    };
}