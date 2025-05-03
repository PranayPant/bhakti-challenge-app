
const cmdLineArgs = process.argv.slice(2);
const romanScheme = cmdLineArgs[0] || "iso"; // Default to "iso" if not provided

// const Sanscript = require("sanscript");
const Sanscript = require("@indic-transliteration/sanscript");

const preferred_alternates = {
  iso: {
    a़: "", // a followed by \u093c (nukta) is used to represent the diacritic in the ISO scheme
  },
  itrans: {
    a़: "",
    A: "aa",
    I: "ee",
    U: "uu",
    "j~n": "gya",
  },
  hk: {
    a़: "",
    "~": "n",
    A: "aa",
    I: "ee",
    U: "uu",
    R: "ri",
    RR: "ree",
    lR: "lri",
    lRR: "lree",
    M: "m",
    Ga: "ng",
    Ja: "nya",
    T: "tt",
    D: "d",
    N: "n",
    L: "l",
    kSa: "ksha",
    jJa: "gya",
    ca: "cha",
    cha: "chha",
    z: "sh",
    S: "sh",
  },
};

function transliterate(rawText) {
  const output = Sanscript.t(rawText, "devanagari", romanScheme, {
    preferred_alternates,
  });

  return output;
}

module.exports = transliterate;
