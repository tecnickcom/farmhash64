/**
 * @file farmhash64.h
 * @brief File containing the definition of public functions.
 *
 * FarmHash is a family of hash functions.
 *
 * FarmHash64 is a 64-bit fingerprint hash function that produces a hash value for a given string.
 * It is designed to be fast and provide good hash distribution but is not suitable for cryptography applications.
 *
 * The FarmHash32 function is also provided, which returns a 32-bit fingerprint hash for a string.
 *
 * All members of the FarmHash family were designed with heavy reliance on previous work by Jyrki Alakuijala, Austin Appleby, Bob Jenkins, and others.
 * This is a C port of the Fingerprint64 (farmhashna::Hash64) code from Google's FarmHash (https://github.com/google/farmhash).
 *
 * This code has been ported/translated by Nicola Asuni (Tecnick.com) to header-only C code.
 */

#ifndef FARMHASH64_H
#define FARMHASH64_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>


// PORTABILITY LAYER: "static inline" or similar

#ifndef STATIC_INLINE
/**
 * @brief Macro definition for static inline functions.
 *
 * This macro is used to define functions as static inline, which allows the compiler
 * to optimize the function by inlining it at the call site. It is typically used for
 * small, frequently called functions to improve performance.
 *
 * @private
 */
#define STATIC_INLINE static inline
#endif

// PORTABILITY LAYER: endianness and byteswapping functions

#ifdef WORDS_BIGENDIAN
#undef FARMHASH_BIG_ENDIAN
/**
 * @brief Macro definition for indicating big endian architecture.
 *
 * This macro is used to indicate that the code is being compiled on a big endian architecture.
 * It is defined as 1 to represent big endian architecture.
 *
 * @private
 */
#define FARMHASH_BIG_ENDIAN 1
#endif

#if defined(FARMHASH_LITTLE_ENDIAN) && defined(FARMHASH_BIG_ENDIAN)
#error
#endif

#if !defined(FARMHASH_LITTLE_ENDIAN) && !defined(FARMHASH_BIG_ENDIAN)
/**
 * @brief Macro definition to indicate unknown endianness.
 *
 * This macro is used to indicate that the endianness of the system is unknown.
 * It is defined as 1.
 *
 * @private
 */
#define FARMHASH_UNKNOWN_ENDIAN 1
#endif

#if !defined(bswap_32) || !defined(bswap_64)
#undef bswap_32
#undef bswap_64

#if defined(HAVE_BUILTIN_BSWAP) || defined(__clang__) || \
(defined(__GNUC__) && ((__GNUC__ == 4 && __GNUC_MINOR__ >= 8) || __GNUC__ >= 5))
// Easy case for bswap: no header file needed.

/**
 * @brief Macro to swap the byte order of a 32-bit integer.
 *
 * This macro uses the __builtin_bswap32() function to swap the byte order of a 32-bit integer.
 * It is typically used for converting between little-endian and big-endian byte orders.
 *
 * @param x The 32-bit integer to swap the byte order of.
 *
 * @return The 32-bit integer with the byte order swapped.
 *
 * @private
 */
#define bswap_32(x) __builtin_bswap32(x)

/**
 * @brief Macro to swap the byte order of a 64-bit value.
 *
 * This macro uses the __builtin_bswap64() function to swap the byte order of the given 64-bit value.
 *
 * @param x The 64-bit value to swap the byte order of.
 *
 * @return The 64-bit value with the byte order swapped.
 *
 * @private
 */
#define bswap_64(x) __builtin_bswap64(x)
#endif

#endif

#if defined(FARMHASH_UNKNOWN_ENDIAN) || !defined(bswap_64)

#ifdef _MSC_VER

#undef bswap_32
#undef bswap_64

/**
 * @brief Macro to swap the byte order of a 32-bit integer.
 *
 * This macro uses the _byteswap_ulong function to swap the byte order of a 32-bit integer.
 *
 * @param x The 32-bit integer to swap the byte order of.
 *
 * @return The 32-bit integer with the byte order swapped.
 *
 * @private
 */
#define bswap_32(x) _byteswap_ulong(x)


