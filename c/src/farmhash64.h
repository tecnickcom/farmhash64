/**
 * @file farmhash64.h
 * @brief Header-only implementation of the farmhash64 and farmhash32 hash functions.
 *
 * FarmHash is a family of hash functions.
 *
 * FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
 * It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.
 *
 * The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.
 *
 * All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
 * This is Nicola Asuni's (Tecnick.com) header-only C rewrite of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
 */

#ifndef FARMHASH64_H
#define FARMHASH64_H

// The standard headers must be included outside of the "extern C" block:
// in C++ mode they declare overloaded and templated entities that must not
// have C language linkage.
#include <stddef.h>
#include <stdint.h>
#include <string.h>
#if defined(_MSC_VER)
// _byteswap_uint64() and _byteswap_ulong() are declared here.
#include <stdlib.h>
#endif

// Compile-time byte order detection.
//
// The hash is defined on the little-endian interpretation of the input bytes.
// Define FARMHASH_LITTLE_ENDIAN or FARMHASH_BIG_ENDIAN to override the
// detection. When the byte order is not known, the fetch helpers assemble the
// value one byte at a time, which is correct on any byte order.
#if !defined(FARMHASH_LITTLE_ENDIAN) && !defined(FARMHASH_BIG_ENDIAN)
#if defined(__BYTE_ORDER__) && defined(__ORDER_LITTLE_ENDIAN__) && (__BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__)
#define FARMHASH_LITTLE_ENDIAN 1
#elif defined(__BYTE_ORDER__) && defined(__ORDER_BIG_ENDIAN__) && (__BYTE_ORDER__ == __ORDER_BIG_ENDIAN__)
#define FARMHASH_BIG_ENDIAN 1
#elif defined(_M_IX86) || defined(_M_X64) || defined(_M_AMD64) || defined(_M_ARM) || defined(_M_ARM64) || defined(__LITTLE_ENDIAN__)
#define FARMHASH_LITTLE_ENDIAN 1
#elif defined(_M_PPC) || defined(__BIG_ENDIAN__) || defined(__ARMEB__) || defined(__MIPSEB__) || defined(__s390x__)
#define FARMHASH_BIG_ENDIAN 1
#endif
#endif

#if defined(FARMHASH_LITTLE_ENDIAN) && defined(FARMHASH_BIG_ENDIAN)
#error "FARMHASH_LITTLE_ENDIAN and FARMHASH_BIG_ENDIAN must not both be defined"
#endif

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Represents a 128-bit unsigned integer as a pair of 64-bit halves.
 *
 * @private
 */
typedef struct farmhash_uint128_t
{
    uint64_t hi; /**< The higher 64 bits of the 128-bit integer. */
    uint64_t lo; /**< The lower 64 bits of the 128-bit integer. */
} farmhash_uint128_t;

// Some primes between 2^63 and 2^64 for various uses.
static const uint64_t farmhash_k0 = 0xc3a5c85c97cb3127ULL;
static const uint64_t farmhash_k1 = 0xb492b66fbe98f273ULL;
static const uint64_t farmhash_k2 = 0x9ae16a3b2f90404fULL;

// Magic numbers for 32-bit hashing.  Copied from Murmur3.
static const uint32_t farmhash_c1 = 0xcc9e2d51;
static const uint32_t farmhash_c2 = 0x1b873593;

/**
 * @brief Create a farmhash_uint128_t value from two 64-bit integers.
 *
 * @param hi High 64 bits
 * @param lo Low 64 bits
 *
 * @return farmhash_uint128_t value
 *
 * @private
 */
static inline farmhash_uint128_t farmhash_make_uint128_t(uint64_t hi, uint64_t lo)
{
    farmhash_uint128_t x = {hi, lo};
    return x;
}

/**
 * @brief Reverse the byte order of a 64-bit integer.
 *
 * Used by the fetch helpers on big-endian hosts.
 *
 * @param val The value to byte-swap
 *
 * @return The byte-swapped value
 *
 * @private
 */
