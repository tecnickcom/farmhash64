context("farmhash64")
library(farmhash64)

# test-farmhash64.R
# @category   Libraries
# @author     Nicola Asuni <info@tecnick.com>
# @link       https://github.com/tecnickcom/farmhash64

t <- rbind(
    list("fe0061e9", "9ae16a3b2f90404f", ""),
    list("d824662a", "b3454265b6df75e3", "a"),
    list("15eb5ed6", "aa8d6e5242ada51e", "ab"),
    list("caf25fe2", "24a5b3a074e7f369", "abc"),
    list("cf297808", "1a5502de4a1f8101", "abcd"),
    list("5f8d48db", "c22f4663e54e04d4", "abcde"),
    list("16b8a2fd", "c329379e6a03c2cd", "abcdef"),
    list("cfc5f43d", "3c40c92b1ccb7355", "abcdefg"),
    list("08d1b642", "fee9d22990c82909", "abcdefgh"),
    list("b382832e", "332c8ed4dae5ba42", "abcdefghi"),
    list("3f19a3cb", "ad052244b781c4eb", "0123456789"),
    list("0ee83c5c", "3ef4c03514208c77", "0123456789 "),
    list("6fca023f", "496841e83a33cc91", "0123456789-0"),
    list("6b2c02bd", "d81bcb9f3679ac0c", "0123456789~01"),
    list("0b8e8fba", "5da5a6a117c606f6", "0123456789#012"),
    list("e6946835", "5361eae17c1ff6bc", "0123456789@0123"),
    list("fa44df74", "4283d4ef43627f64", "0123456789'01234"),
    list("2a1ed264", "46a7416ed4861e3b", "0123456789=012345"),
    list("bcd3277f", "a4abb4e0da2c594c", "0123456789+0123456"),
    list("26bf5a67", "cf1c7d3ad54f9215", "0123456789*01234567"),
    list("8eedb634", "07adf50b2ac764fc", "0123456789&012345678"),
    list("a329652e", "debcba8e6f3eabd1", "0123456789^0123456789"),
    list("4ba9b4ed", "4dbd128af51d77e8", "0123456789%0123456789£"),
    list("1b9ea72f", "d78d5f852d522e6a", "0123456789$0123456789!0"),
    list("819d77a5", "80d73b843ba57db8", "size:  a.out:  bad magic"),
    list("8b72761e", "8eb3808d1ccfc779", "Nepal premier won't resign."),
    list("5f21fe43", "b944f8a16261e414", "C is as portable as Stonehedge!!"),
    list("a15ead04", "e8f89ab6df9bdd25", "Discard medicine more than two years old."),
    list("e3763baf", "a9961670ce2a46d9", "I wouldn't marry him with a ten foot pole."),
    list("50a48aaa", "bdd69b798d6ba37a", "If the enemy is within range, then so are you."),
    list("517e346c", "c2f8db8624fefc0e", "The major problem is with sendmail.  -Mark Horton"),
    list("8a4b0b6c", "5a0a6efd52e84e2a", "How can you write a big system without C++?  -Paul Glick"),
    list("b360937b", "786d7e1987023ca9", "He who has a shady past knows that nice guys finish last."),
    list("2e5713b3", "5d14f96c18fe3d5e", "Free! Free!/A trip/to Mars/for 900/empty jars/Burma Shave"),
    list("ec6d1e0e", "ec8848fd3b266c10", "His money is twice tainted: 'taint yours and 'taint mine."),
    list("7175f31d", "2a578b80bb82147c", "The days of the digital watch are numbered.  -Tom Stoppard"),
    list("df4c5297", "55182f8859eca4ce", "For every action there is an equal and opposite government program."),
    list("62359aca", "abcdb319fcf2826c", "You remind me of a TV show, but that's all right: I watch it anyway."),
    list("398c0b7c", "1d85702503ac7eb4", "It's well we cannot hear the screams/That we create in others' dreams."),
    list("00047f9c", "a2b8bf3032021993", "Give me a rock, paper and scissors and I will move the world.  CCFestoon"),
    list("e56239a7", "38aa3175b37f305c", "It's a tiny change to the code and not completely disgusting. - Bob Manchek"),
    list("b556f325", "7e85d7b050ed2967", "There is no reason for any individual to have a computer in their home. -Ken Olsen, 1977"),
    list("75cc5362", "5a05644eb66e435e", "Even if I could be Shakespeare, I think I should still choose to be Faraday. - A. Huxley"),
    list("c401a0bf", "098eff6958c5e91a", "The fugacity of a constituent in a mixture of gases at a given temperature is proportional to its mole fraction.  Lewis-Randall Rule"),
    list("4e56b7e9", "c3f02c4ffd5d71e6", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
)

colnames(t) <- list("fh32", "fh64", "str")

test_that("FarmHash64Hex", {
    res <- FarmHash64Hex(unlist(t[,"str"]))
    expect_identical(res, as.character(unlist(t[,"fh64"])))
})

test_that("FarmHash32Hex", {
    res <- FarmHash32Hex(unlist(t[,"str"]))
    expect_identical(res, as.character(unlist(t[,"fh32"])))
})