/**
 * @brief Macro to swap the byte order of a 64-bit integer.
 *
 * This macro uses the _byteswap_uint64 function to swap the byte order of a 64-bit integer.
 *
 * @param x The 64-bit integer to swap the byte order of.
 *
 * @return The 64-bit integer with the byte order swapped.
 *
 * @private
 */
#define bswap_64(x) _byteswap_uint64(x)

#elif defined(__APPLE__)

// Mac OS X / Darwin features
#include <libkern/OSByteOrder.h>
#undef bswap_32
#undef bswap_64

/**
 * @brief Macro to swap the byte order of a 32-bit integer.
 *
 * This macro uses the OSSwapInt32 function to swap the byte order of a 32-bit integer.
 * It is typically used for converting between little-endian and big-endian byte order.
 *
 * @param x The 32-bit integer to swap the byte order of.
 *
 * @return The 32-bit integer with the byte order swapped.
 *
 * @private
 */
#define bswap_32(x) OSSwapInt32(x)

/**
 * @brief Macro to swap the byte order of a 64-bit value.
 *
 * This macro uses the OSSwapInt64 function to swap the byte order of a 64-bit value.
 * It is typically used for converting between little-endian and big-endian byte order.
 *
 * @param x The 64-bit value to swap the byte order of.
 *
 * @return The 64-bit value with the byte order swapped.
 *
 * @private
 */
#define bswap_64(x) OSSwapInt64(x)

#elif defined(__sun) || defined(sun)

#include <sys/byteorder.h>
#undef bswap_32
#undef bswap_64

/**
 * @brief Macro to swap the byte order of a 32-bit integer.
 *
 * This macro uses the BSWAP_32 macro to swap the byte order of a 32-bit integer.
 *
 * @param x The 32-bit integer to swap the byte order of.
 *
 * @return The 32-bit integer with the byte order swapped.
 *
 * @private
 */
#define bswap_32(x) BSWAP_32(x)

/**
 * @brief Macro to swap the byte order of a 64-bit value.
 *
 * This macro is used to swap the byte order of a 64-bit value.
 * It is defined as `BSWAP_64(x)`.
 *
 * @param x The 64-bit value to swap the byte order of.
 *
 * @return The 64-bit value with the byte order swapped.
 *
 * @private
 */
#define bswap_64(x) BSWAP_64(x)

#elif defined(__FreeBSD__)

#include <sys/endian.h>
#undef bswap_32
#undef bswap_64

/**
 * @brief Macro to swap the byte order of a 32-bit integer.
 *
 * This macro swaps the byte order of a 32-bit integer using the bswap32 function.
 *
 * @param x The 32-bit integer to swap the byte order of.
 *
 * @return The 32-bit integer with the byte order swapped.
 *
 * @private
 */
#define bswap_32(x) bswap32(x)

/**
 * @brief Macro to swap the byte order of a 64-bit value.
 *
 * This macro swaps the byte order of a 64-bit value using the bswap64 function.
 *
 * @param x The 64-bit value to swap the byte order of.
 *
 * @return The 64-bit value with the byte order swapped.
 *
 * @private
 */
#define bswap_64(x) bswap64(x)

#elif defined(__OpenBSD__)

#include <sys/types.h>
#undef bswap_32
#undef bswap_64

/**
 * @brief Macro definition to swap the byte order of a 32-bit integer.
 *
 * This macro is used to swap the byte order of a 32-bit integer.
 * It is defined as `swap32(x)`, where `x` is the input value.
 *
 * @param x The 32-bit integer to swap the byte order of.
 *
 * @return The 32-bit integer with the byte order swapped.
 *
 * @private
 */
#define bswap_32(x) swap32(x)

/**
 * @brief Macro to swap the byte order of a 64-bit value.
 *
 * This macro is used to swap the byte order of a 64-bit value. It is defined as `swap64(x)`.
 *
 * @param x The 64-bit value to swap the byte order of.
 *
 * @return The 64-bit value with the byte order swapped.
 *
 * @private
 */
#define bswap_64(x) swap64(x)

#elif defined(__NetBSD__)

#include <sys/types.h>
#include <machine/bswap.h>
#if defined(__BSWAP_RENAME) && !defined(__bswap_32)
#undef bswap_32
#undef bswap_64

