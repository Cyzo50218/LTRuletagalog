const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const grammarPath = path.join(__dirname, 'config', 'grammar.json');
const loadGrammarJson = () => {
  try {
    const jsonData = fs.readFileSync(grammarPath, 'utf8');
    const result = JSON.parse(jsonData);
    console.log('Parsed JSON:', result); // Debugging log
    return result.rules || [];
  } catch (error) {
    console.error('Error reading or parsing grammar.json:', error);
    return [];
  }
};

let grammarRules;

if(grammarRules === null) {
  console.log('No rules loaded from file, using hardcoded test rule');
  grammarRules = [{
      "id": "ESPANYOL1",
      "name": "1. Hiram Mula sa Español",
      "pattern": [
        { "token": { "value": "familia" } }
      ],
      "message": "Hiram na salita mula sa Español, sa tagalog ay 'pamilya'",
      "description": "Ito ay sa pagbaybay ng mga salitang mula sa Español, baybayin ito ayon sa ABAKADA.",
      "suggestions": ["pamilya"]
    },
     {
    "id": "ESPANYOL2",
    "name": "2. Hiram Mula sa Español",
    "pattern": [
      { "token": { "value": "baño" } }
      ],
    "message": "Hiram na salita mula sa Español, sa tagalog ay 'banyo'",
    "description": "Ito ay sa pagbaybay ng mga salitang mula sa Español, baybayin ito ayon sa ABAKADA.",
    "suggestions": ["banyo"]
  },
     {
    "id": "ESPANYOL3",
    "name": "1. Hiram Mula sa Español",
    "pattern": [
      { "token": { "value": "cheque" } }
      ],
    "message": "Hiram na salita mula sa Español, sa tagalog ay 'tseke'",
    "description": "Ito ay sa pagbaybay ng mga salitang mula sa Español, baybayin ito ayon sa ABAKADA.",
    "suggestions": ["tseke"]
  },
  {
    "id": "ESPANYOL4",
    "name": "1. Hiram Mula sa Español",
    "pattern": [
      { "token": { "value": "maquina" } }
      ],
    "message": "Hiram na salita mula sa Español, sa tagalog ay 'maquina'",
    "description": "Ito ay sa pagbaybay ng mga salitang mula sa Español, baybayin ito ayon sa ABAKADA.",
    "suggestions": ["makina"]
  },
  //pag-uulit ng salitang-ugat na nagtatapos sa patinig na “e” hindi ito pinapalitan ng letrang “i”,Kinakabitan ng pang-ugnay/linker (-ng) at ginagamitan ng gitling sa pagitan ng salitang-ugat.
{
  "id": "PAGUULIT",
  "name": "1. Pag-uulit ng salitang ugat",
  "pattern": [
    {
      "regex": "\\b(\\w*e)\\s*\\1\\b"
    }
  ],
  "message": "Paguulit ng salitang-ugat na nagtatapos sa patinig na 'e'",
  "description": "Ito ay ang pag-uulit ng salitang-ugat na nagtatapos sa patinig na “e” hindi ito pinapalitan ng letrang “i”, Kinakabitan ng pang-ugnay/linker (-ng) at ginagamitan ng gitling sa pagitan ng salitang-ugat.",
  "suggestions": [
    { "text": "$1-ng $1" },
    { "text": "$1-$1" }
  ]
},
{
  "id": "PAGUULIT2",
  "name": "2. Pag-uulit ng salitang ugat na nagtatapos sa patinig na 'o'",
  "pattern": [
    {
      "regex": "\\b(\\w*o)\\s*\\1\\b"
    }
  ],
  "message": "Paguulit ng salitang-ugat na nagtatapos sa patinig na 'o'",
  "description": "Sa pag-uulit ng salitang-ugat na nagtatapos sa patinig na “o” hindi ito pinapalitan ng letrang “u”. Ginagamitan ng gitling sa pagitan ng salitang-ugat.",
  "suggestions": [
    { "text": "$1-$1" }
  ]
},
{
  "id": "PAGHULAPIAN_COMBINED",
  "name": "4. Pagbabago ng huling pantig ng salitang-ugat",
  "pattern": [
    {
      "regex": "\\b(\\w*e)\\b"
    },
    {
      "regex": "\\b(\\w*o)\\b"
    }
  ],
  "message": "Kapag hinuhulapian ang huling pantig ng salitang-ugat na nagtatapos sa 'e' o 'o', dapat itong i-apply ang tamang hulapi. Gayundin, may mga salitang nagtatapos sa 'e' na nananatili ang 'e' kahit hinuhulapian.",
  "description": "Kapag ang salitang-ugat na nagtatapos sa 'e', ang huling pantig ay nagiging 'i' at ang hulapi ay '-ihan'. Kapag nagtatapos sa 'o', ang huling pantig ay nagiging 'u' at ang hulapi ay '-an'. May mga salitang nananatili ang 'e' kahit hinuhulapian. Gayunman, hindi puwedeng palitan ng 'i' ang 'e' at 'o' sa 'u'. Dapat pa ring gamitin ang baybay na matagal na o lagi nang ginagamit.",
  "suggestions": [
    {
      "text": "$1ihan",
      "condition": "endsWith('e')",
      "exceptions": ["babae", "tao", "telebisyon", "komersyo", "kompyuter", "kape", "puno", "taho", "pili", "sine", "bote", "onse", "base"]
    },
    {
      "text": "$1an",
      "condition": "endsWith('he')",
      "exceptions": ["bote", "base"]
    },
    {
      "text": "$1han",
      "condition": "matches(['sine', 'bote', 'onse', 'base', 'sarili', 'kompyuter'])"
    },
    {
      "text": "$1u-an",
      "condition": "endsWith('o')",
      "exceptions": ["buhos", "sampu", "tao", "telepono", "nilo", "kilo", "litro", "metro", "reto"]
    },
    {
      "text": "balutin",
      "condition": "equals('balot')"
    }
  ]
},
{
  "id": "PAGTUNOG_E_O",
  "name": "6. Pagbabago ng tunog na 'e' at 'o' sa mga hiram na salita",
  "pattern": [
    {
      "regex": "\\b(mesa|uso|tela|selo|bote|babay|sabi|sino|bango|sisi|binti|tanggap|pinta|mango)\\b"
    }
  ],
  "message": "Makabuluhan ang tunog na 'e' at 'o' kapag inihahambing ang mga hiram na salita sa mga katutubo o hiram na salita.",
  "description": "Ang tunog na 'e' at 'o' sa mga hiram na salita ay maaaring ihalin sa katutubong Tagalog na tunog.",
  "suggestions": [
    {
      "text": "misa",
      "condition": "matches('mesa')"
    },
    {
      "text": "oso",
      "condition": "matches('uso')"
    },
    {
      "text": "tila",
      "condition": "matches('tela')"
    },
    {
      "text": "babae",
      "condition": "matches('babay')"
    },
    {
      "text": "sabihin",
      "condition": "matches('sabi')"
    },
    {
      "text": "sinu",
      "condition": "matches('sino')"
    },
    {
      "text": "bangong",
      "condition": "matches('bango')"
    },
    {
      "text": "sising",
      "condition": "matches('sisi')"
    },
    {
      "text": "mangga",
      "condition": "matches('mango')"
    }
  ]
},{
  "id": "TAGALOG_RULES_COMBINED",
  "name": "Tagalog Grammar and Spelling Rules",
  "rules": [
    {
      "id": "A",
      "name": "Proper Nouns and Borrowed Words with Affixes",
      "description": "Add hyphens to proper nouns and borrowed words when affixed. Repeat the first consonant and vowel (KP) for contemplative aspect.",
      "patterns": [
        {
          "regex": "\\b(maka-\\w+|pa\\w+)\\b",
          "message": "Consider using a hyphen or proper affix."
        }
      ],
      "suggestions": [
        {
          "text": "maka-$1",
          "condition": "startsWith('maka-')"
        },
        {
          "text": "pa-$1",
          "condition": "startsWith('pa') && isProperNounOrBorrowedWord()"
        }
      ]
    },
    {
      "id": "B",
      "name": "Attach First KP Sound in Prefixes",
      "description": "Attach the sound of the first KP (consonant-vowel) to the prefix for borrowed words.",
      "patterns": [
        {
          "regex": "\\b(mag\\w+)\\b",
          "message": "Ensure proper prefix attachment."
        }
      ],
      "suggestions": [
        {
          "text": "mag$1-$2",
          "condition": "startsWith('mag')"
        }
      ]
    },
    {
      "id": "C",
      "name": "Repeating Words with Clusters",
      "description": "Two methods for repeating words with clusters: repeat the first KP of the root word or repeat the sound of the first KP.",
      "patterns": [
        {
          "regex": "\\b(\\w+)-\\1\\b",
          "message": "Consider using proper repetition format."
        }
      ],
      "suggestions": [
        {
          "text": "mag$1-$2-hin",
          "condition": "containsCluster()"
        },
        {
          "text": "mag$1-$2",
          "condition": "containsCluster()"
        }
      ]
    },
    {
      "id": "D",
      "name": "Plural Forms and Specific Cases",
      "description": "Use 'mga' for plural forms of words, except for specific cases and borrowed words.",
      "patterns": [
        {
          "regex": "\\b(mga?\\s+\\w+)\\b",
          "message": "Verify plural form usage."
        }
      ],
      "suggestions": [
        {
          "text": "mga $1",
          "condition": "isPlural()"
        },
        {
          "text": "$1",
          "condition": "isPlural() && notBorrowedWord()"
        },
        {
          "text": "$1",
          "condition": "isSpecificPlural()"
        },
        {
          "text": "pang-$1",
          "condition": "isAdjectiveForm()"
        }
      ]
    },
    {
      "id": "E",
      "name": "Words with Digraphs",
      "description": "Adjust spelling for words with digraphs like 'et', 'ch', and 'sh'.",
      "patterns": [
        {
          "regex": "\\b(\\w*et|\\w*ch|\\w*sh)\\b",
          "message": "Adjust spelling for digraphs."
        }
      ],
      "suggestions": [
        {
          "text": "$1k",
          "condition": "endsWith('et')"
        },
        {
          "text": "$1-ts$2",
          "condition": "contains('ch') && replaceWithTs()"
        },
        {
          "text": "$1-k$2",
          "condition": "contains('ch') && replaceWithK()"
        },
        {
          "text": "$1",
          "condition": "contains('sh') && keepOriginal()"
        },
        {
          "text": "$1-sy$2",
          "condition": "contains('sh') && replaceWithSy()"
        }
      ]
    },
    {
      "id": "F",
      "name": "Words Starting with 'S'",
      "description": "Words starting with 's' can be spelled in two ways.",
      "patterns": [
        {
          "regex": "\\b(s\\w+)\\b",
          "message": "Consider alternative spelling for words starting with 's'."
        }
      ],
      "suggestions": [
        {
          "text": "$1",
          "condition": "startsWith('s') && keepOriginal()"
        },
        {
          "text": "i$1",
          "condition": "startsWith('s') && addI()"
        }
      ]
    },
    {
      "id": "G",
      "name": "Consecutive Identical Consonants",
      "description": "Omit one of the two consecutive identical consonants.",
      "patterns": [
        {
          "regex": "\\b(\\w*([bdfghjklmnprstvwxyz])\\2\\w*)\\b",
          "message": "Omit one of the consecutive identical consonants."
        }
      ],
      "suggestions": [
        {
          "text": "$1$2",
          "condition": "containsConsecutiveIdenticalConsonants()"
        }
      ]
    },
    {
      "id": "H",
      "name": "Strong and Weak Diphthongs",
      "description": "No added 'w' or 'y' for strong diphthongs; add 'w' or 'y' for weak diphthongs.",
      "patterns": [
        {
          "regex": "\\b(\\w*(ai|au|ei|ou)\\w*)\\b",
          "message": "Check diphthong usage."
        }
      ],
      "suggestions": [
        {
          "text": "$1",
          "condition": "strongDiphthong()"
        },
        {
          "text": "$1w",
          "condition": "weakDiphthong()"
        },
        {
          "text": "$1y",
          "condition": "weakDiphthong()"
        }
      ]
    }
  ]
},
{
  "id": "1.KAPAG_KUNG",
  "name": "KAPAG at KUNG",
  "pattern": [
    {
      "regex": "\\b(kapag|kung)\\b"
    }
  ],
  "message": "Gamitin ang 'kung' para sa di-katiyakan at 'kapag' para sa kalagayang tiyak.",
  "description": "Ipinakikilala ng 'kung' ang di-katiyakan ng isang kalagayan; ipinakikilala ng 'kapag' ang isang kalagayang tiyak.",
  "example": "Umuuwi siya sa probinsiya kapag araw ng Sabado. Mag-ingat ka naman kapag nagmamaneho ka. Hindi niya masabi kung Sabado o Linggo ang pag-uwi niya sa probinsiya. Mag-ingat ka kung ikaw ang magmamaneho ng kotse.",
  "suggestions": [
    { "text": "kapag" },
    { "text": "kung" }
  ]
},
{
  "id": "2.KIBO_IMIK",
  "name": "KIBO at IMIK",
  "pattern": [
    {
      "regex": "\\b(kibo|imik|kakibu-kibo|kumikibo|kibuin|nakaimik)\\b"
    }
  ],
  "message": "Pagkilos ang tinutukoy ng 'kibo'; pangungusap ang tinutukoy ng 'imik'.",
  "description": "Pagkilos ang tinutukoy ng 'kibo'; pangungusap ang tinutukoy ng 'imik'.",
  "example": "Wala siyang kakibu-kibo kung matulog. Hindi lamang sa tao nagagamit ang kibo. Kumikibo nang bahagya ang apoy ng kandila. Huwag ninyong kibuin ang mga bulaklak na iniayos ko sa plorera. Hindi siya nakaimik nang tanungin ko.",
  "suggestions": [
    { "text": "kibo" },
    { "text": "imik" },
    { "text": "kakibu-kibo" },
    { "text": "kumikibo" },
    { "text": "kibuin" },
    { "text": "nakaimik" }
  ]
},
{
  "id": "3.DAHIL_DAHILAN",
  "name": "DAHIL at DAHILAN",
  "pattern": [
    {
      "regex": "\\b(dahil|dahilan|dahil sa|dahil kay)\\b"
    }
  ],
  "message": "Pangatnig ang 'dahil', pangngalan ang 'dahilan'; pang-ukol naman ang 'dahil sa' o 'dahil kay'.",
  "description": "Pangatnig ang 'dahil', pangngalan ang 'dahilan'; pang-ukol naman ang 'dahil sa' o 'dahil kay'.",
  "example": "Hindi siya nakapasok kahapon dahil sumakit ang ulo niya. Hindi ko alam kung ano ang dahilan ng kanyang pagkakasakit.",
  "suggestions": [
    { "text": "dahil" },
    { "text": "dahilan" },
    { "text": "dahil sa" },
    { "text": "dahil kay" }
  ]
},
{
  "id": "4.HABANG_SAMANTALANG",
  "name": "HABANG at SAMANTALANG",
  "pattern": [
    {
      "regex": "\\b(habang|samantalang)\\b"
    }
  ],
  "message": "Gamitin ang 'habang' para sa kalagayang walang tiyak na hangganan, at 'samantalang' para sa kalagayang may taning.",
  "description": "Gamitin ang 'habang' para sa kalagayang walang tiyak na hangganan, at 'samantalang' para sa kalagayang may taning.",
  "example": "Kailangang matutong umasa habang nabubuhay. Nakikitira muna kami sa kanyang mga magulang samantalang wala pa akong trabaho.",
  "suggestions": [
    { "text": "habang" },
    { "text": "samantalang" }
  ]
},
{
  "id": "5.BAYAD_IPAGBAYAD",
  "name": "BAYAD at IPAGBAYAD",
  "pattern": [
    {
      "regex": "\\b(ibayad|ipagbayad)\\b"
    }
  ],
  "message": "'Ibayad' para sa pagbibigay ng bagay bilang kabayaran; 'ipagbayad' para sa pagbabayad para sa ibang tao.",
  "description": "'Ibayad' para sa pagbibigay ng bagay bilang kabayaran; 'ipagbayad' para sa pagbabayad para sa ibang tao.",
  "example": "Tatlong dosenang itlog na lamang ang ibabayad ko sa iyo sa halip na pera. Ipagbabayad muna kita sa sine.",
  "suggestions": [
    { "text": "ibayad" },
    { "text": "ipagbayad" }
  ]
},
{
  "id": "6.MAY_MAYROON",
  "name": "MAY at MAYROON",
  "pattern": [
    {
      "regex": "\\b(may|mayroon)\\b"
    }
  ],
  "message": "Gamitin ang 'may' kapag susundan ng pangngalan, pandiwa, pang-uri o pang-abay; 'mayroon' kapag susundan ng kataga, panghalip na panao o pamatlig o pang-abay na panlunan.",
  "description": "Gamitin ang 'may' kapag susundan ng pangngalan, pandiwa, pang-uri o pang-abay; 'mayroon' kapag susundan ng kataga, panghalip na panao o pamatlig o pang-abay na panlunan.",
  "example": "May anay sa dingding na ito. May kumakatok sa pinto. Mayroon kaming binabalak sa sayawan. Mayroon iyang malaking suliranin.",
  "suggestions": [
    { "text": "may" },
    { "text": "mayroon" }
  ]
},
{
  "id": "7.PAHIRAN_PAHIRIN",
  "name": "PAHIRAN at PAHIRIN",
  "pattern": [
    {
      "regex": "\\b(pahiran|pahirin)\\b"
    }
  ],
  "message": "'Pahiran' para sa paglalagay; 'pahirin' para sa pag-aalis.",
  "description": "'Pahiran' para sa paglalagay; 'pahirin' para sa pag-aalis.",
  "example": "Pahiran mo ng sukang iloko ang noo niya. Pahirin mo ang pawis sa likod ng bata.",
  "suggestions": [
    { "text": "pahiran" },
    { "text": "pahirin" }
  ]
},
{
  "id": "8.PINTO_PINTUAN",
  "name": "PINTO at PINTUAN",
  "pattern": [
    {
      "regex": "\\b(pinto|pintuan|hagdan|hagdanan)\\b"
    }
  ],
  "message": "'Pinto' para sa inilalapat sa puwang; 'pintuan' para sa puwang na pinagdaraanan. 'Hagdan' para sa inaakyatan at binababaan; 'hagdanan' para sa kinalalagyan ng hagdan.",
  "description": "'Pinto' para sa inilalapat sa puwang; 'pintuan' para sa puwang na pinagdaraanan. 'Hagdan' para sa inaakyatan at binababaan; 'hagdanan' para sa kinalalagyan ng hagdan.",
  "example": "Huwag kang humara sa pintuan at nang maipinid na ang pinto. Akoy palaging nag-aayos ng hagdanan sa aming bahay.",
  "suggestions": [
    { "text": "pinto" },
    { "text": "pintuan" },
    { "text": "hagdan" },
    { "text": "hagdanan" }
  ]
},
{
  "id": "9.SUBUKAN_SUBUKIN",
  "name": "SUBUKAN at SUBUKIN",
  "patterns": [
    {
      "regex": "\\b(subukan|subukin)\\b",
      "description": "'Subukan' para sa pagtingin nang palihim; 'subukin' para sa pagtikim at pagkilatis."
    },
    {
      "regex": "\\b(sinusubok|sinubok)\\b",
      "description": "Iisa ang anyo ng mga pandiwang ito sa pangkasalukuyan at pangnakaraan."
    },
    {
      "regex": "\\b(susubukan|sususbukin)\\b",
      "description": "Magkaiba ang anyo sa panghinaharap."
    }
  ],
  "message": "'Subukan' para sa pagtingin nang palihim; 'subukin' para sa pagtikim at pagkilatis.",
  "description": "'Subukan'ay ginagamit para sa pagtingin nang palihim, samantalang 'subukin' ang ginagamit para sa pagtikim at pagkilatis. Iisa ang anyo ng mga pandiwang ito sa pangkasalukuyan at pangnakaraan: sinusubok, sinubok. Magkaiba ang anyo sa panghinaharap: susubukan, sususbukin.",
  "example": "Ibig kong subukan kung ano ang ginagawa nila tuwing umaalis ako sa bahay. Subukin mo ang bagong labas na mantikilyang ito. Subukin mo kung gaano kabilis siyang magmakinlya.",
  "suggestions": [
    { "text": "subukan" },
    { "text": "subukin" },
    { "text": "sinusubok" },
    { "text": "sinubok" },
    { "text": "susubukan" },
    { "text": "sususbukin" }
  ]
},
{
  "id": "10.TAGA_TIGA",
  "name": "TAGA- at TIGA",
  "pattern": [
    {
      "regex": "\\b(tiga-|taga-\\w+|tig-isa|tigalawa|tigatlo|tig-apat)\\b"
    }
  ],
  "message": "Walang unlaping 'tiga-'. 'Taga-' ang dapat gamitin. Gumagamit lamang ng gitling kapag sinusundan ito ng pangngalang pantangi. 'Tig-' ay ginagamit kasama ng mga pambilang.",
  "description": "Walang unlaping 'tiga-'. 'Taga-' ang dapat gamitin. Gumagamit lamang ng gitling kapag sinusundan ito ng pangngalang pantangi. Naiiba ang unlaping 'tig-' na ginagamit kasama ng mga pambilang: tig-isa, tigalawa, tigatlo, tig-apat, atbp.",
  "example": "Taga-Negros ang napangasawa ni Norma. Ako ang palaging tagahugas ng pinggan sa gabi. Tig-isa kami ng pagkain.",
  "suggestions": [
    { "text": "taga-" },
    { "text": "tig-isa" },
    { "text": "tigalawa" },
    { "text": "tigatlo" },
    { "text": "tig-apat" }
  ]
}];
}
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('LanguageTool Proxy Server is running.');
});

