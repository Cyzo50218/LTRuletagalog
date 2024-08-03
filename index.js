const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

let grammarRules = []; // Initialize as an empty array by default

if (!grammarRules.length)  {
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
  {
  "id": "PAGUULIT_O",
  "name": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'o'",
  "pattern": [
    {
      "regex": "\\b(\\w+o)(\\1)\\b"
    }
  ],
  "message": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'o'. Hindi ito pinapalitan ng letrang 'u'.",
  "description": "Sa pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'o', hindi ito pinapalitan ng letrang 'u'. Ginagamitan ng gitling sa pagitan ng salitang-ugat.",
  "examples": [
    "ano - ano-ano",
    "sino - sino-sino",
    "pito - pito-pito",
    "halo - halo-halo (magkakasama ang iba't ibang bagay)",
    "buto - buto-buto",
    "piso - piso-piso"
  ],
  "suggestions": [
    { "text": "$1-$2" }
  ]
},
{
  "id": "A1",
  "name": "Proper Nouns with 'pa' Prefix",
  "description": "Add hyphens to proper nouns when prefixed with 'pa'.",
  "pattern": [
    { "regex": "\\b(pa)([A-Z]\\w+)\\b" },
    { "regex": "\\b(Pa)([A-Z]\\w+)\\b" }
  ],
  "message": "Ginigitlingan ang pangngalang pantangi at salitanghiram kapag inuunlapian.",
  "suggestions": [ { "text": "$1-$2" } ],
  "examples": [
    { "incorrect": "paDavao", "correct": "pa-Davao" },
    { "incorrect": "paManila", "correct": "pa-Manila" }
  ]
},
{
  "id": "A2",
  "name": "Words with 'maka' Prefix",
  "description": "Add hyphens to words prefixed with 'maka'.",
  "pattern": [
    { "regex": "\\b(maka)(\\w+)\\b" },
    { "regex": "\\b(Maka)(\\w+)\\b" },
    { "regex": "\\b(mka)(\\w+)\\b" },
    { "regex": "\\b(Mka)(\\w+)\\b" }
  ],
  "message": "Ginigitlingan ang pangngalang pantangi at salitanghiram kapag inuunlapian.",
  "suggestions": [ { "text": "$1-$2" } ],
  "examples": [
    { "incorrect": "makabayan", "correct": "maka-bayan" }
  ]
},{
  "id": "B",
  "name": "Attach First KP Sound in Prefixes",
  "description": "Ito ay inuulitang unang katinig at patinig (KP) ng salita.",
  "pattern": [
    { "regex": "\\b(mag)([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" },
    { "regex": "\\b(Mag)([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" },
    { "regex": "\\b(mg)([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" },
    { "regex": "\\b(Mg)([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" }
  ],
  "message": "Ito ay inuulitang unang katinig at patinig (KP) ng salita.",
  "suggestions": [
    { "text": "$1$2-$2" }
  ],
  "examples": [
    { "incorrect": "magcomputer", "correct": "magco-computer" },
    { "incorrect": "magphotocopy", "correct": "magpo-photocopy" }
  ]
},
{
  "id": "PAGUULIT_E",
  "name": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'",
  "pattern": [
    {
      "regex": "\\b(\\w+e)(\\1)\\b"
    }
  ],
  "message": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'. Hindi ito pinapalitan ng letrang 'i'.",
  "description": "Sa pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e', hindi ito pinapalitan ng letrang 'i'. Kinakabitan ng pang-ugnay/linker (-ng) at ginagamitan ng gitling sa pagitan ng salitang-ugat.",
  "examples": [
    "tseke - tseke-tseke",
    "bente - bente-bente",
    "pale - pale-pale"
  ],
  "suggestions": [
    { "text": "$1ng-$2" },
    { "text": "$1-$2" }
  ]
},
{
  "id": "PAGHULAPIAN_COMBINED",
  "name": "4. Pagbabago ng huling pantig ng salitang-ugat",
  "pattern": [
    {
      "regex": "\\b(?!babae|tao|telebisyon|komersyo|kompyuter|kape|puno|taho|pili|sine|bote|onse|base|cheque|calle|niño|mantequilla|espejo|coche|maestro|casa|cuatro|sabado|nueve|año|libro|piedra|calle|sinosino|tseke|bente|pale|)(\\w*e)\\b",
    "exceptions": ["\\b(\\w*e\\1)\\b"]
},
{
  "regex": "\\b(?!buhos|sampu|tao|telepono|nilo|kilo|litro|metro|reto|calle|niño|mantequilla|espejo|coche|maestro|casa|cuatro|sabado|nueve|año|libro|piedra|calle|anoano|ano|sino|sinosino|pito|pitopito|halo|halohalo|buto|butobuto|piso|pisopiso|pa\\w*o)(\\w*o)\\b",
  "exceptions": ["\\b(\\w+\\1)\\b", "\\b(pa\\w*o)\\b"]
}

  ],
  "message": "Kapag hinuhulapian ang huling pantig ng salitang-ugat na nagtatapos sa 'e' o 'o', dapat itong i-apply ang tamang hulapi. Gayundin, may mga salitang nagtatapos sa 'e' na nananatili ang 'e' kahit hinuhulapian.",
  "description": "Kapag ang salitang-ugat na nagtatapos sa 'e', ang huling pantig ay nagiging 'i' at ang hulapi ay '-ihan'. Kapag nagtatapos sa 'o', ang huling pantig ay nagiging 'u' at ang hulapi ay '-an'. May mga salitang nananatili ang 'e' kahit hinuhulapian. Gayunman, hindi puwedeng palitan ng 'i' ang 'e' at 'o' sa 'u'. Dapat pa ring gamitin ang baybay na matagal na o lagi nang ginagamit.",
  "suggestions": [
    {
      "text": "$1ihan",
      "condition": "endsWith('e')",
      "exceptions": ["babae", "tao", "telebisyon", "komersyo", "kompyuter", "kape", "puno", "taho", "pili", "sine", "bote", "onse", "base", "cheque", "calle", "niño", "mantequilla", "espejo", "coche", "maestro", "casa", "cuatro", "sabado", "nueve", "año", "libro", "piedra"]
    },
    { "text": "$1ng $2" },
    { "text": "$1-$2" },
    {
      "text": "$1an",
      "condition": "endsWith('he')",
      "exceptions": ["babae", "tao", "telebisyon", "komersyo", "kompyuter", "kape", "puno", "taho", "pili", "sine", "bote", "onse", "base", "cheque", "calle", "niño", "mantequilla", "espejo", "coche", "maestro", "casa", "cuatro", "sabado", "nueve", "año", "libro", "piedra"]
    },
    {
      "text": "$1han",
      "condition": "matches(['sine', 'bote', 'onse', 'base'])"
    },
    {
      "text": "$1u-an",
      "condition": "endsWith('o')",
      "exceptions": ["buhos", "sampu", "tao", "telepono", "nilo", "kilo", "litro", "metro", "reto", "calle", "niño", "mantequilla", "espejo", "coche", "maestro", "casa", "cuatro", "sabado", "nueve", "año", "libro", "piedra"]
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
  "pattern": [
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
}
];
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('LanguageTool Proxy Server is running.');
});

const generateTypoPatterns = (word) => {
  let patterns = [];
  let chars = word.split('');

  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      let swappedChars = [...chars];
      [swappedChars[i], swappedChars[j]] = [swappedChars[j], swappedChars[i]];
      patterns.push(swappedChars.join(''));
    }
  }

  return patterns;
};