/**
 * @brief Macro to swap the byte order of a 32-bit value.
 *
 * This macro swaps the byte order of a 32-bit value using the bswap32 function.
 *
 * @param x The 32-bit value to swap the byte order of.
 *
 * @return The 32-bit value with the byte order swapped.
 *
 * @private
 */
#define bswap_32(x) bswap32(x)

/**
 * @brief Macro to swap the byte order of a 64-bit value.
 *
 * This macro uses the bswap64 function to swap the byte order of the given 64-bit value.
 * It is defined as a shorthand for the bswap64 function.
 *
 * @param x The 64-bit value to swap the byte order of.
 *
 * @return The 64-bit value with the byte order swapped.
 *
 * @private
 */
#define bswap_64(x) bswap64(x)
#endif

#else

#undef bswap_32
#undef bswap_64
#include <byteswap.h>

#endif

#ifdef WORDS_BIGENDIAN

/**
 * @brief Macro definition indicating that the system is big-endian.
 *
 * This macro is defined as 1 to indicate that the system is big-endian.
 * Big-endian is a byte order in which the most significant byte is stored
 * at the lowest memory address. This macro is used in the FarmHash64 library
 * to handle endianness-specific operations.
 */
#define FARMHASH_BIG_ENDIAN 1
#endif

#endif

#ifdef FARMHASH_BIG_ENDIAN

/**
 * @brief Macro to convert a 32-bit unsigned integer to the expected byte order.
 *
 * This macro uses the bswap_32 function to convert the given 32-bit unsigned integer
 * to the expected byte order. It is used in the farmhash64 library for byte order conversion.
 *
 * @param x The 32-bit unsigned integer to convert.
 *
 * @return The converted 32-bit unsigned integer.
 *
 * @private
 */
#define uint32_t_in_expected_order(x) (bswap_32(x))

/**
 * @brief Macro to convert a 64-bit unsigned integer to the expected byte order.
 *
 * This macro uses the bswap_64 function to convert the given 64-bit unsigned integer
 * to the expected byte order. The bswap_64 function swaps the byte order of the input
 * value, ensuring that the result is in the expected byte order.
 *
 * @param x The 64-bit unsigned integer to convert.
 *
 * @return The converted 64-bit unsigned integer in the expected byte order.
 *
 * @private
 */
#define uint64_t_in_expected_order(x) (bswap_64(x))
#else

/**
 * Macro to convert a 32-bit unsigned integer to the expected order.
 *
 * @param x The 32-bit unsigned integer to convert.
 *
 * @return The converted 32-bit unsigned integer.
 *
 * @private
 */
#define uint32_t_in_expected_order(x) (x)

/**
 * Macro to convert a 64-bit unsigned integer to the expected order.
 *
 * @param x The 64-bit unsigned integer to be converted.
 *
 * @return The converted 64-bit unsigned integer.
 *
 * @private
 */
#define uint64_t_in_expected_order(x) (x)
#endif

/**
 * @brief Represents a 128-bit unsigned integer.
 *
 * The uint128_t struct is used to store a 128-bit integer, which consists of a lower 64 bits (lo) and a higher 64 bits (hi).
 * This struct is typically used for operations that require a larger range of values than what can be represented by a standard 64-bit integer.
 *
 * @private
 */
typedef struct uint128_t
{
    uint64_t lo; // Lower 64 bits of the 128-bit integer
    uint64_t hi; // Higher 64 bits of the 128-bit integer
} uint128_t;

// Some primes between 2^63 and 2^64 for various uses.
static const uint64_t k0 = 0xc3a5c85c97cb3127ULL;
static const uint64_t k1 = 0xb492b66fbe98f273ULL;
static const uint64_t k2 = 0x9ae16a3b2f90404fULL;

// Magic numbers for 32-bit hashing.  Copied from Murmur3.
static const uint32_t c1 = 0xcc9e2d51;
static const uint32_t c2 = 0x1b873593;

/**
 * @brief Create a uint128_t value from two 64-bit integers.
 *
 * @param lo Low 64 bits
 * @param hi High 64 bits
 *
 * @return uint128_t value
 *
 * @private
 */
