package com.tecnick.farmhash64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.Arrays;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

public class FarmHash64Test {

    private static final int testSize = 300;
    private static final int dataSize = 1048576; // 1 << 20

    private static Stream<Arguments> hashTestData_Parameters() throws Throwable {
        // Parameters: int oh32=(0), long oh64=(1), String in=(2)
        return Stream.of(
            Arguments.of(0xfe0061e9, 0x9ae16a3b2f90404fL, ""),
            Arguments.of(0xd824662a, 0xb3454265b6df75e3L, "a"),
            Arguments.of(0x15eb5ed6, 0xaa8d6e5242ada51eL, "ab"),
            Arguments.of(0xcaf25fe2, 0x24a5b3a074e7f369L, "abc"),
            Arguments.of(0xcf297808, 0x1a5502de4a1f8101L, "abcd"),
            Arguments.of(0x5f8d48db, 0xc22f4663e54e04d4L, "abcde"),
            Arguments.of(0x16b8a2fd, 0xc329379e6a03c2cdL, "abcdef"),
            Arguments.of(0xcfc5f43d, 0x3c40c92b1ccb7355L, "abcdefg"),
            Arguments.of(0x08d1b642, 0xfee9d22990c82909L, "abcdefgh"),
            Arguments.of(0xb382832e, 0x332c8ed4dae5ba42L, "abcdefghi"),
            Arguments.of(0x3f19a3cb, 0xad052244b781c4ebL, "0123456789"),
            Arguments.of(0x0ee83c5c, 0x3ef4c03514208c77L, "0123456789 "),
            Arguments.of(0x6fca023f, 0x496841e83a33cc91L, "0123456789-0"),
            Arguments.of(0x6b2c02bd, 0xd81bcb9f3679ac0cL, "0123456789~01"),
            Arguments.of(0x0b8e8fba, 0x5da5a6a117c606f6L, "0123456789#012"),
            Arguments.of(0xe6946835, 0x5361eae17c1ff6bcL, "0123456789@0123"),
            Arguments.of(0xfa44df74, 0x4283d4ef43627f64L, "0123456789'01234"),
            Arguments.of(0x2a1ed264, 0x46a7416ed4861e3bL, "0123456789=012345"),
            Arguments.of(0xbcd3277f, 0xa4abb4e0da2c594cL, "0123456789+0123456"),
            Arguments.of(0x26bf5a67, 0xcf1c7d3ad54f9215L, "0123456789*01234567"),
            Arguments.of(0x8eedb634, 0x07adf50b2ac764fcL, "0123456789&012345678"),
            Arguments.of(0xa329652e, 0xdebcba8e6f3eabd1L, "0123456789^0123456789"),
            Arguments.of(0x4ba9b4ed, 0x4dbd128af51d77e8L, "0123456789%0123456789£"),
            Arguments.of(0x1b9ea72f, 0xd78d5f852d522e6aL, "0123456789$0123456789!0"),
            Arguments.of(0x819d77a5, 0x80d73b843ba57db8L, "size:  a.out:  bad magic"),
            Arguments.of(0x8b72761e, 0x8eb3808d1ccfc779L, "Nepal premier won't resign."),
            Arguments.of(0x5f21fe43, 0xb944f8a16261e414L, "C is as portable as Stonehedge!!"),
            Arguments.of(0xa15ead04, 0xe8f89ab6df9bdd25L, "Discard medicine more than two years old."),
            Arguments.of(0xe3763baf, 0xa9961670ce2a46d9L, "I wouldn't marry him with a ten foot pole."),
            Arguments.of(0x50a48aaa, 0xbdd69b798d6ba37aL, "If the enemy is within range, then so are you."),
            Arguments.of(0x517e346c, 0xc2f8db8624fefc0eL, "The major problem is with sendmail.  -Mark Horton"),
            Arguments.of(0x8a4b0b6c, 0x5a0a6efd52e84e2aL, "How can you write a big system without C++?  -Paul Glick"),
            Arguments.of(0xb360937b, 0x786d7e1987023ca9L, "He who has a shady past knows that nice guys finish last."),
            Arguments.of(0x2e5713b3, 0x5d14f96c18fe3d5eL, "Free! Free!/A trip/to Mars/for 900/empty jars/Burma Shave"),
            Arguments.of(0xec6d1e0e, 0xec8848fd3b266c10L, "His money is twice tainted: 'taint yours and 'taint mine."),
            Arguments.of(0x7175f31d, 0x2a578b80bb82147cL, "The days of the digital watch are numbered.  -Tom Stoppard"),
            Arguments.of(0xdf4c5297, 0x55182f8859eca4ceL, "For every action there is an equal and opposite government program."),
            Arguments.of(0x62359aca, 0xabcdb319fcf2826cL, "You remind me of a TV show, but that's all right: I watch it anyway."),
            Arguments.of(0x398c0b7c, 0x1d85702503ac7eb4L, "It's well we cannot hear the screams/That we create in others' dreams."),
            Arguments.of(0x00047f9c, 0xa2b8bf3032021993L, "Give me a rock, paper and scissors and I will move the world.  CCFestoon"),
            Arguments.of(0xe56239a7, 0x38aa3175b37f305cL, "It's a tiny change to the code and not completely disgusting. - Bob Manchek"),
            Arguments.of(0xb556f325, 0x7e85d7b050ed2967L, "There is no reason for any individual to have a computer in their home. -Ken Olsen, 1977"),
            Arguments.of(0x75cc5362, 0x5a05644eb66e435eL, "Even if I could be Shakespeare, I think I should still choose to be Faraday. - A. Huxley"),
            Arguments.of(0xc401a0bf, 0x098eff6958c5e91aL, "The fugacity of a constituent in a mixture of gases at a given temperature is proportional to its mole fraction.  Lewis-Randall Rule"),
            Arguments.of(0x4e56b7e9, 0xc3f02c4ffd5d71e6L, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
        );
    }

    private static long[] expectedFarmHash64() {
        return new long[] {
                2598464059L, 797982799L, 1410420968L, 2134990486L, 255297188L, 2992121793L, 4019337850L, 452431531L,
                299850021L, 2532580744L, 2199864459L, 3696623795L, 1053458494L, 1882212500L, 458884671L, 3033004529L,
                2700149065L, 2699376854L, 4220361840L, 1712034059L, 594028478L, 2921867846L, 3280331829L, 326029180L,
                3824583307L, 1612122221L, 2233466664L, 1432476832L, 1628777059L, 1499109081L, 1145519619L, 3190844552L,
                65721842L, 489963606L, 1790705123L, 2128624475L, 155445229L, 1672724608L, 3610042449L, 1911523866L,
                1099072299L, 1389770549L, 3603803785L, 629449419L, 1552847036L, 645684964L, 3151491850L, 3272648435L,
                916494250L, 1230085527L, 231181488L, 851743255L, 1142264800L, 3667013118L, 732137533L, 1909203251L,
                4072067757L, 4165088768L, 956300927L, 914413116L, 3074915312L, 3117299654L, 1438494951L, 507436733L,
                126024219L, 146044391L, 165589978L, 1578546616L, 249776086L, 1207522198L, 46987739L, 1157614300L,
                3614377032L, 586863115L, 1164298657L, 4140791139L, 3725511003L, 232064808L, 512845449L, 3748861010L,
                22638523L, 648000590L, 1024246061L, 4027776454L, 411505255L, 1973395102L, 3474970689L, 1029055034L,
                589567754L, 325737734L, 257578986L, 3698087965L, 2305332220L, 191910725L, 3315355162L, 2135941665L,
                23075771L, 3252374102L, 663013031L, 3444053918L, 2115441882L, 4081398201L, 1379288194L, 4225182569L,
                3667516477L, 1709989541L, 2725013602L, 3639843023L, 2470483982L, 877580602L, 3981838403L, 3762572073L,
                1129162571L, 732225574L, 3232041815L, 1652884780L, 2227121257L, 1426140634L, 1386256573L, 24035717L,
                1598686658L, 3146815575L, 739944537L, 579625482L, 3903349120L, 389846205L, 2834153464L, 1481069623L,
                3740748788L, 3388062747L, 1020177209L, 734239551L, 2610427744L, 49703572L, 1416453607L, 2815915291L,
                937074653L, 3035635454L, 3711259084L, 2627383582L, 3669691805L, 263366740L, 3565059103L, 1190977418L,
                2747519432L, 4129538640L, 2271095827L, 2993032712L, 795918276L, 1116991810L, 937372240L, 1343017609L,
                1166522068L, 1623631848L, 2721658101L, 1937681565L, 114616703L, 954762543L, 1756889687L, 2936126607L,
                2483004780L, 1927385370L, 1672737098L, 2148675559L, 2636210123L, 1338083267L, 1335160250L, 2084630531L,
                2746885618L, 636616055L, 2076016059L, 408721884L, 2301682622L, 2691859523L, 2614088922L, 1975527044L,
                3529473373L, 1490330107L, 4271796078L, 1910401882L, 3738454258L, 2554452696L, 2237827073L, 2803250686L,
                1996680960L, 839529273L, 3544595875L, 3909443124L, 3656063205L, 837475154L, 438095290L, 484603494L,
                308425103L, 268427550L, 4243643405L, 2849988118L, 2948254999L, 2102063419L, 1735616066L, 1539151988L,
                95237878L, 2005032160L, 1433635018L, 116647396L, 881378302L, 2159170082L, 336034862L, 2017579106L,
                944743644L, 1694443528L, 260177668L, 505662155L, 3722741628L, 1511077569L, 1103819072L, 2089123665L,
                2475035432L, 1120017626L, 2842141483L, 4029205195L, 3873078673L, 136118734L, 1699452298L, 1403506686L,
                1805475756L, 2562064338L, 4271866024L, 3071338162L, 459509140L, 771592405L, 185232757L, 4032960199L,
                3512945009L, 308584855L, 4250142168L, 2565680167L, 38924274L, 3770488806L, 3099963860L, 1255084262L,
                2363435042L, 54945052L, 2534883189L, 2432427547L, 2741583197L, 1280920000L, 1281043691L, 1121403845L,
                2127558730L, 713121337L, 2108187161L, 927011680L, 4134691985L, 1958963937L, 2567532373L, 4075249328L,
                4104757832L, 3026358429L, 3573008472L, 3615577014L, 1541946015L, 3087190425L, 857839960L, 2515339233L,
                2809830736L, 460237542L, 1950698961L, 2069753399L, 1106466069L, 356742959L, 3662626864L, 1750561299L,
                992181339L, 3384018814L, 100741310L, 451656820L, 3650357479L, 2390172694L, 2088767754L, 164402616L,
                2751052984L, 1767810825L, 3441135892L, 3323383489L, 2756998822L, 207428029L, 2648427775L, 2360400900L,
                1396468647L, 1377764574L, 1435134775L, 1099809675L, 3374512975L, 3542220540L, 4081637863L, 337070226L,
                644850146L, 1306761320L, 1242645122L, 4109252858L, 3377483696L, 1788337208L, 1658628529L, 2911512007L,
                367022558L, 3071359622L, 4273132307L, 3898950547L, 1858986613L, 2040551642L, 4077477194L, 3565689036L,
                265993036L, 1864569342L, 923017956L, 490608221L, 3833372385L, 3287246572L, 2649450292L, 500120236L,
                2810524030L, 1561519055L, 3224066062L, 2774151984L, 2107011431L, 96459446L, 1235983679L, 4237425634L,
                276949224L, 4100839753L, 427484362L, 4246879223L, 1858777639L, 3476334357L, 358032121L, 2511026735L,
                1535473864L, 556796152L, 1476438092L, 2913077464L, 3051522276L, 4046477658L, 1802040304L, 990407433L,
                4052924496L, 2926590471L, 4265214507L, 82077489L, 464407878L, 4190838199L, 733509243L, 1583801700L,
                1877837196L, 3912423882L, 8759461L, 2540185277L, 2019419351L, 4051584612L, 700836153L, 1675560450L,
                3130433948L, 405251683L, 2224044848L, 4071581802L, 2272418128L, 803575837L, 4019147902L, 3841480082L,
                3424361375L, 779434428L, 3057021940L, 2285701422L, 1783152480L, 823305654L, 3032187389L, 4159715581L,
                3420960112L, 3198900547L, 3006227299L, 4194096960L, 1775955687L, 1719108984L, 684087286L, 531310503L,
                3105682208L, 3382290593L, 777173623L, 3241407531L, 2649684057L, 1397502982L, 3193669211L, 811750340L,
                3403136990L, 2540585554L, 784952939L, 943914610L, 3985088434L, 1911188923L, 519948041L, 3181425568L,
                1089679033L, 240953857L, 3017658263L, 3828377737L, 308018483L, 4262383425L, 3188015819L, 4051263539L,
                4074952232L, 1683612329L, 206775997L, 2283918569L, 2217060665L, 350160869L, 140980L, 1891558063L,
                422986366L, 330624974L, 918718096L, 376390582L, 3424344721L, 3187805406L, 3855037968L, 1928519266L,
                3059200728L, 2108753646L, 1343511943L, 2247006571L, 622521957L, 917121602L, 3299763344L, 2864033668L,
                2661022773L, 2006922227L, 1237256330L, 3449066284L, 3285899651L, 786322314L, 1244759631L, 3263135197L,
                987586766L, 3206261120L, 1827135136L, 1781944746L, 2482286699L, 1109175923L, 4190721328L, 1129462471L,
                1623777358L, 3389003793L, 1646071378L, 1164309901L, 989577914L, 3626554867L, 1516846461L, 3656006011L,
                3698796465L, 3155218919L, 1237411891L, 1854985978L, 3939149151L, 878608872L, 2437686324L, 3163786257L,
                1235300371L, 1256485167L, 1883344352L, 2083771672L, 3066325351L, 2770847216L, 601221482L, 3992583643L,
                2557027816L, 900741486L, 90375300L, 300318232L, 3253901179L, 542270815L, 1273768482L, 1216399252L,
                325675502L, 3652676161L, 1097584090L, 3262252593L, 3704419305L, 411263051L, 3460621305L, 1967599860L,
                901109753L, 2682611693L, 797089608L, 3286110054L, 2219863904L, 3623364733L, 3061255808L, 1615375832L,
                2701956286L, 4145497671L, 449740816L, 2686506989L, 1235084019L, 2151665147L, 2091754612L, 1178454681L,
                3213794286L, 2601416506L, 4004834921L, 238887261L, 186020771L, 2367569534L, 1962659444L, 3539886328L,
                2144472852L, 1390394371L, 3597555910L, 3188438773L, 3371014971L, 2058751609L, 1169588594L, 857915866L,
                923161569L, 4068653043L, 3808667664L, 581227317L, 2077539039L, 851579036L, 2794103714L, 2094375930L,
                3122317317L, 2365436865L, 2023960931L, 2312244996L, 612094988L, 1555465129L, 3306195841L, 1702313921L,
                1171351291L, 2043136409L, 3744621107L, 1028502697L, 6114625L, 3359104346L, 1024572712L, 1927582962L,
                3392622118L, 1347167673L, 2075035198L, 4202817168L, 701024148L, 1481965992L, 1334816273L, 2870251538L,
                1010064531L, 713520765L, 4089081247L, 3231042924L, 2452539325L, 1343734533L, 587001593L, 1917607088L,
                3498936874L, 246692543L, 2836854664L, 2317249321L, 774652981L, 1285694082L, 397012087L, 1717527689L,
                2904461070L, 3893453420L, 1565179401L, 600903026L, 1134342772L, 3234226304L, 345572299L, 2274770442L,
                1079209397L, 2122849632L, 1242840526L, 3987000643L, 3065138774L, 3111336863L, 1023721001L, 3763083325L,
                2196937373L, 2643841788L, 4201389782L, 4223278891L, 292733931L, 1424229089L, 2927147928L, 1048291071L,
                2490333812L, 4098360768L, 3948800722L, 335456628L, 540133451L, 3313113759L, 3430536378L, 2514123129L,
                2418881542L, 487365389L, 1136054817L, 3004241477L, 4109233936L, 3679809321L, 3527024461L, 1147434678L,
                3308746763L, 1875093248L, 4217929592L, 400784472L, 160353261L, 2413172925L, 1853298225L, 3201741245L,
                3680311316L, 4274382900L, 1131020455L, 194781179L, 3440090658L, 2165746386L, 3106421434L, 880320527L,
                1429837716L, 252230074L, 3623657004L, 3869801679L, 2507199021L, 1659221866L, 3121647246L, 3884308578L,
                2610217849L, 641564641L, 329123979L, 121860586L, 947795261L, 1992594155L, 3050771207L, 2767035539L,
                627269409L, 1806905031L, 584050483L, 4142579188L, 3259749808L, 644172091L, 3053081915L, 2840648309L,
                2244943480L, 4057483496L, 873421687L, 2447660175L, 1233635843L, 2163464207L, 2515400215L, 3100476924L,
                470325051L, 2598261204L, 850667549L, 3622479237L, 2781907007L, 943739431L, 1901484772L, 939810041L,
                3261383939L, 2212130277L, 3349254805L, 2796552902L, 3372846298L, 3835884044L, 2764936304L, 1338171648L,
                2525665319L, 4196233786L, 2290169528L, 1793910997L, 1554419340L, 1733094688L, 1084699349L, 3233936866L,
                1428704144L, 3269904970L, 3347011944L, 1892898231L, 1072588531L, 3547435717L, 1593338562L, 919414554L,
                3953006207L, 877438080L, 224271045L, 2914958001L, 2920583824L, 1251814062L, 385182008L, 640855184L,
                4263183176L, 3041193150L, 3505072908L, 2830570613L, 1949847968L, 2999344380L, 1714496583L, 15918244L,
                2605688266L, 3253705097L, 4152736859L, 2097020806L, 2122199776L, 1069285218L, 670591796L, 768977505L,
                379861934L, 1557579480L, 547346027L, 388559045L, 1495176194L, 4093461535L, 1911655402L, 1053371241L,
                3717104621L, 1144474110L, 4166253320L, 2747410691L,
        };
    }
 
    @ParameterizedTest
    @MethodSource("hashTestData_Parameters")
    public void farmhash64String(int oh32, long oh64, String in) throws Throwable {
        long h = FarmHash64.farmhash64(in.getBytes());
        assertEquals(oh64, h);
    }
 
    @ParameterizedTest
    @MethodSource("hashTestData_Parameters")
    public void farmhash32String(int oh32, long oh64, String in) throws Throwable {
        int h = FarmHash64.farmhash32(in.getBytes());
        assertEquals(oh32, h);
    }

    private byte[] dataSetup() {
        final long kt = 0xc3a5c85c97cb3127L;

        byte[] data = new byte[dataSize];

        long a = 9;
        long b = 777;
        byte u;

        for (int i = 0; i < dataSize; i++) {
            a += b;
            b += a;
            a = (a ^ (a >>> 41)) * kt;
            b = (b ^ (b >>> 41)) * kt + (long) i;
            u = (byte) (b >>> 37);
            data[i] = u;
        }

        return data;
    }

    private void testDataItemFarmHash64(byte[] data, int offset, int hlen, int index) {
        byte[] s = Arrays.copyOfRange(data, offset, offset + hlen);
        long h = FarmHash64.farmhash64(s);
        int a = (int) (h >>> 32);

        long[] exp = expectedFarmHash64();

        assertEquals((int) exp[index], a, " | index: " + index + " | hlen:" + hlen + " | h: " + h);

        a = (int) (h & 0xFFFFFFFFL);

        assertEquals((int) exp[index + 1], a, "index: " + (index + 1) + " | hlen:" + hlen + " | h: " + h);
    }

    @Test
    public void testFarmHash64() {
        byte[] data = dataSetup();

        int index = 0;
        int i = 0;

        for (; i < testSize - 1; i++) {
            testDataItemFarmHash64(data, i * i, i, index);
            index += 2;
        }

        for (; i < dataSize; i += i / 7) {
            testDataItemFarmHash64(data, 0, i, index);
            index += 2;
        }

        testDataItemFarmHash64(data, 0, dataSize, index);
    }
}