static inline uint64_t farmhash_bswap64(uint64_t val)
{
#if defined(__GNUC__) || defined(__clang__)
    return __builtin_bswap64(val);
#elif defined(_MSC_VER)
    return _byteswap_uint64(val);
#else
    return ((val & 0x00000000000000ffULL) << 56)
           | ((val & 0x000000000000ff00ULL) << 40)
           | ((val & 0x0000000000ff0000ULL) << 24)
           | ((val & 0x00000000ff000000ULL) << 8)
           | ((val & 0x000000ff00000000ULL) >> 8)
           | ((val & 0x0000ff0000000000ULL) >> 24)
           | ((val & 0x00ff000000000000ULL) >> 40)
           | ((val & 0xff00000000000000ULL) >> 56);
#endif
}

/**
 * @brief Reverse the byte order of a 32-bit integer.
 *
 * Used by the fetch helpers on big-endian hosts.
 *
 * @param val The value to byte-swap
 *
 * @return The byte-swapped value
 *
 * @private
 */
static inline uint32_t farmhash_bswap32(uint32_t val)
{
#if defined(__GNUC__) || defined(__clang__)
    return __builtin_bswap32(val);
#elif defined(_MSC_VER)
    return _byteswap_ulong(val);
#else
    return ((val & 0x000000ffU) << 24)
           | ((val & 0x0000ff00U) << 8)
           | ((val & 0x00ff0000U) >> 8)
           | ((val & 0xff000000U) >> 24);
#endif
}

/**
 * @brief Fetch a 64-bit little-endian integer from a byte array.
 *
 * The bytes are always interpreted in little-endian order, regardless of the
 * byte order of the host, so the hash values are identical on every platform.
 *
 * When the host byte order is known, the value is read with a single memcpy of
 * a compile-time constant size, which is subject to neither the alignment nor
 * the strict-aliasing rules of a pointer cast. Otherwise the value is assembled
 * one byte at a time.
 *
 * @param p Pointer to the byte array
 *
 * @return The fetched 64-bit integer
 *
 * @private
 */
static inline uint64_t farmhash_fetch64(const char *p)
{
#if defined(FARMHASH_LITTLE_ENDIAN) || defined(FARMHASH_BIG_ENDIAN)
    uint64_t val = 0;
    memcpy(&val, p, sizeof(val));
#if defined(FARMHASH_BIG_ENDIAN)
    val = farmhash_bswap64(val);
#endif
    return val;
#else
    const uint8_t *b = (const uint8_t *)p;
    return (uint64_t)b[0]
           | ((uint64_t)b[1] << 8)
           | ((uint64_t)b[2] << 16)
           | ((uint64_t)b[3] << 24)
           | ((uint64_t)b[4] << 32)
           | ((uint64_t)b[5] << 40)
           | ((uint64_t)b[6] << 48)
           | ((uint64_t)b[7] << 56);
#endif
}

/**
 * @brief Fetch a 32-bit little-endian integer from a byte array.
 *
 * The bytes are always interpreted in little-endian order, regardless of the
 * byte order of the host. See farmhash_fetch64().
 *
 * @param p Pointer to the byte array
 *
 * @return The fetched 32-bit integer
 *
 * @private
 */
static inline uint32_t farmhash_fetch32(const char *p)
{
#if defined(FARMHASH_LITTLE_ENDIAN) || defined(FARMHASH_BIG_ENDIAN)
    uint32_t val = 0;
    memcpy(&val, p, sizeof(val));
#if defined(FARMHASH_BIG_ENDIAN)
    val = farmhash_bswap32(val);
#endif
    return val;
#else
    const uint8_t *b = (const uint8_t *)p;
    return (uint32_t)b[0]
           | ((uint32_t)b[1] << 8)
           | ((uint32_t)b[2] << 16)
           | ((uint32_t)b[3] << 24);
#endif
}

/**
 * @brief Swap the values of two 64-bit integers.
 *
 * @param a Pointer to the first integer
 * @param b Pointer to the second integer
 *
 * @private
 */
static inline void farmhash_swap64(uint64_t *a, uint64_t *b)
{
    uint64_t t = *a;
    *a = *b;
    *b = t;
}