STATIC_INLINE uint128_t make_uint128_t(uint64_t lo, uint64_t hi)
{
    uint128_t x = {lo, hi};
    return x;
}

/**
 * @brief Convert a uint128_t value to a 64-bit hash code.
 *
 * This function is intended to be a reasonably good hash function.
 * The result may change from time to time and may differ on different platforms.
 * The result may also differ depending on the NDEBUG macro.
 *
 * @param x uint128_t value
 *
 * @return 64-bit hash code
 *
 * @private
 */
STATIC_INLINE uint64_t farmhash128_to_64(uint128_t x)
{
    // Murmur-inspired hashing.
    const uint64_t k_mul = 0x9ddfea08eb382d69ULL;
    uint64_t a = (x.lo ^ x.hi) * k_mul;
    a ^= (a >> 47);
    uint64_t b = (x.hi ^ a) * k_mul;
    b ^= (b >> 47);
    b *= k_mul;
    return b;
}

/**
 * @brief Fetch a 64-bit little-endian integer from a byte array.
 *
 * @param p Pointer to the byte array
 *
 * @return The fetched 64-bit integer
 *
 * @private
 */
STATIC_INLINE uint64_t fetch64(const char* p)
{
    uint64_t result;
    memcpy(&result, p, sizeof(result));
    return uint64_t_in_expected_order(result);
}

/**
 * @brief Fetch a 32-bit little-endian integer from a byte array.
 *
 * @param p Pointer to the byte array
 *
 * @return The fetched 32-bit integer
 *
 * @private
 */
STATIC_INLINE uint64_t fetch32(const char* p)
{
    uint32_t result;
    memcpy(&result, p, sizeof(result));
    return uint64_t_in_expected_order(result);
}

/**
 * @brief Swap the values of two 64-bit integers.
 *
 * @param a Pointer to the first integer
 * @param b Pointer to the second integer
 *
 * @private
 */
STATIC_INLINE void swap64(uint64_t* a, uint64_t* b)
{
    uint64_t t;
    t = *a;
    *a = *b;
    *b = t;
}

/**
 * @brief Rotate a 32-bit integer right by a specified number of bits.
 *
 * @param val The value to rotate
 * @param shift The number of bits to rotate by
 *
 * @return The rotated value
 *
 * @private
 */
STATIC_INLINE uint32_t ror32(uint32_t val, size_t shift)
{
    return (val >> shift) | (val << (32 - shift));
}

/**
 * @brief Rotate a 64-bit integer right by a specified number of bits.
 *
 * @param val The value to rotate
 * @param shift The number of bits to rotate by
 *
 * @return The rotated value
 *
 * @private
 */
STATIC_INLINE uint64_t ror64(uint64_t val, size_t shift)
{
    return (val >> shift) | (val << (64 - shift));
}

/**
 * @brief Performs a bitwise XOR operation between a 64-bit value and its right-shifted value.
 *
 * This function takes a 64-bit value and performs a bitwise XOR operation between the value
 * and its right-shifted value by 47 bits. The result is returned.
 *
 * @param val The input 64-bit value.
 *
 * @return The result of the bitwise XOR operation between the input value and its right-shifted value.
 *
 * @private
 */
STATIC_INLINE uint64_t smix(uint64_t val)
{
    return val ^ (val >> 47);
}

/**
 * @brief Performs the MurmurHash3 algorithm on a 32-bit input value.
 *
 * This function applies the MurmurHash3 algorithm on a 32-bit input value using the provided
 * constants c1 and c2. It performs a series of bitwise operations and multiplications to
 * generate a hash value.
 *
 * @param a The input value to be hashed.
 * @param h The current hash value.
 *
 * @return The updated hash value after applying the MurmurHash3 algorithm.
 *
 * @private
 */
STATIC_INLINE uint32_t mur(uint32_t a, uint32_t h)
{
    a *= c1;
    a = ror32(a, 17);
    a *= c2;
    h ^= a;
    h = ror32(h, 19);
    return h * 5 + 0xe6546b64;
}

/**
 * @brief Static inline function that converts a 64-bit integer to a 32-bit integer using the MurmurHash algorithm.
 *
 * @param x The 64-bit integer to be converted.
 *
 * @return The converted 32-bit integer.
 *
 * @private
 */