const callLanguageToolAPI = async (text) => {
  const apiUrl = 'https://api.languagetool.org/v2/check';
  const params = new URLSearchParams();
  params.append('text', text);
  params.append('language', 'tl-PH');  // Adjust the language as needed

  try {
    const response = await axios.post(apiUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error calling LanguageTool API:', error);
    return null;
  }
};

const checkTextAgainstRules = async (text, rules) => {
      let matches = [];

      for (const rule of rules) {
        if (!rule.pattern) {
          console.warn(`Rule ${rule.id} has no pattern defined.`);
          continue;
        }

        for (const patternObj of rule.pattern) {
          let regex;
          if (patternObj.token && patternObj.token.value) {
            // Exact match for tokens
            regex = new RegExp(`\\b${patternObj.token.value}\\b`, 'gi');
          } else if (patternObj.regex) {
            // Regex pattern
            regex = new RegExp(patternObj.regex, 'gi');
          } else {
            console.warn(`Invalid pattern in rule ${rule.id}`);
            continue;
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
                  for (let i = 0; i <= match.length; i++) {
                    suggestionText = suggestionText.replace(`$${i}`, match[i] || '');
                  }
                  // Preserve the original capitalization
                  if (match[0][0] === match[0][0].toUpperCase()) {
                    suggestionText = suggestionText.charAt(0).toUpperCase() + suggestionText.slice(1);
                  }
                  suggestions.push(suggestionText);
                }
              });
            }
        // Check for repeated words without space and handle accordingly
        if (rule.id === "PAGUULIT_E" || rule.id === "PAGUULIT_O") {
          const repeatedWithoutSpacePattern = /\b(\w+)\1\b/;
          const textWithoutSpaces = text.replace(/\s+/g, '');

          if (repeatedWithoutSpacePattern.test(textWithoutSpaces)) {
            // Skip if it involves repeated words without space
            continue;
          }
        }

        // Handle Spanish word exceptions
        if (rule.id.startsWith("ESPANYOL")) {
          const espanyolPattern = new RegExp(`\\b${match[0]}\\b`, 'i');
          if (espanyolPattern.test(text)) {
            suggestions = rule.suggestions; // Use the suggestions from the rule
          }
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
    }

    // Add typo detection logic here
    if (rule.pattern.some(patternObj => patternObj.token && patternObj.token.value)) {
      let word = rule.pattern.find(patternObj => patternObj.token && patternObj.token.value).token.value;
      let typoPatterns = generateTypoPatterns(word);

      for (const typoPattern of typoPatterns) {
        let typoRegex = new RegExp(`\\b${typoPattern}\\b`, 'gi');
        let typoMatch;
        while ((typoMatch = typoRegex.exec(text)) !== null) {
          let typoSuggestions = rule.suggestions || [];

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
}
  }

  if (matches.length === 0) {
    const languageToolResult = await callLanguageToolAPI(text);
    if (languageToolResult && languageToolResult.matches) {
      matches = languageToolResult.matches.map(match => ({
        message: match.message,
        shortMessage: match.rule.id || '',
        replacements: match.replacements.map(replacement => replacement.value),
        offset: match.offset,
        length: match.length,
        context: match.context,
        sentence: match.sentence,
        rule: {
          id: match.rule.id,
          description: match.rule.description
        }
      }));
    
    }
  }
      }
      

  return { matches };
};

app.post('/api/v2/check', async (req, res) => {
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

    const result = await checkTextAgainstRules(text, grammarRules);

    if (result.matches && result.matches.length > 0) {
      console.log('Number of matches found:', result.matches.length);
      console.log('Check result:', JSON.stringify(result, null, 2));
      return res.json(result);
    } else {
      console.log('No matches found. LanguageTool API returned no matches.');
      return res.json({ matches: [] });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