/**
 * @brief Rotate a 32-bit integer right by a specified number of bits.
 *
 * The shift is reduced modulo 32, so shifts of 0 and 32 return the input unchanged.
 *
 * @param val The value to rotate
 * @param shift The number of bits to rotate by
 *
 * @return The rotated value
 *
 * @private
 */
static inline uint32_t farmhash_ror32(uint32_t val, size_t shift)
{
    return (val >> (shift & 31)) | (val << ((32 - shift) & 31));
}

/**
 * @brief Rotate a 64-bit integer right by a specified number of bits.
 *
 * The shift is reduced modulo 64, so shifts of 0 and 64 return the input unchanged.
 *
 * @param val The value to rotate
 * @param shift The number of bits to rotate by
 *
 * @return The rotated value
 *
 * @private
 */
static inline uint64_t farmhash_ror64(uint64_t val, size_t shift)
{
    return (val >> (shift & 63)) | (val << ((64 - shift) & 63));
}

/**
 * @brief XOR a 64-bit value with itself shifted right by 47 bits.
 *
 * @param val The input 64-bit value.
 *
 * @return The mixed value.
 *
 * @private
 */
static inline uint64_t farmhash_smix(uint64_t val)
{
    return val ^ (val >> 47);
}

/**
 * @brief Combine a 32-bit value into a running hash using the MurmurHash3 mixing step.
 *
 * @param a The input value to be hashed.
 * @param h The current hash value.
 *
 * @return The updated hash value.
 *
 * @private
 */
static inline uint32_t farmhash_mur(uint32_t a, uint32_t h)
{
    a *= farmhash_c1;
    a = farmhash_ror32(a, 17);
    a *= farmhash_c2;
    h ^= a;
    h = farmhash_ror32(h, 19);
    return (h * 5) + 0xe6546b64;
}

/**
 * @brief Reduce a 64-bit integer to 32 bits using the MurmurHash3 mixing step.
 *
 * @param x The 64-bit integer to be reduced.
 *
 * @return The 32-bit hash code.
 *
 * @private
 */
static inline uint32_t farmhash_mix_64_to_32(uint64_t x)
{
    return farmhash_mur((uint32_t)(x >> 32), (uint32_t)x);
}

/**
 * @brief Calculate a 64-bit hash code for a byte array of length 16, multiplied by a constant.
 *
 * @param u First 64 bits of the byte array
 * @param v Last 64 bits of the byte array
 * @param mul The multiplication constant
 *
 * @return 64-bit hash code
 *
 * @private
 */
static inline uint64_t farmhash_len_16_mul(uint64_t u, uint64_t v, uint64_t mul)
{
    // Murmur-inspired hashing.
    uint64_t a = (u ^ v) * mul;
    a ^= (a >> 47);
    uint64_t b = (v ^ a) * mul;
    b ^= (b >> 47);
    b *= mul;
    return b;
}

/**
 * @brief Calculate a 64-bit hash code for a byte array of length 0 to 16.
 *
 * @param s Pointer to the byte array
 * @param len Length of the byte array
 *
 * @return 64-bit hash code
 *
 * @private
 */
static inline uint64_t farmhash_na_len_0_to_16(const char *s, size_t len)
{
    if (len >= 8)
    {
        uint64_t mul = farmhash_k2 + (len * 2);
        uint64_t a = farmhash_fetch64(s) + farmhash_k2;
        uint64_t b = farmhash_fetch64(s + len - 8);
        uint64_t c = (farmhash_ror64(b, 37) * mul) + a;
        uint64_t d = (farmhash_ror64(a, 25) + b) * mul;
        return farmhash_len_16_mul(c, d, mul);
    }
    if (len >= 4)
    {
        uint64_t mul = farmhash_k2 + (len * 2);
        uint64_t a = farmhash_fetch32(s);
        return farmhash_len_16_mul(len + (a << 3), farmhash_fetch32(s + len - 4), mul);
    }
    if (len > 0)
    {
        uint8_t a = (uint8_t)s[0];
        uint8_t b = (uint8_t)s[len >> 1];
        uint8_t c = (uint8_t)s[len - 1];
        uint32_t y = (uint32_t)a + ((uint32_t)b << 8);
        uint32_t z = (uint32_t)len + ((uint32_t)c << 2);
        return farmhash_smix((y * farmhash_k2) ^ (z * farmhash_k0)) * farmhash_k2;
    }
    return farmhash_k2;
}