const checkTextAgainstRules = (text, rules) => {
  let matches = [];

  rules.forEach(rule => {
    if (!rule.pattern) {
      console.warn(`Rule ${rule.id} has no pattern defined.`);
      return;
    }

    rule.pattern.forEach(patternObj => {
      let regex;
      if (patternObj.token && patternObj.token.value) {
        // If token value is provided, create a regex to match it exactly
        regex = new RegExp(`\\b${patternObj.token.value}\\b`, 'gi');
      } else if (patternObj.regex) {
        // If regex is provided, use it directly
        regex = new RegExp(patternObj.regex, 'gi');
      } else {
        console.warn(`Invalid pattern in rule ${rule.id}`);
        return;
      }

      let match;
      while ((match = regex.exec(text)) !== null) {
        let suggestions = [];

        if (rule.suggestions) {
          rule.suggestions.forEach(suggestion => {
            if (typeof suggestion === 'string') {
              suggestions.push(suggestion);
            } else if (suggestion.text) {
              let suggestionText = suggestion.text;
              for (let i = 0; i < match.length; i++) {
                suggestionText = suggestionText.replace(`$${i}`, match[i] || '');
              }
              suggestions.push(suggestionText);
            }
          });
        }

        matches.push({
          message: rule.message,
          shortMessage: rule.name || '',
          replacements: suggestions,
          offset: match.index,
          length: match[0].length,
          context: {
            text: text.slice(Math.max(0, match.index - 20), match.index + match[0].length + 20),
            offset: Math.min(20, match.index),
            length: match[0].length
          },
          sentence: text.slice(
            Math.max(0, text.lastIndexOf('.', match.index) + 1),
            text.indexOf('.', match.index + match[0].length) + 1
          ),
          rule: {
            id: rule.id,
            description: rule.description || rule.name
          }
        });
      }
    });
  });

  return { matches };
};
app.post('/api/v2/check', (req, res) => {
  const { text, language } = req.body;

  console.log('Received text:', text);
  console.log('Received language:', language);

  if (!text || !language) {
    return res.status(400).json({ error: 'Missing text or language' });
  }

  try {
    // Check if grammarRules is defined and is an array
    if (!Array.isArray(grammarRules)) {
      throw new Error('grammarRules is not an array or is undefined');
    }

    console.log('Number of grammar rules:', grammarRules.length);

    const result = checkTextAgainstRules(text, grammarRules);
    
    if (result.matches) {
      console.log('Number of matches found:', result.matches.length);
    } else {
      console.log('No matches found.');
    }

    console.log('Check result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