STATIC_INLINE uint32_t mix_64_to_32(uint64_t x)
{
    return mur((uint32_t)(x >> 32), (uint32_t)((x << 32) >> 32));
}

/**
 * @brief Calculate a 64-bit hash code for a byte array of length 16.
 *
 * @param u First 64 bits of the byte array
 * @param v Last 64 bits of the byte array
 *
 * @return 64-bit hash code
 *
 * @private
 */
STATIC_INLINE uint64_t farmhash_len_16(uint64_t u, uint64_t v)
{
    return farmhash128_to_64(make_uint128_t(u, v));
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
STATIC_INLINE uint64_t farmhash_len_16_mul(uint64_t u, uint64_t v, uint64_t mul)
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
STATIC_INLINE uint64_t farmhash_na_len_0_to_16(const char *s, size_t len)
{
    if (len >= 8)
    {
        uint64_t mul = k2 + len * 2;
        uint64_t a = fetch64(s) + k2;
        uint64_t b = fetch64(s + len - 8);
        uint64_t c = ror64(b, 37) * mul + a;
        uint64_t d = (ror64(a, 25) + b) * mul;
        return farmhash_len_16_mul(c, d, mul);
    }
    if (len >= 4)
    {
        uint64_t mul = k2 + len * 2;
        uint64_t a = fetch32(s);
        return farmhash_len_16_mul(len + (a << 3), fetch32(s + len - 4), mul);
    }
    if (len > 0)
    {
        uint8_t a = s[0];
        uint8_t b = s[len >> 1];
        uint8_t c = s[len - 1];
        uint32_t y = (uint32_t) a + ((uint32_t) b << 8);
        uint32_t z = len + ((uint32_t) c << 2);
        return smix(y * k2 ^ z * k0) * k2;
    }
    return k2;
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
STATIC_INLINE uint64_t farmhash_na_len_17_to_32(const char *s, size_t len)
{
    uint64_t mul = k2 + len * 2;
    uint64_t a = fetch64(s) * k1;
    uint64_t b = fetch64(s + 8);
    uint64_t c = fetch64(s + len - 8) * mul;
    uint64_t d = fetch64(s + len - 16) * k2;
    return farmhash_len_16_mul(ror64(a + b, 43) + ror64(c, 30) + d, a + ror64(b + k2, 18) + c, mul);
}

/**
 * @brief Calculate a 16-byte (128-bit) weak hash code for a byte array of length 48, including seeds.
 *        Callers do best to use "random-looking" values for a and b.
 *
 * @param w First 64 bits of the byte array
 * @param x Second 64 bits of the byte array
 * @param y Third 64 bits of the byte array
 * @param z Fourth 64 bits of the byte array
 * @param a First seed value
 * @param b Second seed value
 *
 * @return 128-bit weak hash code
 *
 * @private
 */
STATIC_INLINE uint128_t weak_farmhash_na_len_32_with_seeds_vals(uint64_t w, uint64_t x, uint64_t y, uint64_t z, uint64_t a, uint64_t b)
{
    a += w;
    b = ror64(b + a + z, 21);
    uint64_t c = a;
    a += x;
    a += y;
    b += ror64(a, 44);
    return make_uint128_t(a + z, b + c);
}

/**
 * @brief Calculate a 16-byte (128-bit) weak hash code for a byte array of length 32, including seeds.
 *
 * @param s Pointer to the byte array
 * @param a First seed value
 * @param b Second seed value
 *
 * @return 128-bit weak hash code
 *
 * @private
 */
STATIC_INLINE uint128_t weak_farmhash_na_len_32_with_seeds(const char* s, uint64_t a, uint64_t b)
{
    return weak_farmhash_na_len_32_with_seeds_vals(fetch64(s),
            fetch64(s + 8),
            fetch64(s + 16),
            fetch64(s + 24),
            a,
            b);
}

/**
 * @brief Calculate a 8-byte (64-bit) hash code for a byte array of length 33 to 64.
 *
 * @param s Pointer to the byte array
 * @param len Length of the byte array
 *
 * @return 64-bit hash code
 *
 * @private
 */
STATIC_INLINE uint64_t farmhash_na_len_33_to_64(const char *s, size_t len)
{
    uint64_t mul = k2 + len * 2;
    uint64_t a = fetch64(s) * k2;
    uint64_t b = fetch64(s + 8);
    uint64_t c = fetch64(s + len - 8) * mul;
    uint64_t d = fetch64(s + len - 16) * k2;
    uint64_t y = ror64(a + b, 43) + ror64(c, 30) + d;
    uint64_t z = farmhash_len_16_mul(y, a + ror64(b + k2, 18) + c, mul);
    uint64_t e = fetch64(s + 16) * mul;
    uint64_t f = fetch64(s + 24);
    uint64_t g = (y + fetch64(s + len - 32)) * mul;
    uint64_t h = (z + fetch64(s + len - 24)) * mul;
    return farmhash_len_16_mul(ror64(e + f, 43) + ror64(g, 30) + h, e + ror64(f + a, 18) + g, mul);
}

// =================================================================================================
// PUBLIC FUNCTIONS
// =================================================================================================

/**
 * @brief 64 bit hash.
 *
 * Returns a 64-bit fingerprint hash for a byte array.
 *
 * This function is not suitable for cryptography.
 *
 * @param s   string to process
 * @param len string length
 *
 * @return 64-bit hash code
 *
 * @public
 */
STATIC_INLINE uint64_t farmhash64(const char *s, size_t len)
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
    uint64_t x = seed;
    uint64_t y = seed * k1 + 113;
    uint64_t z = smix(y * k2 + 113) * k2;
    uint128_t v = make_uint128_t(0, 0);
    uint128_t w = make_uint128_t(0, 0);
    x = x * k2 + fetch64(s);
    // Set end so that after the loop we have 1 to 64 bytes left to process.
    const char* end = s + ((len - 1) / 64) * 64;
    const char* last64 = end + ((len - 1) & 63) - 63;
    assert(s + len - 64 == last64);
    do
    {
        x = ror64(x + y + v.lo + fetch64(s + 8), 37) * k1;
        y = ror64(y + v.hi + fetch64(s + 48), 42) * k1;
        x ^= w.hi;
        y += v.lo + fetch64(s + 40);
        z = ror64(z + w.lo, 33) * k1;
        v = weak_farmhash_na_len_32_with_seeds(s, v.hi * k1, x + w.lo);
        w = weak_farmhash_na_len_32_with_seeds(s + 32, z + w.hi, y + fetch64(s + 16));
        swap64(&z, &x);
        s += 64;
    }
    while (s != end);
    uint64_t mul = k1 + ((z & 0xff) << 1);
    // Make s point to the last 64 bytes of input.
    s = last64;
    w.lo += ((len - 1) & 63);
    v.lo += w.lo;
    w.lo += v.lo;
    x = ror64(x + y + v.lo + fetch64(s + 8), 37) * mul;
    y = ror64(y + v.hi + fetch64(s + 48), 42) * mul;
    x ^= w.hi * 9;
    y += v.lo * 9 + fetch64(s + 40);
    z = ror64(z + w.lo, 33) * mul;
    v = weak_farmhash_na_len_32_with_seeds(s, v.hi * mul, x + w.lo);
    w = weak_farmhash_na_len_32_with_seeds(s + 32, z + w.hi, y + fetch64(s + 16));
    swap64(&z, &x);
    return farmhash_len_16_mul(farmhash_len_16_mul(v.lo, w.lo, mul) + smix(y) * k0 + z,
                               farmhash_len_16_mul(v.hi, w.hi, mul) + x,
                               mul);
}

/**
 * @brief 32 bit hash.
 *
 * Returns a 32-bit fingerprint hash for a byte array.
 *
 * NOTE: This is NOT equivalent to the original Fingerprint32 function.
 * It is a new function based on farmhash64.
 *
 * This function is not suitable for cryptography.
 *
 * @param s   string to process
 * @param len string length
 *
 * @return 32-bit hash code
 *
 * @public
 */
STATIC_INLINE uint32_t farmhash32(const char *s, size_t len)
{
    return mix_64_to_32(farmhash64(s, len));
}

#ifdef __cplusplus
}
#endif

#endif  // FARMHASH64_H