/**
 * @brief Calculate a 64-bit hash code for a byte array of length 17 to 32.
 *
 * @param s Pointer to the byte array
 * @param len Length of the byte array
 *
 * @return 64-bit hash code
 *
 * @private
 */
static inline uint64_t farmhash_na_len_17_to_32(const char *s, size_t len)
{
    uint64_t mul = farmhash_k2 + (len * 2);
    uint64_t a = farmhash_fetch64(s) * farmhash_k1;
    uint64_t b = farmhash_fetch64(s + 8);
    uint64_t c = farmhash_fetch64(s + len - 8) * mul;
    uint64_t d = farmhash_fetch64(s + len - 16) * farmhash_k2;
    return farmhash_len_16_mul(farmhash_ror64(a + b, 43) + farmhash_ror64(c, 30) + d,
                               a + farmhash_ror64(b + farmhash_k2, 18) + c,
                               mul);
}

/**
 * @brief Calculate a 64-bit hash code for a byte array of length 33 to 64.
 *
 * @param s Pointer to the byte array
 * @param len Length of the byte array
 *
 * @return 64-bit hash code
 *
 * @private
 */
static inline uint64_t farmhash_na_len_33_to_64(const char *s, size_t len)
{
    uint64_t mul = farmhash_k2 + (len * 2);
    uint64_t a = farmhash_fetch64(s) * farmhash_k2;
    uint64_t b = farmhash_fetch64(s + 8);
    uint64_t c = farmhash_fetch64(s + len - 8) * mul;
    uint64_t d = farmhash_fetch64(s + len - 16) * farmhash_k2;
    uint64_t y = farmhash_ror64(a + b, 43) + farmhash_ror64(c, 30) + d;
    uint64_t z = farmhash_len_16_mul(y, a + farmhash_ror64(b + farmhash_k2, 18) + c, mul);
    uint64_t e = farmhash_fetch64(s + 16) * mul;
    uint64_t f = farmhash_fetch64(s + 24);
    uint64_t g = (y + farmhash_fetch64(s + len - 32)) * mul;
    uint64_t h = (z + farmhash_fetch64(s + len - 24)) * mul;
    return farmhash_len_16_mul(farmhash_ror64(e + f, 43) + farmhash_ror64(g, 30) + h,
                               e + farmhash_ror64(f + a, 18) + g,
                               mul);
}

/**
 * @brief Calculate a 128-bit weak hash code from four 64-bit words and two seeds.
 *        Callers do best to use "random-looking" values for a and b.
 *
 * @param w First 64-bit word
 * @param x Second 64-bit word
 * @param y Third 64-bit word
 * @param z Fourth 64-bit word
 * @param a First seed value
 * @param b Second seed value
 *
 * @return 128-bit weak hash code
 *
 * @private
 */
static inline farmhash_uint128_t farmhash_weak_na_len_32_with_seeds_vals(uint64_t w, uint64_t x, uint64_t y, uint64_t z, uint64_t a, uint64_t b)
{
    a += w;
    b = farmhash_ror64(b + a + z, 21);
    uint64_t c = a;
    a += x;
    a += y;
    b += farmhash_ror64(a, 44);
    return farmhash_make_uint128_t(b + c, a + z);
}

/**
 * @brief Calculate a 128-bit weak hash code for a byte array of length 32, including seeds.
 *
 * @param s Pointer to the byte array
 * @param a First seed value
 * @param b Second seed value
 *
 * @return 128-bit weak hash code
 *
 * @private
 */
static inline farmhash_uint128_t farmhash_weak_na_len_32_with_seeds(const char *s, uint64_t a, uint64_t b)
{
    return farmhash_weak_na_len_32_with_seeds_vals(farmhash_fetch64(s),
            farmhash_fetch64(s + 8),
            farmhash_fetch64(s + 16),
            farmhash_fetch64(s + 24),
            a,
            b);
}

// =================================================================================================
// PUBLIC FUNCTIONS
// =================================================================================================

/**
 * @brief Returns a 64-bit fingerprint hash for a byte array.
 *
 * This function is not suitable for cryptography.
 *
 * The pointer is not dereferenced when len is 0.
 *
 * @param s   byte array to process
 * @param len number of bytes to process
 *
 * @return 64-bit hash code
 *
 * @public
 */
static inline uint64_t farmhash64(const char *s, size_t len)
{
    const uint64_t seed = 81;
    if (len <= 32)
    {
        if (len <= 16)
        {
            return farmhash_na_len_0_to_16(s, len);
        }
        return farmhash_na_len_17_to_32(s, len);
    }
    if (len <= 64)
    {
        return farmhash_na_len_33_to_64(s, len);
    }
    // For strings over 64 bytes we loop.
    // Internal state consists of 56 bytes: v, w, x, y, and z.
    farmhash_uint128_t v = farmhash_make_uint128_t(0, 0);
    farmhash_uint128_t w = farmhash_make_uint128_t(0, 0);
    uint64_t x = (seed * farmhash_k2) + farmhash_fetch64(s);
    uint64_t y = (seed * farmhash_k1) + 113;
    uint64_t z = farmhash_smix((y * farmhash_k2) + 113) * farmhash_k2;
    // Set end so that after the loop we have 1 to 64 bytes left to process.
    const char *end = s + (((len - 1) >> 6) << 6);
    // Equivalent to (s + len - 64): the last 64 bytes of the input.
    const char *last64 = end + ((len - 1) & 63) - 63;
    while (s != end)
    {
        x = farmhash_ror64(x + y + v.lo + farmhash_fetch64(s + 8), 37) * farmhash_k1;
        y = farmhash_ror64(y + v.hi + farmhash_fetch64(s + 48), 42) * farmhash_k1;
        x ^= w.hi;
        y += v.lo + farmhash_fetch64(s + 40);
        z = farmhash_ror64(z + w.lo, 33) * farmhash_k1;
        v = farmhash_weak_na_len_32_with_seeds(s, v.hi * farmhash_k1, x + w.lo);
        w = farmhash_weak_na_len_32_with_seeds(s + 32, z + w.hi, y + farmhash_fetch64(s + 16));
        farmhash_swap64(&z, &x);
        s += 64;
    }
    uint64_t mul = farmhash_k1 + ((z & 0xff) << 1);
    // Make s point to the last 64 bytes of input.
    s = last64;
    w.lo += ((len - 1) & 63);
    v.lo += w.lo;
    w.lo += v.lo;
    x = farmhash_ror64(x + y + v.lo + farmhash_fetch64(s + 8), 37) * mul;
    y = farmhash_ror64(y + v.hi + farmhash_fetch64(s + 48), 42) * mul;
    x ^= w.hi * 9;
    y += v.lo * 9 + farmhash_fetch64(s + 40);
    z = farmhash_ror64(z + w.lo, 33) * mul;
    v = farmhash_weak_na_len_32_with_seeds(s, v.hi * mul, x + w.lo);
    w = farmhash_weak_na_len_32_with_seeds(s + 32, z + w.hi, y + farmhash_fetch64(s + 16));
    farmhash_swap64(&z, &x);
    return farmhash_len_16_mul(farmhash_len_16_mul(v.lo, w.lo, mul) + (farmhash_smix(y) * farmhash_k0) + z,
                               farmhash_len_16_mul(v.hi, w.hi, mul) + x,
                               mul);
}

/**
 * @brief Returns a 32-bit fingerprint hash for a byte array.
 *
 * NOTE: This is NOT equivalent to the original Fingerprint32 function.
 * It is derived from farmhash64.
 *
 * This function is not suitable for cryptography.
 *
 * The pointer is not dereferenced when len is 0.
 *
 * @param s   byte array to process
 * @param len number of bytes to process
 *
 * @return 32-bit hash code
 *
 * @public
 */
static inline uint32_t farmhash32(const char *s, size_t len)
{
    return farmhash_mix_64_to_32(farmhash64(s, len));
}

#ifdef __cplusplus
}
#endif

#endif  // FARMHASH64_H
