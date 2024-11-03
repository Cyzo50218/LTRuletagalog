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
/*{
  "id": "A2",
  "name": "Words with 'maka' Prefix",
  "description": "Magdagdag ng gitling sa mga salitang may panlaping 'maka'.",
  "pattern": [
    { "regex": "\\b(maka|Maka|mka|Mka)(\\s*\\w+)\\b" }
  ],
  "message": "Ginigitlingan ang mga salitang may panlaping 'maka'.",
  "suggestions": [
    { "text": "maka-$2", "description": "Maglagay ng gitling sa pagitan ng panlaping 'maka' at ng ugat na salita." },
    { "text": "Maka-$2", "description": "Maglagay ng gitling sa pagitan ng panlaping 'maka' at ng ugat na salita." }
  ],
  "examples": [
    { "incorrect": "makabayan", "correct": "maka-bayan" }
  ]
},

{
  "id": "B",
  "name": "Attach First KP Sound in Prefixes",
  "description": "Ulitin ang unang katinig at patinig ng salita sa mga panlapi.",
  "pattern": [
    { "regex": "\\b(mag|Mag|mg|Mg)([bcdfghjklmnpqrstvwxyz][aeiou])([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b|\\b(mag|Mag|mg|Mg)\\s*([bcdfghjklmnpqrstvwxyz][aeiou])([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b|\\b(mag|Mag|mg|Mg)(po|co|pa|fo)?([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b|\\b(mag|Mag|mg|Mg)([bcdfghjklmnpqrstvwxyz][aeiou])\\s*([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b|\\b(mag|Mag|mg|Mg)\\s*(po|co|pa|fo)?\\s*([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" }
  ],
  "message": "Ulitin ang unang katinig at patinig ng salita kapag gumagamit ng panlapi.",
  "suggestions": [
    { "text": "$1$2-$3", "description": "Maglagay ng gitling sa pagitan ng panlapi at ng ugat na salita, na inuulit ang unang tunog." },
    { "text": "$1-$3", "description": "Maglagay ng gitling sa pagitan ng panlapi at ng ugat na salita kapag hindi na kailangan ang pag-uulit ng tunog." }
  ],
  "examples": [
    { "incorrect": "magcomputer", "correct": "magco-computer" },
    { "incorrect": "magcocomputer", "correct": "magco-computer" },
    { "incorrect": "Magphotocopy", "correct": "Magpo-photocopy" },
    { "incorrect": "magpophotocopy", "correct": "magpo-photocopy" },
    { "incorrect": "magphotocopy", "correct": "magpo-photocopy" },
    { "incorrect": "magpakain", "correct": "magpa-kain" },
    { "incorrect": "magpapakain", "correct": "magpa-kain" },
    { "incorrect": "magfokus", "correct": "magfo-kus" },
    { "incorrect": "magfokus", "correct": "magfo-kus" }
  ]
},
*/
{
  "id": "PAGUULIT",
  "name": "Pag-uulit ng buong salita",
  "pattern": [
    { 
      "regex": "\\b(mag|nag|pa)(\\w+)\\s+\\2\\b" 
    }
  ],
  "message": "Kapag ang buong salita ay inuulit, ginagamit ang gitling upang pagdugtungin ang dalawang ulit ng salita.",
  "description": "Kapag ang buong salita ay inuulit, ginagamit ang gitling upang pagdugtungin ang dalawang ulit ng salita.",
  "examples": [
    { "incorrect": "maglaba laba", "correct": "maglaba-laba" },
    { "incorrect": "nagluto luto", "correct": "nagluto-luto" },
    { "incorrect": "paligo ligo", "correct": "paligo-ligo" }
  ],
  "suggestions": [
    { "text": "$1$2-$2" }
  ]
}
,
{
  "id": "PAGUULIT",
  "name": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'",
  "pattern": [
    {
      "regex": "\\b(\\w+)\\s+(?=\\1\\b)([a-z]+)\\b"
    }
  ],
  "message": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'. Hindi ito pinapalitan ng letrang 'i'.",
  "description": "Sa pag-uulit ng salitang-ugat kinakabitan to ng '-' ",
  "examples": [
    { "incorrect": "tseke tseke", "correct": "tseke-tseke" },
    { "incorrect": "bente bente", "correct": "bente-bente" },
    { "incorrect": "pale pale", "correct": "pale-pale" },
    { "incorrect": "tseketseke", "correct": "tseke-tseke" },
    { "incorrect": "Kaway kaway", "correct": "Kaway-kaway" }
  ],
  "suggestions": [
    {
      "text": "$1-$2"
    }
  ]
},
{
  "id": "PAGUULIT_NA_MAY_NG",
  "name": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'",
  "pattern": [
    {
  "regex": "\\b(\\w*ng)\\s+(?=\\1\\b)([a-z]+)ng\\b"
}
  ],
  "message": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'. Hindi ito pinapalitan ng letrang 'i'.",
  "description": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'o'. Hindi ito pinapalitan ng letrang 'u'.",
  "examples": [
    { "incorrect": "Batu ng bato", "correct": "Bato-ng bato" },
    { "incorrect": "Sinu ng Sinu", "correct": "Sino-ng Sinu" },
    { "incorrect": "test ng test", "correct": "test-ng test" }
  ],
  "suggestions": [
    {
      "text": "$1-$2"
    }
  ]
}
,
{
  "id": "PAGUULIT",
  "name": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'",
  "pattern": [
    {
      "regex": "\\b(\\w*[\\w])u\\s+(\\w*[o])\\b"
    }
  ],
  "message": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'. Hindi ito pinapalitan ng letrang 'i'.",
  "description": "Dahil ang tamang pagbubuo ng mga salitang inuulit ay sumusunod sa orihinal na anyo ng salita bago ito ulitin.",
  "examples": [
    { "incorrect": "Batu bato", "correct": "Bato-bato" },
    { "incorrect": "Sinu Sinu", "correct": "Sino-sino" },
    { "incorrect": "test test", "correct": "test-test" }
  ],
  "suggestions": [
    {
      "text": "$1o-$2"
    }
  ]
}
,
/*
 {
  "id": "PAGHULAPIAN_E",
  "name": "Pagbabago ng huling pantig ng salitang-ugat (e)",
  "pattern": [
    {
      "regex": "\\b(?!babae|tao|telebisyon|komersyo|kompyuter|kape|puno|taho|pili|sine|bote|onse|base|cheque|calle|niño|mantequilla|espejo|coche|maestro|casa|cuatro|sabado|nueve|año|libro|piedra|sinosino|tseke|bente|pale|ate|karte|lente|note|jefe|chicle)([A-Za-z]+)(e)\\b",
      "exceptions": ["\\b(\\w*e\\1)\\b"]
    }
  ],
  "message": "Kapag hinuhulapian ang huling pantig ng salitang-ugat na nagtatapos sa 'e', ang pantig ay nagiging 'i' at ang hulapi ay '-ihan'. May mga salitang nagtatapos sa 'e' na nananatili ang 'e' kahit hinuhulapian.",
  "description": "Kapag ang salitang-ugat ay nagtatapos sa 'e', ang huling pantig ay nagiging 'i' at ang hulapi ay '-ihan'. May mga salitang nananatili ang 'e' kahit hinuhulapian.",
  "suggestions": [
    {
      "text": "$1ihan",
      "condition": "endsWith('e')",
      "exceptions": ["babae", "tao", "telebisyon", "komersyo", "kompyuter", "kape", "puno", "taho", "pili", "sine", "bote", "onse", "base", "cheque", "calle", "niño", "mantequilla", "espejo", "coche", "maestro", "casa", "cuatro", "sabado", "nueve", "año", "libro", "piedra", "ate", "ideya", "karte", "lente", "note", "poste", "suwerte", "tigre", "jefe", "chicle", "suerte", "bueno", "grande", "puente"]
    }
  ]
},
{
  "id": "PAGHULAPIAN_O",
  "name": "Pagbabago ng huling pantig ng salitang-ugat (o)",
  "pattern": [
    {
      "regex": "\\b(?!buhos|sino|Ano|Sino|rito|dito|sampu|tayo|tao|to|telepono|nilo|kilo|po|opo|Opo|Po|litro|metro|reto|calle|niño|mantequilla|espejo|coche|maestro|casa|cuatro|sabado|nueve|año|libro|piedra|anoano|ano|sino|sinosino|pito|pitopito|halo|halohalo|buto|butobuto|piso|pisopiso|pa\\w*o|hello|ako|mo|bago|barko|baso|buko|damo|ginto|hilo|kanto|kubo|lako|lobo|pako|plato|puto|sako|sulo|tabo|talo|tubo|ulo|zero|hero|piano|photo|mango|potato|avocado|echo|bingo|logo|memo|silo|soprano|tornado|volcano|arroz|codo|dedo|fuego|gusto|hilo|palo|queso|rato|santo|sombrero|vino|zapato)([A-Za-z]+)(o)\\b",
      "exceptions": ["\\b(\\w+\\1)\\b", "\\b(pa\\w*o)\\b"]
    }
  ],
  "message": "Kapag hinuhulapian ang huling pantig ng salitang-ugat na nagtatapos sa 'o', ang pantig ay nagiging 'u' at ang hulapi ay '-an'. May mga salitang nagtatapos sa 'o' na nananatili ang 'o' kahit hinuhulapian, at hindi puwedeng palitan ng 'o' ang 'u'.",
  "description": "Kapag ang salitang-ugat ay nagtatapos sa 'o', ang huling pantig ay nagiging 'u' at ang hulapi ay '-an'.",
  "suggestions": [
    {
      "text": "$1uan",
      "condition": "endsWith('o')",
      "exceptions": [
        "buhos", "sampu", "dito", "Sino", "rito", "Tayo", "tayo", "tao", "telepono", "nilo", "kilo", "litro", "metro", "reto", "calle", "niño", "mantequilla", "espejo", "coche", "maestro", "casa", "cuatro", "sabado", "nueve", "año", "libro", "piedra",
        "hello", "ako", "mo", "bago", "barko", "baso", "buko", "damo", "ginto", "hilo", "kanto", "kubo", "lako", "lobo", "pako", "plato", "puto", "sako", "sulo", "tabo", "talo", "tubo", "ulo",
        "zero", "hero", "piano", "photo", "mango", "potato", "avocado", "echo", "bingo", "logo", "memo", "silo", "soprano", "tornado", "volcano",
        "arroz", "codo", "dedo", "fuego", "gusto", "hilo", "palo", "queso", "rato", "santo", "sombrero", "vino", "zapato"
      ]
    }
  ]
}
*/
{
  "id": "1.KAPAG_KUNG",
  "name": "KAPAG at KUNG",
  "pattern": [
    {
      "regex": "\\b(kpg|kapg|kpag)\\b"
    },
    {
      "regex": "\\b(kng|kugn|kug)\\b"
    }
  ],
  "message": "Gamitin ang 'kung' para sa di-katiyakan at 'kapag' para sa kalagayang tiyak.",
  "description": "Ipinakikilala ng 'kung' ang di-katiyakan ng isang kalagayan; ipinakikilala ng 'kapag' ang isang kalagayang tiyak.",
  "example": "Umuuwi siya sa probinsiya kapag araw ng Sabado. Mag-ingat ka naman kapag nagmamaneho ka. Hindi niya masabi kung Sabado o Linggo ang pag-uwi niya sa probinsiya. Mag-ingat ka kung ikaw ang magmamaneho ng kotse.",
  "suggestions": [
    {
      "text": "kapag",
      "condition": "matches(kpg|kapg|kpag)",
      "description": "'Kapag' ang tamang gamitin kapag tinutukoy ang isang kalagayan na tiyak."
    },
    {
      "text": "kung",
      "condition": "matches(kng|kugn|kug)",
      "description": "'Kung' ang tamang gamitin kapag tinutukoy ang isang di-katiyakan."
    }
  ]
},
{
  "id": "MAY GITLING",
  "name": "KAPAG at KUNG",
  "pattern": [
    {
      "regex": "\\b(abalang abala|Abalang abala)\\b"
    }
  ],
  "message": "Gamitin ang 'kung' para sa di-katiyakan at 'kapag' para sa kalagayang tiyak.",
  "description": "Ipinakikilala ng 'kung' ang di-katiyakan ng isang kalagayan; ipinakikilala ng 'kapag' ang isang kalagayang tiyak.",
  "example": "Umuuwi siya sa probinsiya kapag araw ng Sabado. Mag-ingat ka naman kapag nagmamaneho ka. Hindi niya masabi kung Sabado o Linggo ang pag-uwi niya sa probinsiya. Mag-ingat ka kung ikaw ang magmamaneho ng kotse.",
  "suggestions": [
    {
      "text": "Abalang-abala"
    },
    {
  "text": "abalang-abala"
}
  ]
},
{
  "id": "1.KAPAG_KUNG",
  "name": "KAPAG at KUNG",
  "pattern": [
    {
      "regex": "\\b(kpg|kapg|kpag)\\b"
    }
  ],
  "message": "Gamitin ang 'kung' para sa di-katiyakan at 'kapag' para sa kalagayang tiyak.",
  "description": "Ipinakikilala ng 'kung' ang di-katiyakan ng isang kalagayan; ipinakikilala ng 'kapag' ang isang kalagayang tiyak.",
  "example": "Umuuwi siya sa probinsiya kapag araw ng Sabado. Mag-ingat ka naman kapag nagmamaneho ka. Hindi niya masabi kung Sabado o Linggo ang pag-uwi niya sa probinsiya. Mag-ingat ka kung ikaw ang magmamaneho ng kotse.",
  "suggestions": [
    {
      "text": "kapag",
      "condition": "matches(kpg|kapg|kpag)",
      "description": "'Kapag' ang tamang gamitin kapag tinutukoy ang isang kalagayan na tiyak."
    }
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
    {
      "text": "kibo",
      "description": "'Kibo' ang tamang gamitin kapag tinutukoy ang pagkilos."
    },
    {
      "text": "imik",
      "description": "'Imik' ang tamang gamitin kapag tinutukoy ang pangungusap."
    },
    {
      "text": "kakibu-kibo",
      "description": "'Kakibu-kibo' ang tamang gamitin para sa pagkilos na nagmumula sa pagkatao."
    },
    {
      "text": "kumikibo",
      "description": "'Kumikibo' ang tamang gamitin para sa pagkilos na bahagya."
    },
    {
      "text": "kibuin",
      "description": "'Kibuin' ang tamang gamitin para sa paggawa ng aksyon sa bagay."
    },
    {
      "text": "nakaimik",
      "description": "'Nakaimik' ang tamang gamitin para sa pangungusap na hindi nagsasalita."
    }
  ]
},
{
  "id": "3.DAHIL_DAHILAN",
  "name": "DAHIL at DAHILAN",
  "pattern": [
     {
   "regex": "\\b(dahl|dhil|dahl)\\b"
 },
  {
   "regex": "\\b(dahlan|dhilan|dahiln)\\b"
 },
  {
   "regex": "\\b(dhil sa|dahl sa|dahlsa|dhilsa|dahilsa|dahil sa)\\b"
 },
  {
   "regex": "\\b(dhil kay|dahl ky|dahlky|dhilkay|dahlkay|dhilky|dahilkay)\\b"
 }
  ],
  "message": "Pangatnig ang 'dahil', pangngalan ang 'dahilan'; pang-ukol naman ang 'dahil sa' o 'dahil kay'.",
  "description": "Pangatnig ang 'dahil', pangngalan ang 'dahilan'; pang-ukol naman ang 'dahil sa' o 'dahil kay'.",
  "example": "Hindi siya nakapasok kahapon dahil sumakit ang ulo niya. Hindi ko alam kung ano ang dahilan ng kanyang pagkakasakit.",
  "suggestions": [
    {
      "text": "dahil",
      "condition": "matches(dahl|dhil|dahl)",
      "description": "'Dahil' ang tamang gamitin kapag pangatnig."
    },
    {
      "text": "dahilan",
      "condition": "matches(dahlan|dhilan|dahiln)",
      "description": "'Dahilan' ang tamang gamitin kapag pangngalan."
    },
    {
      "text": "dahil sa",
      "condition": "matches(dhil sa|dahl sa|dahlsa|dhilsa|dahilsa|dahil sa)",
      "description": "'Dahil sa' ang tamang gamitin kapag pang-ukol."
    },
    {
      "text": "dahil kay",
      "condition": "matches(dhil kay|dahl ky|dahlky|dhilkay|dahlkay|dhilky|dahilkay)",
      "description": "'Dahil kay' ang tamang gamitin kapag pang-ukol na tinutukoy ang tao."
    }
  ]
},
{
  "id": "4.HABANG_SAMANTALANG",
  "name": "HABANG at SAMANTALANG",
  "pattern": [
    {
      "regex": "\\b(hbang|habng|hbng)\\b",
      "description": "'Habang' Ginagamit ang 'Habang' para sa kalagayang walang tiyak na hangganan"
    },
    {
      "regex": "\\b(smantalang|samantlng|samntlng|samantalng)\\b",
      "description": "'Samantalang' Ginagamit ang 'Samantalang' para sa kalagayang may taning."
    }
  ],
  "message": "Gamitin ang 'habang' para sa kalagayang walang tiyak na hangganan, at 'samantalang' para sa kalagayang may taning.",
  "description": "Gamitin ang 'habang' para sa kalagayang walang tiyak na hangganan, at 'samantalang' para sa kalagayang may taning.",
  "example": "Kailangang matutong umasa habang nabubuhay. Nakikitira muna kami sa kanyang mga magulang samantalang wala pa akong trabaho.",
  "suggestions": [
    {
      "text": "habang",
      "condition": "matches(hbang|habng|hbng)",
      "description": "'Habang' ang tamang gamitin para sa kalagayang walang tiyak na hangganan."
    },
    {
      "text": "samantalang",
      "condition": "matches(smantalang|samantlng|samntlng|samantalng)",
      "description": "'Samantalang' ang tamang gamitin para sa kalagayang may taning."
    }
  ]
},
{
  "id": "5.BAYAD_IPAGBAYAD",
  "name": "BAYAD at IPAGBAYAD",
  "pattern": [
    {
   "regex": "\\b(ibyad|ibayd)\\b",
   "description": "'Ibayad' ito ay para sa pagbibigay ng bagay bilang."
 },
 {
  "regex": "\\b(ipgbayad|ipagbyad|ipgbyad)\\b",
  "description": "'Ipagbayad' ito ay para sa pagbabayad para sa ibang tao."
}
  ],
  "message": "'Ibayad' para sa pagbibigay ng bagay bilang kabayaran; 'ipagbayad' para sa pagbabayad para sa ibang tao.",
  "description": "'Ibayad' para sa pagbibigay ng bagay bilang kabayaran; 'ipagbayad' para sa pagbabayad para sa ibang tao.",
  "example": "Tatlong dosenang itlog na lamang ang ibabayad ko sa iyo sa halip na pera. Ipagbabayad muna kita sa sine.",
  "suggestions": [
    {
      "text": "ibayad",
      "condition": "matches(ibyad|ibayd)",
      "description": "'Ibayad' ang tamang gamitin kapag ang tinutukoy ay pagbibigay ng bagay bilang kabayaran."
    },
    {
      "text": "ipagbayad",
      "condition": "matches(ipgbayad|ipagbyad|ipgbyad)",
      "description": "'Ipagbayad' ang tamang gamitin kapag ang tinutukoy ay pagbabayad para sa ibang tao."
    }
  ]
},
{
  "id": "6.MAY_MAYROON",
  "name": "MAY at MAYROON",
  "pattern": [
    {
   "regex": "\\b(mayro|myro|mayn|mayron)\\b",
   "description": "'May' ito ay tumutukoy sa pagkakaroon ng bagay."
 },
 {
  "regex": "\\b(mayon|mayr|myro|mayron|mayroon)\\b",
  "description": "'Mayroon' ito ay tumutukoy sa pagkakaroon ng bagay."
}
  ],
  "message": "Gamitin ang 'may' para sa pagkakaroon ng bagay, at 'mayroon' para sa pagkakaroon ng isang bagay na may malinaw na tinutukoy.",
  "description": "Gamitin ang 'may' para sa pagkakaroon ng bagay, at 'mayroon' para sa pagkakaroon ng isang bagay na may malinaw na tinutukoy.",
  "example": "May mga pakpak ang ibon. Mayroon akong tatlong libro sa bag ko.",
  "suggestions": [
    {
      "text": "may",
      "condition": "matches(mayro|myro|mayn|mayron)",
      "description": "'May' ang tamang gamitin kapag tinutukoy ang pagkakaroon ng bagay."
    },
    {
      "text": "mayroon",
      "condition": "matches(mayon|mayr|myro|mayron|mayroon)",
      "description": "'Mayroon' ang tamang gamitin kapag tinutukoy ang pagkakaroon ng isang bagay na may malinaw na tinutukoy."
    }
  ]
},
{
  "id": "7.MAASAHAN_MAAASAHAN",
  "name": "MAASAHAN at MAAASAHAN",
  "pattern": [
    {
      "regex": "\\b(maasahan|maaasahan|maasahan|maasahan)\\b",
      "description": "'Maaasahan' para sa pwedeng pagkatiwalaan."
    }
  ],
  "message": "'Maaasahan' ang tamang gamitin para sa mga bagay o tao na pwedeng pagkatiwalaan.",
  "description": "'Maaasahan' ang tamang gamitin para sa mga bagay o tao na pwedeng pagkatiwalaan.",
  "example": "Ang kanyang mga kaibigan ay maa-asahan sa panahon ng pangangailangan.",
  "suggestions": [
    {
      "text": "maaasahan",
      "condition": "matches(maasahan|maaasahan|maasahan|maasahan)",
      "description": "'Maaasahan' ang tamang gamitin kapag tinutukoy ang pagiging mapagkakatiwalaan."
    }
  ]
},
{
  "id": "8.HIGIT_HIGIT_PA",
  "name": "HIGIT at HIGIT PA",
  "pattern": [
    {
   "regex": "\\b(hgiit|hgt|hgtpa)\\b",
   "description": "'Higit' ito ay ginagamit para sa comparative na pang-uri."
 },
 {
  "regex": "\\b(higitpa|hgtpa)\\b",
  "description": "'Higit pa' ito ay ginagamit para sa pagdaragdag o pagpapalakas ng kaalaman."
}
  ],
  "message": "Gamitin ang 'higit' para sa comparative na pang-uri; 'higit pa' para sa pagdaragdag o pagpapalakas ng kaalaman.",
  "description": "Gamitin ang 'higit' para sa comparative na pang-uri; 'higit pa' para sa pagdaragdag o pagpapalakas ng kaalaman.",
  "example": "Ang kanyang pagsusulit ay higit sa pamantayan. Ang kanyang mga marka ay higit pa sa average.",
  "suggestions": [
    {
      "text": "higit",
      "condition": "matches(higit|hgt|hgtpa)",
      "description": "'Higit' ang tamang gamitin para sa comparative na pang-uri."
    },
    {
      "text": "higit pa",
      "condition": "matches(higitpa|hgtpa)",
      "description": "'Higit pa' ang tamang gamitin para sa pagdaragdag o pagpapalakas ng kaalaman."
    }
  ]
}
,
{
  "id": "9.SUBUKAN_SUBUKIN",
  "name": "SUBUKAN at SUBUKIN",
  "pattern": [
    {
      "regex": "\\b(subukam|subukn|subuka|subukn|subukin|sbukan)\\b",
      "description": "'Subukan' ito ay sa pagtingin nang palihim."
    },
    {
      "regex": "\\b(subukn|subuka|subukan|subukam|sbukin)\\b",
      "description": "'Subukin' ito ay sa pagtikim at pagkilatis."
    },
    {
      "regex": "\\b(sinubuk|sinubok|sinusbok|sinusbok|snusubok|sinusubok|sinubok|sinusbok|sinusbok|snubok)\\b",
      "description": "Iisa ang anyo ng mga pandiwang ito sa pangkasalukuyan at pangnakaraan: 'sinusubok, sinubok'. "
    },
    {
      "regex": "\\b(susubukn|susubkin|susubkan|ssbukan|susubikan|susubukan|susubok|susubkin|ssbukin)\\b",
      "description": "Magkaiba nag anyo sa panghinaharap: 'susubukan, sususbukin'. "
    }
  ],
  "message": "'Subukan' para sa pagtingin nang palihim at 'subukin' para sa pagtikim at pagkilatis.",
  "description": "'Subukan' ay ginagamit para sa pagtingin nang palihim, samantalang 'subukin' ang ginagamit para sa pagtikim at pagkilatis. Iisa ang anyo ng mga pandiwang ito sa pangkasalukuyan at pangnakaraan: sinusubok, sinubok. Magkaiba ang anyo sa panghinaharap: susubukan, susubukin.",
  "example": "Ibig kong subukan kung ano ang ginagawa nila tuwing umaalis ako sa bahay. Subukin mo ang bagong labas na mantikilyang ito. Subukin mo kung gaano kabilis siyang magmakinlya.",
  "suggestions": [
    {
      "text": "subukan",
      "condition": "matches(subukam|subukn|subuka|subukn|subukin|sbukan)",
      "description": "'Subukan' ang tamang anyo para sa paggamit sa sitwasyon ng pagtingin nang palihim o pagsubok."
    },
    {
      "text": "subukin",
      "condition": "matches(subukn|subuka|subukan|subukam|sbukin)",
      "description": "'Subukin' ang tamang anyo para sa paggamit sa sitwasyon ng pagtikim at pagkilatis."
    },
    {
      "text": "sinusubok",
      "condition": "matches(sinubuk|sinubok|sinusbok|sinusbok|snusubok)",
      "description": "'Sinusubok' ang tamang anyo para sa pangkasalukuyan at pangnakaraan."
    },
    {
      "text": "sinubok",
      "condition": "matches(sinusubok|sinubok|sinusbok|sinusbok|snubok)",
      "description": "'Sinubok' ang tamang anyo para sa pangnakaraan."
    },
    {
      "text": "susubukan",
      "condition": "matches(susubukn|susubkin|susubkan|ssbukan)",
      "description": "'Susubukan' ang tamang anyo para sa panghinaharap kapag tinutukoy ang pagtikim o pagsusuri."
    },
    {
      "text": "susubukin",
      "condition": "matches(susubikan|susubukan|susubok|susubkin|ssbukin)",
      "description": "'Susubukin' ang tamang anyo para sa panghinaharap kapag tinutukoy ang pagtikim o pagsusuri."
    }
  ]
},
{
  "id": "10.TAGA_TIGA",
  "name": "TAGA- at TIGA",
  "pattern": [
    {
      "regex": "\\b(tga-|tgia-|tgua-|tgai-|tgaa-|tga-|tiga-|tig-|tga-anim|tgia-anim|tgai-anim|tgau-anim|tga-anim|tga-anim|tiganim|tiga-anim|tiganim)\\b"
    }
  ],
  "message": "Walang unlaping 'tiga-'. 'Taga-' ang dapat gamitin. Gumagamit lamang ng gitling kapag sinusundan ito ng pangngalang pantangi. 'Tig-' ay ginagamit kasama ng mga pambilang.",
  "description": "Walang unlaping 'tiga-'. 'Taga-' ang dapat gamitin. Gumagamit lamang ng gitling kapag sinusundan ito ng pangngalang pantangi. Naiiba ang unlaping 'tig-' na ginagamit kasama ng mga pambilang: tig-isa, tigalawa, tigatlo, tig-apat, tig-lima, atbp.",
  "example": "Taga-Negros ang napangasawa ni Norma. Ako ang palaging tagahugas ng pinggan sa gabi. Tig-isa kami ng pagkain.",
  "suggestions": [
    {
      "text": "taga-$2",
      "condition": "matches(tga-|tgau-|tgua-|tgaa-|taga)",
      "description": "'Taga-' ang tamang unlapi kapag tinutukoy ang pinagmulan o lugar."
    },
    {
      "text": "tiga-$2",
      "condition": "matches(tgia-|tgai-|tagi-|tiga)",
      "description": "'Tiga-' ang tamang unlapi kapag tinutukoy ang bilang o dami ng isang bagay."
    },
    {
      "text": "tig-isa",
      "condition": "matches(tigaisa)",
      "description": "'Tig-isa' ang tamang anyo para sa bilang na isa."
    },
    {
      "text": "tigalawa",
      "condition": "matches(tigadalawa)",
      "description": "'Tigalawa' ang tamang anyo para sa bilang na dalawa."
    },
    {
      "text": "tigatlo",
      "condition": "matches(tigatatlo)",
      "description": "'Tigatlo' ang tamang anyo para sa bilang na tatlo."
    },
    {
      "text": "tig-apat",
      "condition": "matches(tigaapat)",
      "description": "'Tig-apat' ang tamang anyo para sa bilang na apat."
    },
    {
      "text": "tig-lima",
      "condition": "matches(tigalima)",
      "description": "'Tig-lima' ang tamang anyo para sa bilang na lima."
    },
    {
      "text": "tiganim",
      "condition": "matches(tiga-anim)",
      "description": "'Tiganim' ang tamang anyo para sa bilang na anim."
    },
    {
      "text": "tigapito",
      "condition": "matches(tiga-pito)",
      "description": "'Tigapito' ang tamang anyo para sa bilang na pito."
    },
    {
      "text": "tigawalo",
      "condition": "matches(tiga-walo)",
      "description": "'Tigawalo' ang tamang anyo para sa bilang na walo."
    },
    {
      "text": "tigasyam",
      "condition": "matches(tiga-syam)",
      "description": "'Tigasyam' ang tamang anyo para sa bilang na siyam."
    },
    {
      "text": "tigasampu",
      "condition": "matches(tiga-sampu)",
      "description": "'Tigasampu' ang tamang anyo para sa bilang na sampu."
    }
  ]
},
{
  "id": "11.AGAWIN_AGAWAN",
  "name": "AGAWIN at AGAWAN",
  "pattern": [
    {
      "regex": "\\b(agwin|agwain|agawni)\\b"
    },
    {
      "regex": "\\b(agwan|agawn|agwna)\\b"
    }
  ],
  "message": "'Agawin' para sa pagkakaroon ng isang bagay mula sa iba; 'agawan' para sa pagkakaroon ng isang bagay mula sa isang tao o hayop.",
  "description": "'Agawin' ang ginagamit kapag ang isang bagay ay kinuha mula sa iba. 'Agawan' ang ginagamit kapag ang isang tao o hayop ay nagiging sanhi ng pagkawala ng isang bagay mula sa isa pa.",
  "example": "Ibig agawin ng bata ang laruan ni Jess. Ibig agawan ng laruan ni Boy si Jess.",
  "suggestions": [
    {
      "text": "agawin",
      "condition": "matches(agwin|agwain|agawni)",
      "description": "'Agawin' ang tamang anyo kapag ang isang bagay ay kinukuha mula sa iba."
    },
    {
      "text": "agawan",
      "condition": "matches(agwan|agawn|agwna)",
      "description": "'Agawan' ang tamang anyo kapag ang isang bagay ay kinukuha mula sa isang tao o hayop."
    }
  ]
},
{
  "id": "12.HINAGIS_INIHAGIS",
  "name": "HINAGIS at INIHAGIS",
  "pattern": [
    {
      "regex": "\\b(hnagis|hinags|hnagis|hinagisan|hingis)\\b"
    },
    {
      "regex": "\\b(inhagis|inihags|inihagis ang|ihagis ang|inihgis)\\b"
    }
  ],
  "message": "'Hinagis' para sa pagkilos ng isang bagay na ginawa gamit ang ibang bagay; 'inihagis' para sa pagkilos ng paghagis ng isang bagay patungo sa iba.",
  "description": "'Hinagis' ang ginagamit kapag ang isang bagay ay tinapon gamit ang iba pang bagay. 'Inihagis' ang ginagamit kapag tinapon ang isang bagay patungo sa iba.",
  "example": "Hinagis niya ng bato ang ibon. Inihagis niya ang bola sa kalaro.",
  "suggestions": [
    {
      "text": "hinagis",
      "condition": "matches(hnagis|hinags|hnagis|hinagisan|hingis)",
      "description": "'Hinagis' ang tamang anyo kapag ang isang bagay ay tinapon gamit ang ibang bagay."
    },
    {
      "text": "inihagis",
      "condition": "matches(inhagis|inihags|inihagis ang|ihagis ang|inihgis)",
      "description": "'Inihagis' ang tamang anyo kapag tinapon ang isang bagay patungo sa iba."
    }
  ]
},
  {
  "id": "13.ABUTAN_ABUTIN",
  "name": "ABUTAN at ABUTIN",
  "pattern": [
    {
      "regex": "\\b(abtan|abutn|abtna|abutan)\\b",
      "description": "Maling anyo o variant ng 'abutan'"
    },
    {
      "regex": "\\b(abutni|abutni ng|abtuni|abutnni|abutnii|abutin)\\b",
      "description": "Maling anyo o variant ng 'abutin'"
    }
  ],
  "message": "'Abutin' ang ginagamit kapag isang bagay ang inaabot; 'abutan' ang ginagamit kapag isang bagay ang ibinibigay o dinadagdagan.",
  "description": "'Abutin' ang ginagamit kapag inaabot ang isang bagay. 'Abutan' ang ginagamit kapag isang bagay ang ibinibigay o dinadagdagan.",
  "example": {
    "incorrect": "Abtan mo ang bayabas sa puno. Abutni mo ng pera ang Nanay.",
    "correct": "Abutin mo ang bayabas sa puno. Abutan mo ng pera ang Nanay."
  },
  "suggestions": [
    {
      "text": "abutin",
      "condition": "matches(abtan|abutn|abtna|abutan)",
      "description": "Inirerekomenda ang 'abutin' kapag ang konteksto ay tungkol sa pag-abot ng isang bagay."
    },
    {
      "text": "abutan",
      "condition": "matches(abutni|abutni ng|abtuni|abutnni|abutnii|abutin)",
      "description": "Inirerekomenda ang 'abutan' kapag ang konteksto ay tungkol sa pagbibigay o pagdadagdag ng isang bagay."
    }
  ]
},
  {
    "id": "14.BILHIN_BILHAN",
    "name": "BILHIN at BILHAN",
    "pattern": [
      {
        "regex": "\\b(blhin|bihiln|bhlni)\\b"
      },
      {
        "regex": "\\b(blhan|blhan|balhin|blahin)\\b"
      }
    ],
    "message": "'Bilhin' para sa pagkuha ng isang bagay; 'bilhan' para sa pagbibigay ng isang bagay sa iba.",
    "description": "'Bilhin' ang ginagamit para sa pagkuha ng isang bagay. 'Bilhan' ang ginagamit para sa pagbibigay ng isang bagay sa iba.",
    "example": "Bilhin natin ang sapatos na iyon para sa iyo. Bilhan natin ng sapatos ang ate.",
    "suggestions": [
      {
        "text": "bilhin",
        "condition": "matches(blhin|bihiln|bhlni)"
      },
      {
        "text": "bilhan",
        "condition": "matches(blhan|blhan|balhin|blahin)"
      },
       {
   "text": "bilhin",
   "condition": "matches(blhan|blhan|balhin|blahin)"
 },
 {
  "text": "bilhan",
  "condition": "matches(blhin|bihiln|bhlni)"
}
    ]
  },
  {
    "id": "15.WALISAN_WALISIN",
    "name": "WALISAN at WALISIN",
    "pattern": [
      {
        "regex": "\\b(wlaisin|walisni|wlasini|walsni)\\b"
      },
      {
        "regex": "\\b(walisna|wlaisan|wlasina|walsan)\\b"
      }
    ],
    "message": "'Walisin' para sa pag-aalis ng kalat; 'walisan' para sa paglilinis ng isang lugar o pook.",
    "description": "'Walisin' ang ginagamit para sa pagtanggal ng kalat. 'Walisan' ang ginagamit para sa paglilinis ng isang lugar.",
    "example": "Nais kong walisan ang aklatan. Nais kong walisin ang nagkalat na papel sa aklatan.",
    "suggestions": [
      {
        "text": "walisin",
        "condition": "matches(wlaisin|walisni|wlasini|walsni)"
      },
      {
        "text": "walisan",
        "condition": "matches(walisna|wlaisan|wlasina|walsan)"
      }
    ]
  },
  {
    "id": "16.SUKLAYIN_SUKLAYAN",
    "name": "SUKLAYIN at SUKLAYAN",
    "pattern": [
      {
        "regex": "\\b(sklayan|suklyan|suklaynna|suklaynna)\\b"
      },
      {
        "regex": "\\b(sklayin|suklyina|suklayni|sklyani)\\b"
      }
    ],
    "message": "'Suklayin' para sa pagsusuklay ng buhok; 'suklayan' para sa pagsusuklay sa iba.",
    "description": "'Suklayin' ang ginagamit para sa pagsusuklay ng sariling buhok. 'Suklayan' ang ginagamit para sa pagsusuklay sa buhok ng iba.",
    "example": "Suklayin mo ang buhok ko, Luz. Suklayan mo ako ng buhok, Alana.",
    "suggestions": [
      {
        "text": "suklayin",
        "condition": "matches(sklayin|suklyina|suklayni|sklyani)"
      },
      {
        "text": "suklayan",
        "condition": "matches(sklayan|suklyan|suklaynna|suklaynna)"
      }
    ]
  },
  {
    "id": "17.NAMATAY_NAPATAY",
    "name": "NAMATAY at NAPATAY",
    "pattern": [
      {
        "regex": "\\b(nmatay|namaty|nmatayy)\\b"
      },
      {
        "regex": "\\b(nptay|napaty|napatyyy|napatayy|npatya)\\b"
      }
    ],
    "message": "'Namatay' para sa hindi sinasadyang pagkamatay; 'napatay' para sa sinadyang pagkamatay.",
    "description": "'Namatay' ang ginagamit para sa mga pagkamatay na sanhi ng sakit o katandaan. 'Napatay' ang ginagamit para sa mga pagkamatay na sanhi ng pumaslang sa isang tao o hayop.",
    "example": "Namatay ang kanyang lolo dahil sa sakit sa atay. Napatay ang aking alagang aso.",
    "suggestions": [
      {
        "text": "namatay",
        "condition": "matches(nmatay|namaty|nmatayy)"
      },
      {
        "text": "napatay",
        "condition": "matches(nptay|napaty|napatyyy|napatayy|npatya)"
      }
    ]
  },
  {
  "id": "19.OPERAHAN at OPERAHIN",
  "name": "NAMATAY at NAPATAY",
  "pattern": [
    {
      "regex": "\\b(w+[ay]* operahan)\\b"
      },
      {
      "regex": "\\b(w+[ay]* operahin)\\b"
      },
    {
      "regex": "\\b(operahin|oprahin|operhin|operahni)\\b"
      },
      {
  "regex": "\\b(operahann|ophrahan|operhana|operahna)\\b"
}
    ],
  "message": "'Operahin' tiyak na bahagi ng katawan na titistisin, at ang 'OPERAHAN' naman ay tumutukoy sa tao",
  "description": "'Operahin' tiyak na bahagi ng katawan na titistisin, at ang 'OPERAHAN' naman ay tumutukoy sa tao.",
  "example": "Namatay ang kanyang lolo dahil sa sakit sa atay. Napatay ang aking alagang aso.",
  "suggestions": [
    {
      "text": "ooperahin",
      "condition": "matches(\\w+[ay]* operahan)"
      },
      {
  "text": "ooperahan",
  "condition": "matches(\\w+[ay]* operahin)"
},
    {
      "text": "ooperahin",
      "condition": "matches(operahin|oprahin|operhin|operahni)"
      },
      {
  "text": "operahin",
  "condition": "matches(operahin|oprahin|operhin|operahni)"
},
{
  "text": "ooperahan",
  "condition": "matches(operahann|ophrahan|operhana|operahna)"
},
{
  "text": "operahan",
  "condition": "matches(operahann|ophrahan|operhana|operahna)"
}
    ]
},
  {
    "id": "18.MAGSAKAY_SUMAKAY",
    "name": "MAGSAKAY at SUMAKAY",
    "pattern": [
      {
        "regex": "\\b(mgsakay|magsakya|magsakyy|magskay|magsakayyy|mgkarga|magkrga|magkargga|magkraga|nagsakyya|nagskya|ngsakay|nagskay)\\b"
      },
      {
        "regex": "\\b(smkay|sumaky|sumakyy|sumakayyy|smukaya)\\b"
      }
    ],
    "message": "'Magsakay' para sa pagkakarga; 'sumakay' para sa pagsakay.",
    "description": "'Magsakay' ang ginagamit para sa pagkakarga o paglalagay ng tao o bagay sa sasakyan. 'Sumakay' ang ginagamit para sa pagpasok sa sasakyan o pagsakay dito.",
    "example": "Magsakay tayo ng pasahero. Sumakay kami sa bus papunta sa Maynila.",
    "suggestions": [
      {
        "text": "magsakay",
        "condition": "matches(mgsakay|magsakya|magsakyy|magskay|magsakayyy)"
      },
      {
        "text": "magkarga",
        "condition": "matches(mgsakay|magsakya|magsakyy|magskay|magsakayyy|mgkarga|magkrga|magkargga|magkraga)"
      },
      {
        "text": "nagsakay",
        "condition": "matches(mgsakay|magsakya|magsakyy|magskay|magsakayyy|mgkarga|magkrga|magkargga|magkraga|nagsakyya|nagskya|ngsakay|nagskay)"
      },
      {
        "text": "sumakay",
        "condition": "matches(smkay|sumaky|sumakyy|sumakayyy|smukaya)"
      }
    ]
  },
{
  "id": "PARIN TO PA RIN",
  "name": "NAMATAY at NAPATAY",
  "pattern": [
    {
      "regex": "\\b(parin)\\b"
      }
    ],
  "message":"Walang salitang ‘parin’ ito ay binabaybay ng ‘pa rin’.",
  "description": "Walang salitang ‘parin’ ito ay binabaybay ng ‘pa rin’.",
  "example": "Namatay ang kanyang lolo dahil sa sakit sa atay. Napatay ang aking alagang aso.",
  "suggestions": [
    {
      "text": "pa rin"
      }
    ]
},
  {
  "id": "20.KATA at KITA",
  "name": "NAMATAY at NAPATAY",
  "pattern": [
    {
      "regex": "\\b(ikaw at ako|kta|ktaa)\\b"
      },
    {
      "regex": "\\b(ikaw|ktai|kitta|ktia)\\b"
      }
    ],
  "message": "'Kata' ay ang pinagsama na salitang ikaw at ako, samantang ang 'kita' ay salitang ikaw.",
  "description": "'Kata' ay ang pinagsama na salitang ikaw at ako, samantang ang 'kita' ay salitang ikaw.",
  "example": "Namatay ang kanyang lolo dahil sa sakit sa atay. Napatay ang aking alagang aso.",
  "suggestions": [
    {
      "text": "kata",
      "condition": "matches(ikaw at ako|kta|ktaa)"
      },
    {
      "text": "kita",
      "condition": "matches(ikaw|ktai|kitta|ktia)"
      }
    ]
},
  {
    "id": "21.NG AT NANG",
    "name": "NG at NANG",
    "pattern": [
      {
        "regex": "\\b(na ang|na ng|na na)\\b"
      },
      {
              "regex": "\\b(nnga|naggn|nnag)\\b"
      }
    ],
    "message": "'Nang' ay ginagamit kung may katumbas ng pinagsamang “na  at  ang”, “na at ng”, at “na at na” sapangungusap.",
    "description": "'Ng' ay ginagamit kasunod ng mga pangngalan at pang-uri, samantalang 'nang' ay para sa pang-abay at iba pang gamit sa pangungusap.",
    "example": "Nagbigay ng libro si Ana. Nagtago siya nang hindi makita.",
    "suggestions": [
      {
        "text": "nang",
        "condition": "matches(nnga|naggn|nnag)"
      },
      {
        "text": "nang",
        "condition": "matches(na ang|na ng|na na)"
      }
    ]
  },
  {
    "id": "23.SILA_SINA",
    "name": "SILA at SINA",
    "pattern": [
      {
        "regex": "\\b(sla|slai|sial)\\b"
      },
      {
  "regex": "\\b(snai|sian|snia|sinaa)\\b"
}
    ],
    "message": "'Sila' ay ginagamit para sa ilang bilang ng tao, habang 'Sina' ay ginagamit para sa maraming tao na sinusundan ng pangalan.",
    "description": "'Sila' ay panghalip na tumutukoy sa ilang tao. 'Sina' ay tumutukoy sa maraming tao at laging sinusundan ng pangalan.",
    "example": "Sina John at Luis ang matalik kong mga kaibigan.",
    "suggestions": [
      {
        "text": "sila",
        "condition": "matches(sla|slai|sial)"
      },
      {
        "text": "sina",
        "condition": "matches(snai|sian|snia|sinaa)"
      }
    ]
  },
  {
    "id": "24.KUNG_KONG",
    "name": "KUNG at KONG",
    "pattern": [
      {
        "regex": "\\b(kng|kngu)\\b"
      },
      {
  "regex": "\\b(ko ng|kngo|kogn)\\b"
}
    ],
    "message": "'Kung' ay pangatnig na ginagamit sa hugnayang pangungusap, samantalang 'Kong' ay mula sa panghalip na 'ko' na inangkupan ng 'ng'.",
    "description": "'Kung' ay ginagamit sa mga pangungusap na naglalaman ng kondisyon. 'Kong' ay ginagamit sa pangungusap bilang panghalip.",
    "example": "Kung wala kang magandang sasabihin sa kapwa, huwag ka na lamang magsalita.",
    "suggestions": [
      {
        "text": "kung",
        "condition": "matches(kng|kngu)"
      },
      {
        "text": "kong",
        "condition": "matches(ko ng|kngo|kogn)"
      }
    ]
  },
  {
    "id": "25.IWAN_IWANAN",
    "name": "IWAN at IWANAN",
    "pattern": [
      {
        "regex": "\\b(iwnann|iwannan|iwanann)\\b"
      },
      {
  "regex": "\\b(iwna|iwna)\\b"
}
    ],
    "message": "'Iwan' ay nangangahulugang paglayo o paglipat, samantalang 'Iwanan' ay nangangahulugang bibigyan ng kung ano ang isang tao.",
    "description": "'Iwan' ay nangangahulugang iwan o paglayo. 'Iwanan' ay nangangahulugang magbigay ng isang bagay.",
    "example": "Iwanan mo ang iyong mga gamit dito.",
    "suggestions": [
      {
        "text": "iwan",
        "condition": "matches(iwna|iwna)"
      },
      {
        "text": "iwanan",
        "condition": "matches(iwnann|iwannan|iwanann)"
      }
    ]
  },
  {
    "id": "26.BITIW_BITAW",
    "name": "BITIW at BITAW",
    "pattern": [
      {
        "regex": "\\b(btiw|bitwi|bitw|bitiww|btwi)\\b"
      },
            {
        "regex": "\\b(bitwa|btaw|bitaww|btiaw)\\b"
      }
    ],
    "message": "'Bitiw' ay pagkawala ng pagkakahawak, samantalang 'Bitaw' ay nauukol sa lugar ng pagdarausan ng salpukan ng manok.",
    "description": "'Bitiw' ay nangangahulugang pag-alis sa pagkakahawak, samantalang 'Bitaw' ay tumutukoy sa lugar ng salpukan ng manok.",
    "example": "Ayokong bitiwan ang iyong kamay.",
    "suggestions": [
      {
        "text": "bitiw",
        "condition": "matches(btiw|bitwi|bitw|bitiww|btwi)"
      },
      {
        "text": "bitaw",
        "condition": "matches(bitwa|btaw|bitaww|btiaw)"
      }
    ]
  },
  {
    "id": "27.SUNDIN_SUNDAN",
    "name": "SUNDIN at SUNDAN",
    "pattern": [
      {
        "regex": "\\b(sndin|sundni|sudni)\\b"
      },
      {
  "regex": "\\b(sundna|sndan|sndna)\\b"
}
    ],
    "message": "'Sundin' ay nangangahulugang sumunod sa payo, samantalang 'Sundan' ay nangangahulugang tularan o pumunta sa pinuntahan ng iba.",
    "description": "'Sundin' ay nangangahulugang sumunod sa payo, samantalang 'Sundan' ay tularan o pumunta sa pinuntahan ng iba.",
    "example": "Sundin mo ang mga tagubilin ng iyong guro.",
    "suggestions": [
      {
        "text": "sundin",
        "condition": "matches(sndin|sundni|sudni)"
      },
      {
        "text": "sundan",
        "condition": "matches(sundna|sndan|sndna)"
      }
    ]
  },
  {
    "id": "28.TUNGTONG_TUNTONG_TUNTON",
    "name": "TUNGTONG, TUNTONG, at TUNTON",
    "pattern": [
      {
        "regex": "\\b(tngtong|tungtngo|tungtongg)\\b"
      },
      {
  "regex": "\\b(tuntngo|tntong|tnutong|tuntng)\\b"
},
{
  "regex": "\\b(tnton|tnuton|tuntno|tnutno|tuntn)\\b"
}
    ],
    "message": "'Tungtong' ay panakip sa palayok, 'Tuntong' ay pagyapak sa anumang bagay, at 'Tunton' ay pagbakas o paghanap sa bakas.",
    "description": "'Tungtong' ay panakip sa palayok. 'Tuntong' ay pagyapak sa bagay, at 'Tunton' ay pagbakas sa bakas.",
    "example": "Ang tuntong ng mga bata sa hagdang-bato ay malakas.",
    "suggestions": [
      {
        "text": "tungtong",
        "condition": "matches(tngtong|tungtngo|tungtongg)"
      },
      {
        "text": "tuntong",
        "condition": "matches(tuntngo|tntong|tnutong|tuntng)"
      },
      {
        "text": "tunton",
        "condition": "matches(tnton|tnuton|tuntno|tnutno|tuntn)"
      }
    ]
  },
  {
    "id": "29.SUBUKIN_SUBUKAN",
    "name": "SUBUKIN at SUBUKAN",
    "pattern": [
    {
      "regex": "\\b(subukam|subukn|subuka|subukn|subukin|sbukan)\\b",
      "description": "'Subukan' ito ay sa pagtingin nang palihim."
    },
    {
      "regex": "\\b(subukn|subuka|subukan|subukam|sbukin)\\b",
      "description": "'Subukin' ito ay sa pagtikim at pagkilatis."
    },
    ],
    "message": "'Subukin' ay pagsubok sa bisa ng isang bagay, samantalang 'Subukan' ay pagtingin upang malaman ang ginagawa ng iba.",
    "description": "'Subukin' ay nangangahulugang pagsubok sa bisa. 'Subukan' ay nangangahulugang tingnan ang ginagawa ng iba.",
    "example": "Subukan mo ang bagong resipe na ito.",
    "suggestions": [
      {
        "text": "subukin",
        "condition": "matches(subukn|subuka|subukan|subukam|sbukin)"
      },
      {
        "text": "subukan",
        "condition": "matches(subukam|subukn|subuka|subukn|subukin|sbukan)"
      }
    ]
  },
  {
    "id": "30.IKIT_IKOT",
    "name": "IKIT at IKOT",
    "pattern": [
      {
        "regex": "\\b(ikt|ikkit)\\b"
      },
      {
  "regex": "\\b(ikto|ikt|iktto|ikoot)\\b"
}
    ],
    "message": "'Ikit' ay paggilid mula sa labas patungo sa loob, samantalang 'Ikot' ay mula sa loob patungo sa labas.",
    "description": "'Ikit' ay ginagamit para sa paggalaw mula sa labas patungo sa loob. 'Ikot' ay mula sa loob patungo sa labas.",
    "example": "Nakatatlong ikit sila bago nila natunton ang daan palabas.",
    "suggestions": [
      {
        "text": "ikit",
        "condition": "matches(ikt|ikkit)"
      },
      {
        "text": "ikot",
        "condition": "matches(ikto|ikt|iktto|ikoot)"
      }
    ]
  },
  {
    "id": "31.SUNDIN_SUBUKAN",
    "name": "SUNDIN at SUBUKAN",
    "pattern": [
      {
        "regex": "\\b(sndin|sundni|sundn|sundnni)\\b"
      },
      {
  "regex": "\\b(sbukan|subukn|sbukan)\\b"
}
    ],
    "message": "'Sundin' ay sumunod sa payo, samantalang 'Subukan' ay tingnan kung paano ginagawa ng iba.",
    "description": "'Sundin' ay sumunod sa payo. 'Subukan' ay tingnan ang ginagawa ng iba.",
    "example": "Sundin ang mga tagubilin ng iyong guro. Subukan mo ang bagong metodo.",
    "suggestions": [
      {
        "text": "sundin",
        "condition": "matches(sndin|sundni|sundn|sundnni)"
      },
      {
        "text": "subukan",
        "condition": "matches(sbukan|subukn|sbukan)"
      }
    ]
  },
  {
    "id": "32.NABASAG_BINASAG",
    "name": "NABASAG at BINASAG",
    "pattern": [
            {
        "regex": "\\b(nbasag|nabasg|nabasga|nbasagg)\\b"
      },
      {
        "regex": "\\b(bnasag|binasg|bniasag|bnasagi)\\b"
      }
    ],
    "message": "'Nabasag' ay di sinasadyang pagkabasag, samantalang 'Binasag' ay sinadyang pagkabasag.",
    "description": "'Nabasag' ay nangyari dahil sa aksidente, habang 'Binasag' ay sinadyang pagkabasag.",
    "example": "Nabasag ko ang plato dahil sa pagmamadali. Binasag niya ang salamin dahil sa galit.",
    "suggestions": [
      {
        "text": "nabasag",
        "condition": "matches(nbasag|nabasg|nabasga|nbasagg)"
      },
      {
        "text": "binasag",
        "condition": "matches(bnasag|binasg|bniasag|bnasagi)"
      }
    ]
  },
  {
    "id": "33.BUMILI_MAGBILI",
    "name": "BUMILI at MAGBILI",
    "pattern": [
      {
        "regex": "\\b(bmuli|bumli|bumil|bmuuli)\\b"
      },
      {
  "regex": "\\b(magbli|mgbili|mgblii|magblii)\\b"
}
    ],
    "message": "'Bumili' ay nangangahulugang pagbili, samantalang 'Magbili' ay nangangahulugang pagbebenta.",
    "description": "'Bumili' ay pagbili, samantalang 'Magbili' ay pagbebenta.",
    "example": "Pumunta siya sa palengke upang bumili ng prutas. Ang kanyang negosyo ay magbili ng mga lumang kasangkapan.",
    "suggestions": [
      {
        "text": "bumili",
        "condition": "matches(bmuli|bumli|bumil|bmuuli)"
      },
      {
        "text": "magbili",
        "condition": "matches(magbli|mgbili|mgblii|magblii)"
      }
    ]
  },
  {
    "id": "34.KUMUHA_MANGUHA",
    "name": "KUMUHA at MANGUHA",
    "pattern": [
      {
        "regex": "\\b(kmuha|kmuuha|kumhua|kumuah)\\b"
      },
      {
  "regex": "\\b(mnguha|mangha|mnghau)\\b"
}
    ],
    "message": "'Kumuha' ay nangangahulugang pagkuha, samantalang 'Manguha' ay nangangahulugang pagtipon o pagkolekta.",
    "description": "'Kumuha' ay pagkuha ng isang bagay. 'Manguha' ay pagtipon o pagkolekta ng mga bagay.",
    "example": "Kumuha siya ng tubig mula sa gripo. Nanguha sila ng kabibe sa dalampasigan.",
    "suggestions": [
      {
        "text": "kumuha",
        "condition": "matches(kmuha|kmuuha|kumhua|kumuah)",
"description": "'Kumuha' ay nangangahulugang pagkuha."
      },
      {
        "text": "manguha",
        "condition": "matches(mnguha|mangha|mnghau)",
                "description": "'Manguha' ay nangangahulugang pagtipon o pagkolekta."
      }
    ]
  },
  {
    "id": "35.PUTULIN_PUTULAN",
    "name": "PUTULIN at PUTULAN",
    "pattern": [
      {
        "regex": "\\b(ptulin|putulni|ptuulin|ptulna)\\b"
      },
      {
  "regex": "\\b(ptulan|putulna|ptuulan|ptulna)\\b"
}
    ],
    "message": "'Putulin' ay paghinto sa isang bagay, samantalang 'Putulan' ay pagputol ng bagay gamit ang instrumento.",
    "description": "'Putulin' ay pag-tigil sa isang bagay na ginagawa, samantalang 'Putulan' ay pagputol gamit ang instrumento.",
    "example": "Putulin mo ang iyong bisyo. Putulan mo ang mahahabang buhok.",
    "suggestions": [
      {
        "text": "putulin",
        "condition": "matches(ptulin|putulni|ptuulin|ptulna)",
        "description": "'Putulin' ito ay paghinto sa isang bagay."
      },
      {
        "text": "putulan",
        "condition": "matches(ptulan|putulna|ptuulan|ptulna)",
        "description": "'Putulan' ay pagputol gamit ang instrumento."
      }
    ]
  },
  {
  "id": "36.opo_oho",
  "name": "OPO at OHO (PO, HO)",
  "pattern": [
    {
      "regex": "\\b(ppoo|oopo|opp|upu)\\b"
    },
    {
      "regex": "\\b(ohu|uhu|uho|ohu)\\b"
    }
  ],
  "message": "'Opo' ay mas pormal at ginagamit kapag ang kausap ay propesyunal o may mataas na katungkulan, samantalang 'Oho' ay di gaanong pormal at pangmasa ang gamit.",
  "description": "'Opo' ay ginagamit sa mas pormal na sitwasyon at sa mga taong may mataas na katungkulan, samantalang 'Oho' ay ginagamit sa mga di gaanong pormal na sitwasyon.",
  "example": "\"Magandang umaga po Gng. Tan,\" magalang na bati ng kanyang mga mag-aaral. \"Bili na ho kayo ng isda ko! Sariwa ho ito,\" panawagan ng tindera sa palengke.",
  "suggestions": [
    {
      "text": "opo",
      "condition": "matches(ppoo|oopo|opp|upu)",
      "description": "'Opo' ay mas pormal na paraan ng pagsang-ayon."
    },
    {
      "text": "oho",
      "condition": "matches(ohu|uhu|uho|ohu)",
      "description": "'Oho' ay mas di pormal na paraan ng pagsang-ayon."
    }
  ]
},
{
  "id": "37.tawagin_tawagan",
  "name": "TAWAGIN at TAWAGAN",
  "pattern": [
    {
      "regex": "\\b([Tt]wagin|[Tt]wgni|[Tt]awgni|[Tt]wagn)\\b"
    },
    {
      "regex": "(?<=,\\s?)\\b([Tt]wagan|[Tt]wgna|[Tt]awgn|[Tt]wgana)\\b"
    }
  ],
  "message": "'Tawagin' ay ginagamit para palapitin ang isang tao o hayop, samantalang 'Tawagan' ay ginagamit para kausapin o bigyan-pansin ang isang tao.",
  "description": "'Tawagin' ay para sa pagpapalapit ng isang tao o hayop, samantalang 'Tawagan' ay ginagamit kapag gusto mong makausap o bigyan ng atensyon ang isang tao.",
  "example": "Tawagin mo na si Connie, kakain na. Nilo, tawagan mo si Dan para malaman natin kung sasama siya.",
  "suggestions": [
    {
      "text": "Tawagin",
      "condition": "matches(Twagin|Twgni|Tawgni|Twagn)",
      "description": "'Tawagin' ay ginagamit para palapitin ang isang tao o hayop."
    },
    {
      "text": "tawagin",
      "condition": "matches(twagin|twgni|tawgni|twagn)",
      "description": "'tawagin' ay ginagamit para palapitin ang isang tao o hayop."
    },
    {
      "text": "Tawagan",
      "condition": "matches(Twagan|Twgna|Tawgn|Twgana)",
      "description": "'Tawagan' ay ginagamit para kausapin o bigyan-pansin ang isang tao."
    },
    {
      "text": "tawagan",
      "condition": "matches(twagan|twgna|tawgn|twgana)",
      "description": "'tawagan' ay ginagamit para kausapin o bigyan-pansin ang isang tao."
    },
    {
      "text": "Tawagan",
      "condition": "matches(?<=,\\s?Twagan|Twgna|Tawgn|Twgana)",
      "description": "'Tawagan' ay ginagamit lalo na pagkatapos ng isang listahan o pahabol na pahayag, upang bigyan ng atensyon ang isang tao."
    },
    {
      "text": "tawagan",
      "condition": "matches(?<=,\\s?twagan|twgna|tawgn|twgana)",
      "description": "'tawagan' ay ginagamit lalo na pagkatapos ng isang listahan o pahabol na pahayag, upang bigyan ng atensyon ang isang tao."
    }
  ]
}
,
{
  "id": "38.punasin_punasan",
  "name": "PUNASIN at PUNASAN",
  "pattern": [
    {
      "regex": "\\b([Pp]unsin|[Pp]unsan|[Pp]unasn|[Pp]nasi)\\b"
    },
    {
      "regex": "\\b([Pp]unsan|[Pp]unasn|[Pp]unasa)\\b"
    }
  ],
  "message": "'Punasin' ay ginagamit kapag binabanggit ang bagay na tinatanggal, samantalang 'Punasan' ay ginagamit kapag binabanggit ang bagay na pinagtatanggalan.",
  "description": "'Punasin' ay ginagamit para sa pag-aalis ng isang bagay na tinatanggal, samantalang 'Punasan' ay ginagamit kapag binabanggit ang bagay na pinagtatanggalan ng kung ano man.",
  "example": "Punasin mo ang alikabok sa mesa. Punasan mo ang mesa.",
  "suggestions": [
    {
      "text": "Punasin",
      "condition": "matches([Pp]unsin|[Pp]unsan|[Pp]unasn|[Pp]nasi)",
      "description": "'Punasin' ay ginagamit kapag binabanggit ang bagay na tinatanggal."
    },
    {
      "text": "Punasan",
      "condition": "matches([Pp]unsan|[Pp]unasn|[Pp]unasa)",
      "description": "'Punasan' ay ginagamit kapag binabanggit ang bagay na pinagtatanggalan."
    },
    {
      "text": "Punasin",
      "condition": "matches([Pp]unsin|[Pp]unsan|[Pp]unasn|[Pp]nasi) && matches([Pp]unsan|[Pp]unasn|[Pp]unasa)",
      "description": "'Punasin' ay ginagamit kapag binabanggit ang bagay na tinatanggal, at 'Punasan' ay ginagamit kapag binabanggit ang bagay na pinagtatanggalan."
    },
    {
  "text": "Punasan",
  "condition": "matches([Pp]unsin|[Pp]unsan|[Pp]unasn|[Pp]nasi) && matches([Pp]unsan|[Pp]unasn|[Pp]unasa)",
  "description": "'Punasin' ay ginagamit kapag binabanggit ang bagay na tinatanggal, at 'Punasan' ay ginagamit kapag binabanggit ang bagay na pinagtatanggalan."
}
  ]
}
,
{
  "id": "39.hatiin_hatian",
  "name": "HATIIN at HATIAN",
  "pattern": [
    {
      "regex": "\\b([Hh]ati|[Hh]atini|[Hh]tiin|[Hh]atnii)\\b"
    },
    {
      "regex": "\\b([Hh]natian|[Hh]ntaian|[Hh]inatina|[Hh]inatain|[Hh]atnai|[Hh]tian|[Hh]atiian)(?=\\s+niya)\\b"
    }
  ],
  "message": "'Hatiin' ay ginagamit kapag pinag-uusapan ang paghahati ng isang bagay, samantalang 'Hatian' ay ginagamit kapag pinag-uusapan ang pagbabahagi ng isang bagay.",
  "description": "'Hatiin' ay nangangahulugang pag-divide ng isang bagay, samantalang 'Hatian' ay nangangahulugang pag-share o pagbibigay ng bahagi ng isang bagay sa iba.",
  "example": "Hatiin mo sa amin ang pakwan. Hinatian niya ng kanyang hamburger ang namamalimos na bata.",
  "suggestions": [
    {
      "text": "hatiin",
      "condition": "matches(hati|hatini|htiin|hatnii)",
      "description": "'Hatiin' ay ginagamit kapag pinag-uusapan ang paghahati ng isang bagay."
    },
    {
      "text": "hatian",
      "condition": "matches(hatnai|htian|hatiian)",
      "description": "'Hatian' ay ginagamit kapag pinag-uusapan ang pagbabahagi ng isang bagay."
    },
    {
      "text": "hinatian",
      "condition": "matches(hnatian|hntaian|hinatina|hinatain)",
      "description": "'Hinatian' ay isang anyo ng 'Hatian' na nangangahulugang pagbibigay ng bahagi ng isang bagay sa iba, lalo na kapag may kasamang 'niya' na tumutukoy sa pagbibigay."
    },
    {
  "text": "Hatiin",
  "condition": "matches(Hati|Hatini|Htiin|Hatnii)",
  "description": "'Hatiin' ay ginagamit kapag pinag-uusapan ang paghahati ng isang bagay."
},
{
  "text": "Hatian",
  "condition": "matches(Hatnai|Htian|Htiian)",
  "description": "'Hatian' ay ginagamit kapag pinag-uusapan ang pagbabahagi ng isang bagay."
},
{
  "text": "hinatian",
  "condition": "matches(Hnatian|Hntaian|Hinatina|Hinatain)",
  "description": "'Hinatian' ay isang anyo ng 'Hatian' na nangangahulugang pagbibigay ng bahagi ng isang bagay sa iba, lalo na kapag may kasamang 'niya' na tumutukoy sa pagbibigay."
}
  ]
}
,
{
  "id": "DIN_DAW_DOON_DITO",
  "name": "Wastong Gamit ng Din/Daw/Doon/Dito",
  "pattern": [
    {
  "regex": "(\\w*[bcdfghjklmnpqrstvxzi]\\s)(rin|raw|roon|rito)\\b"
}

  ],
  "description": "Mas tamang gamitin ang 'din', 'daw', 'doon', o 'dito' dahil ang sinusundang salita ay nagtatapos sa katinig maliban sa 'w' at 'y'.",
  "suggestions": [
    {
      "text": "$1 din",
      "condition": "matches('rin')"
    },
    {
      "text": "$1 daw",
      "condition": "matches('raw')"
    },
    {
      "text": "$1 doon",
      "condition": "matches('roon')"
    },
    {
      "text": "$1 dito",
      "condition": "matches('rito')"
    }
  ]
}
,
{
  "id": "RIN_RAW_ROON_RITO",
  "name": "Wastong Gamit ng Rin/Raw/Roon/Rito",
  "pattern": [
    {
      "regex": "(?<=\\b\\w*[aeiourwy]\\s)(din|daw|doon|dito)\\b"
    }
  ],
  "description": "Mas tamang gamitin ang 'rin', 'raw', 'roon', o 'rito' dahil ang sinusundang salita ay nagtatapos sa patinig o malapatinig na 'w' at 'y'.",
  "suggestions": [
    {
      "text": "rin",
      "condition": "matches('din')"
    },
    {
      "text": "raw"
    },
    {
      "text": "roon",
      "condition": "matches('doon')"
    },
    {
      "text": "rito",
      "condition": "matches('dito')"
    }
  ]
},
{
  "id": "HYPHEN_USAGE",
  "name": "Hyphen Usage for Combined Words",
  "pattern": [
    {
      "regex": "\\b(lakad|pamatay|kaliwa|humigit|tahanan|dalaga|bahay)\\s(ng|sa|at|na|ay)\\s(takbo|insekto|kanan|kumulang|maligaya|bukid|aliwan)\\b"
    }
  ],
  "message": "Gumamit ng gitling (-) kapag may katagang kinaltas sa pagitan ng dalawang salitang pinagsama. Halimbawa: 'pamatay-insekto' mula sa 'pamatay ng insekto'.",
  "description": "Ginagamit ang gitling (-) kapag may katagang kinaltas sa pagitan ng dalawang salitang pinagsama, maliban kung ang pinagsamang salita ay nagbago ng kahulugan.",
  "example": "pamatay-insekto, kahoy-gubat, humigit-kumulang, dalagang-bukid",
  "suggestions": [
    {
      "text": "$1-$3",
      "condition": "matches('\\b(lakad|pamatay|kaliwa|humigit|tahanan|dalaga|bahay)\\s(ng|sa|at|na|ay)\\s(takbo|insekto|kanan|kumulang|maligaya|bukid|aliwan)\\b')"
    }
  ],
  "exceptions": [
    {
      "regex": "\\b(?:dalagangbukid|buntunghininga)\\b",
      "message": "Huwag gumamit ng gitling kung ang dalawang pinagsamang salita ay nagbago ng kahulugan (e.g., 'dalagangbukid' na isda o 'buntunghininga')."
    }
  ]
},
{
  "id": "KUDLIT_REPLACEMENT",
  "name": "Kudlit Replacement",
  "pattern": [
{
  "regex": "(\\b(\\w+)t-(\\2)\\b)"  // Matches "ibat-iba" where the first word is "ibat" and the second word is "iba", without including the hyphen in the first word
}


  ],
  "message": "Gumamit ng kudlit (’) sa pagitan ng dalawang salita kapag may nawawalang letra/letra. Halimbawa: 'tuwa’t hapis' mula sa 'tuwa at hapis'.",
  "description": "Ang kudlit (') ay ginagamit upang ipakita ang pagtanggal ng mga letra o bahagi ng mga salita kapag pinagsasama ang mga ito.",
  "example": "tuwa’t hapis, kaliwa’t kanan, tayo’y aalis, tahana’y maligaya",
  "suggestions": [
    
    {
  "text": "$2't $3",
  "condition": "matches('\\b(\\w+)t-(\\2)\\b')"
}
  ]
},
{
  "id": "KUDLIT_REPLACEMENT",
  "name": "Kudlit Replacement",
  "pattern": [
    {
  "regex": "(\\b(\\w+)t\\s+(\\2)\\b)" 
}


  ],
  "message": "Gumamit ng kudlit (’) sa pagitan ng dalawang salita kapag may nawawalang letra/letra. Halimbawa: 'tuwa’t hapis' mula sa 'tuwa at hapis'.",
  "description": "Ang kudlit (') ay ginagamit upang ipakita ang pagtanggal ng mga letra o bahagi ng mga salita kapag pinagsasama ang mga ito.",
  "example": "tuwa’t hapis, kaliwa’t kanan, tayo’y aalis, tahana’y maligaya",
  "suggestions": [
    {
      "text": "$2't $3",
      "condition": "matches('\\b(\\w+)t\\s+(\\2)\\b')"
    }
  ]
}
,
  {
    "id": "8.IKAWY",
    "name": "IKAW'Y",
    "pattern": [
      {
        "regex": "\\b[Ii]kawy\\b"
      }
    ],
    "message": "Gamitin ang 'higit' para sa comparative na pang-uri; 'higit pa' para sa pagdaragdag o pagpapalakas ng kaalaman.",
    "description": "Ang kudlit (') ay ginagamit upang ipakita ang pagtanggal ng mga letra o bahagi ng mga salita kapag pinagsasama ang mga ito.",
    "examples": [
      { "incorrect": "ikaw'y mas mabuti", "correct": "higit ikaw'y mas mabuti" }
    ],
    "suggestions": [
      {
        "text": "ikaw'y",
        "condition": "matches(ikawy)"
      },
      {
  "text": "Ikaw'y",
  "condition": "matches(Ikawy)"
}
    ]
  },
  {
    "id": "8.IKAY",
    "name": "IKAY",
    "pattern": [
      {
        "regex": "\\b[Ii]kay\\b"
      }
    ],
    "message": "Gamitin ang 'higit' para sa comparative na pang-uri; 'higit pa' para sa pagdaragdag o pagpapalakas ng kaalaman.",
    "description": "Ang kudlit (') ay ginagamit upang ipakita ang pagtanggal ng mga letra o bahagi ng mga salita kapag pinagsasama ang mga ito.",
    "examples": [
      { "incorrect": "ikay mas mabuti", "correct": "higit ikay mas mabuti" }
    ],
    "suggestions": [
      {
  "text": "ika'y",
  "condition": "matches(ikay)"
},
{
  "text": "Ika'y",
  "condition": "matches(Ikay)"
}
    ]
  },
  {
    "id": "8.TAYOY",
    "name": "TAYO'Y",
    "pattern": [
      {
        "regex": "\\b[Tt]ayoy\\b"
      }
    ],
    "message": "Gamitin ang 'higit' para sa comparative na pang-uri; 'higit pa' para sa pagdaragdag o pagpapalakas ng kaalaman.",
    "description": "Ang kudlit (') ay ginagamit upang ipakita ang pagtanggal ng mga letra o bahagi ng mga salita kapag pinagsasama ang mga ito.",
    "examples": [
      { "incorrect": "tayo'y mas mabuti", "correct": "higit tayo'y mas mabuti" }
    ],
    "suggestions": [
      {
  "text": "tayo'y",
  "condition": "matches(tayoy)"
},
{
  "text": "Tayo'y",
  "condition": "matches(Tayoy)"
}
    ]
  },
  {
    "id": "8.AKOY",
    "name": "AKO'Y",
    "pattern": [
      {
        "regex": "\\b[Aa]koy\\b"
      }
    ],
    "message": "Gamitin ang 'higit' para sa comparative na pang-uri; 'higit pa' para sa pagdaragdag o pagpapalakas ng kaalaman.",
    "description": "Ang kudlit (') ay ginagamit upang ipakita ang pagtanggal ng mga letra o bahagi ng mga salita kapag pinagsasama ang mga ito.",
    "examples": [
      { "incorrect": "ako'y mas mabuti", "correct": "higit ako'y mas mabuti" }
    ],
    "suggestions": [
      {
  "text": "ako'y",
  "condition": "matches(akoy)"
},
{
  "text": "Ako'y",
  "condition": "matches(Akoy)"
}
    ]
  },
  {
    "id": "8.SIYAY",
    "name": "SIYA'Y",
    "pattern": [
      {
        "regex": "\\b[Ss]iyay\\b"
      }
    ],
    "message": "Gamitin ang 'higit' para sa comparative na pang-uri; 'higit pa' para sa pagdaragdag o pagpapalakas ng kaalaman.",
    "description": "Ang kudlit (') ay ginagamit upang ipakita ang pagtanggal ng mga letra o bahagi ng mga salita kapag pinagsasama ang mga ito.",
    "examples": [
      { "incorrect": "siya'y mas mabuti", "correct": "higit siya'y mas mabuti" }
    ],
    "suggestions": [
      {
  "text": "siya'y",
  "condition": "matches(siyay)"
},
{
  "text": "Siya'y",
  "condition": "matches(Syay)"
}
    ]
  }

,
{
  "id": "IKA_PREFIX_USAGE",
  "name": "Usage of 'Ika-' Prefix with Numbers and Words",
  "pattern": [
    {
        "regex": "\\b(ika)-?isa\\b"
    },
    {
        "regex": "\\b(ika)-?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?apat\\b"
    },
    {
        "regex": "\\b(ika)-?lima\\b"
    },
    {
        "regex": "\\b(ika)-?anim\\b"
    },
    {
        "regex": "\\b(ika)-?pito\\b"
    },
    {
        "regex": "\\b(ika)-?walo\\b"
    },
    {
        "regex": "\\b(ika)-?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?sampu\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?labing(?:-)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?dalawampu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?tatlumpu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?apatnapu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?limampu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?animnapu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?pitumpu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?walumpu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?isa\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?dalawa\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?tatlo\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?apat\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?lima\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?anim\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?pito\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?walo\\b"
    },
    {
        "regex": "\\b(ika)-?siyamnapu(?:'t)?siyam\\b"
    },
    {
        "regex": "\\b(ika)-?isandaan\\b"
    },
    {
        "regex": "\\b(ika)-?\\d+\\b"
    }
],
  "message": "Gumamit ng tamang gitling (-) at numero pagkatapos ng 'ika-' kapag iniunlapi ito sa mga numero o salitang pamilang. Halimbawa: 'ika-1', 'ika-10'.",
  "description": "Ginagamit ang gitling (-) at ang tamang numero pagkatapos ng 'ika-' kapag iniunlapi ito sa numero o salitang pamilang.",
  "example": "ika-1, ika-2, ika-3, ika-4, ika-5, ika-6, ika-7, ika-8, ika-9, ika-10, ika-11, ika-12, ika-13, ... ika-100",
  "suggestions": [
    {
      "text": "ika-1",
      "condition": "matches('\\b(ika)-?isa\\b')"
    },
    {
      "text": "ika-2",
      "condition": "matches('\\b(ika)-?dalawa\\b')"
    },
    {
      "text": "ika-3",
      "condition": "matches('\\b(ika)-?tatlo\\b')"
    },
    {
      "text": "ika-4",
      "condition": "matches('\\b(ika)-?apat\\b')"
    },
    {
      "text": "ika-5",
      "condition": "matches('\\b(ika)-?lima\\b')"
    },
    {
      "text": "ika-6",
      "condition": "matches('\\b(ika)-?anim\\b')"
    },
    {
      "text": "ika-7",
      "condition": "matches('\\b(ika)-?pito\\b')"
    },
    {
      "text": "ika-8",
      "condition": "matches('\\b(ika)-?walo\\b')"
    },
    {
      "text": "ika-9",
      "condition": "matches('\\b(ika)-?siyam\\b')"
    },
    {
      "text": "ika-10",
      "condition": "matches('\\b(ika)-?sampu\\b')"
    },
    {
      "text": "ika-11",
      "condition": "matches('\\b(ika)-?labing(?:-)?isa\\b')"
    },
    {
      "text": "ika-12",
      "condition": "matches('\\b(ika)-?labing(?:-)?dalawa\\b')"
    },
    {
      "text": "ika-13",
      "condition": "matches('\\b(ika)-?labing(?:-)?tatlo\\b')"
    },
    {
      "text": "ika-14",
      "condition": "matches('\\b(ika)-?labing(?:-)?apat\\b')"
    },
    {
      "text": "ika-15",
      "condition": "matches('\\b(ika)-?labing(?:-)?lima\\b')"
    },
    {
      "text": "ika-16",
      "condition": "matches('\\b(ika)-?labing(?:-)?anim\\b')"
    },
    {
      "text": "ika-17",
      "condition": "matches('\\b(ika)-?labing(?:-)?pito\\b')"
    },
    {
      "text": "ika-18",
      "condition": "matches('\\b(ika)-?labing(?:-)?walo\\b')"
    },
    {
      "text": "ika-19",
      "condition": "matches('\\b(ika)-?labing(?:-)?siyam\\b')"
    },
    {
      "text": "ika-20",
      "condition": "matches('\\b(ika)-?dalawampu\\b')"
    },
    {
      "text": "ika-21",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-22",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-23",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-24",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-25",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-26",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-27",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-28",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-29",
      "condition": "matches('\\b(ika)-?dalawampu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-30",
      "condition": "matches('\\b(ika)-?tatlumpu\\b')"
    },
    {
      "text": "ika-31",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-32",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-33",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-34",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-35",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-36",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-37",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-38",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-39",
      "condition": "matches('\\b(ika)-?tatlumpu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-40",
      "condition": "matches('\\b(ika)-?apatnapu\\b')"
    },
    {
      "text": "ika-41",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-42",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-43",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-44",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-45",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-46",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-47",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-48",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-49",
      "condition": "matches('\\b(ika)-?apatnapu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-50",
      "condition": "matches('\\b(ika)-?limampu\\b')"
    },
    {
      "text": "ika-51",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-52",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-53",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-54",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-55",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-56",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-57",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-58",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-59",
      "condition": "matches('\\b(ika)-?limampu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-60",
      "condition": "matches('\\b(ika)-?animnapu\\b')"
    },
    {
      "text": "ika-61",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-62",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-63",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-64",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-65",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-66",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-67",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-68",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-69",
      "condition": "matches('\\b(ika)-?animnapu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-70",
      "condition": "matches('\\b(ika)-?pitumpu\\b')"
    },
    {
      "text": "ika-71",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-72",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-73",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-74",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-75",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-76",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-77",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-78",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-79",
      "condition": "matches('\\b(ika)-?pitumpu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-80",
      "condition": "matches('\\b(ika)-?walumpu\\b')"
    },
    {
      "text": "ika-81",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-82",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-83",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-84",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-85",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-86",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-87",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-88",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-89",
      "condition": "matches('\\b(ika)-?walumpu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-90",
      "condition": "matches('\\b(ika)-?siyamnapu\\b')"
    },
    {
      "text": "ika-91",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?isa\\b')"
    },
    {
      "text": "ika-92",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?dalawa\\b')"
    },
    {
      "text": "ika-93",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?tatlo\\b')"
    },
    {
      "text": "ika-94",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?apat\\b')"
    },
    {
      "text": "ika-95",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?lima\\b')"
    },
    {
      "text": "ika-96",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?anim\\b')"
    },
    {
      "text": "ika-97",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?pito\\b')"
    },
    {
      "text": "ika-98",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?walo\\b')"
    },
    {
      "text": "ika-99",
      "condition": "matches('\\b(ika)-?siyamnapu(?:'t)?siyam\\b')"
    },
    {
      "text": "ika-100",
      "condition": "matches('\\b(ika)-?isandaan\\b')"
    }
  ]
}
/* {
  "id": "HYPHENATED_LAST_NAMES",
  "name": "Hyphenated Last Names for Married Women",
  "description": "Ginagamit ang gitling '-'kapag pinagkakabit o pinagsasama ang apelyido ng babae at ng kanyang bana o asawa",
  "pattern": [
    {
      "regex": "\\\u200B\\s*([A-Z][a-z]+)\\s+([A-Z][a-z]+)\\s+([A-Z][a-z]+)\\s*\\\u200B"
    }
  ],
  "message": "Ang mga pangalan ay may mga panaklong. Siguraduhing tama ang paggamit ng gitling (-) sa pagitan ng mga apelyido kapag pinagsasama ang apelyido ng babae at ng kanyang asawa. Halimbawa: '(Gloria Macapagal-Arroyo)'.",
  "description": "Ang rule na ito ay para sa tamang paggamit ng gitling sa pagitan ng apelyido ng babae at ng kanyang asawa kung nakapaloob sa panaklong.",
  "example": "(Gloria Macapagal Arroyo)",
  "suggestions": [
    {
      "text": "($1 $2-$3)",
      "condition": "matches('^\\\u200B\\s*([A-Z][a-z]+)\\s+([A-Z][a-z]+)\\s+([A-Z][a-z]+)\\s*\\\u200B')"
    },
    {
  "text": "$1 $2-$3",
  "condition": "matches('^\\\u200B\\s*([A-Z][a-z]+)\\s+([A-Z][a-z]+)\\s+([A-Z][a-z]+)\\s*\\\u200B')"
}
  ]
}
*/
,
{
  "id": "PANAKLONG_CLARIFICATION",
  "name": "Gumamit ng Panaklong para sa Paglilinaw",
  "description": "Ginagamit ang panaklong () na pambukod sa salita o mga salitang hindi direktang kaugnay ng diwa ng pangungusap, o mga pamuno",
  "pattern": [
    {
  "regex": "(?<!\\b(?:na\\s+si|si)\\s)\\s*(Jose Rizal|Andres Bonifacio|Manuel Quezon|Emilio Aguinaldo|Lapu Lapu|Antonio Luna|Melchora Aquino|Gabriela Silang|Apolinario Mabini|Juan Luna|Pedro Paterno|Felipe Agoncillo|Julian Felipe|Carlos Romulo|Diosdado Macapagal|Ferdinand Marcos|Corazon Aquino|Ramon Magsaysay|Elpidio Quirino|Sergio Osmeña|Jose Laurel|Manuel Roxas|Benigno Aquino|Leandro Locsin|Juan Nakpil|Francisco Balagtas|Fernando Amorsolo|Lucio San Pedro|Francisco Santiago|Lorenzo Ruiz|Claro Recto|Teodoro Agoncillo|Ninoy Aquino|Manny Pacquiao|Risa Hontiveros|Grace Poe|Bam Aquino|Lito Atienza|Isko Moreno|Sara Duterte|Ping Lacson|Leni Robredo|Chiz Escudero|Erap Estrada|Mar Roxas|Jejomar Binay|Gloria Macapagal|Alan Cayetano|Vicente Sotto|Imee Marcos|Ramon Mitra|Koko Pimentel|Cesar Virata|Jojo Binay|Nene Pimentel|Sonny Angara|Ralph Recto|Jun Evasco|Tony Tan|Alfredo Lim|Tommy Osmeña|Cory Aquino|Pepe Diokno|Lito Lapid|Roilo Golez|Jun Abaya|Jess Dureza|Nikki Coseteng|Rodolfo Biazon|Joey Lina|Jinggoy Estrada|Kris Aquino|Fidel Ramos|Marcial Lichauco|Raul Roco|Butch Abad|Manuel Villar|Rene Saguisag|Jesse Robredo|Miro Quimbo|Erwin Tulfo|Sonny Belmonte|Gary Alejano|Mark Villar|Dick Gordon|Ping Lacson|Lito Banayo|Mike Defensor|Vicente Sotto|Enrile Reyes|Ramon Ang|Luis Singson|Erin Tañada|Frank Drilon|Diosdado Cabangon|Joey Salceda|Rodante Marcoleta|Miriam Defensor|Aimee Marcos|Paolo Duterte|Harry Roque|Nancy Binay|Bong Go|Grace Padaca|Rene Cayetano|Feliciano Belmonte|Orly Mercado|Dante Fascinillo|Gina Lopez|Benhur Abalos|Loren Legarda|Teddy Baguilat|Alan Peter|Francis Tolentino|Mark Cojuangco|Manny Villar|Imelda Marcos|Bongbong Marcos|Gloria Arroyo|Juan Ponce|Bam Aquino|Noynoy Aquino|Bong Revilla|Lani Mercado|JV Ejercito|Jinggoy Estrada|Joseph Estrada|Sarah Duterte|Rodrigo Duterte|Gwen Garcia|Pablo Garcia|Jack Enrile|Juan Enrile|Cynthia Villar|Mark Villar|Nancy Binay|Abby Binay|Toby Tiangco|Ruffy Biazon|Teofisto Guingona|Migz Zubiri|Gibo Teodoro|Neptali Gonzales|Lino Cayetano|Pia Cayetano|Chavit Singson|Danilo Suarez|Prospero Nograles|Pantaleon Alvarez|Martin Romualdez|Jolo Revilla|Ramon Revilla|Rico Puno|Gilbert Teodoro|Alfred Romualdez|Bebot Alvarez|Butz Aquino|Jose Ma\\. Zubiri|Teofisto Guingona|Carlos Padilla|Ronnie Zamora|Del De Guzman|Chiz Escudero|Peping Cojuangco|Gilbert Remulla|Emmanuel Pacquiao|Isidro Ungab|Daisy Avance)\\b"
}
  ],
  "message": "Gumamit ng panaklong () upang kulungin ang paglilinaw sa pangungusap. Halimbawa: Ang pambansang pangulo (Bong Bong Marcos) ang may-akda ng Noli Me Tangere.",
  "suggestions": [

    {
      "text": "($1)",
      "description": "Wrap the matched name in parentheses.",
      "condition": "matches('(?<!\\b(?:na\\s+si|si)\\s)(Jose Rizal|Andres Bonifacio|Manuel Quezon|Emilio Aguinaldo|Lapu Lapu|Antonio Luna|Melchora Aquino|Gabriela Silang|Apolinario Mabini|Juan Luna|Pedro Paterno|Felipe Agoncillo|Julian Felipe|Carlos Romulo|Diosdado Macapagal|Ferdinand Marcos|Corazon Aquino|Ramon Magsaysay|Elpidio Quirino|Sergio Osmeña|Jose Laurel|Manuel Roxas|Benigno Aquino|Leandro Locsin|Juan Nakpil|Francisco Balagtas|Fernando Amorsolo|Lucio San Pedro|Francisco Santiago|Lorenzo Ruiz|Claro Recto|Teodoro Agoncillo|Ninoy Aquino|Manny Pacquiao|Risa Hontiveros|Grace Poe|Bam Aquino|Lito Atienza|Isko Moreno|Sara Duterte|Ping Lacson|Leni Robredo|Chiz Escudero|Erap Estrada|Mar Roxas|Jejomar Binay|Gloria Macapagal|Alan Cayetano|Vicente Sotto|Imee Marcos|Ramon Mitra|Koko Pimentel|Cesar Virata|Jojo Binay|Nene Pimentel|Sonny Angara|Ralph Recto|Jun Evasco|Tony Tan|Alfredo Lim|Tommy Osmeña|Cory Aquino|Pepe Diokno|Lito Lapid|Roilo Golez|Jun Abaya|Jess Dureza|Nikki Coseteng|Rodolfo Biazon|Joey Lina|Jinggoy Estrada|Kris Aquino|Fidel Ramos|Marcial Lichauco|Raul Roco|Butch Abad|Manuel Villar|Rene Saguisag|Jesse Robredo|Miro Quimbo|Erwin Tulfo|Sonny Belmonte|Gary Alejano|Mark Villar|Dick Gordon|Ping Lacson|Lito Banayo|Mike Defensor|Vicente Sotto|Enrile Reyes|Ramon Ang|Luis Singson|Erin Tañada|Frank Drilon|Diosdado Cabangon|Joey Salceda|Rodante Marcoleta|Miriam Defensor|Aimee Marcos|Paolo Duterte|Harry Roque|Nancy Binay|Bong Go|Grace Padaca|Rene Cayetano|Feliciano Belmonte|Orly Mercado|Dante Fascinillo|Gina Lopez|Benhur Abalos|Loren Legarda|Teddy Baguilat|Alan Peter|Francis Tolentino|Mark Cojuangco|Manny Villar|Imelda Marcos|Bongbong Marcos|Gloria Arroyo|Juan Ponce|Bam Aquino|Noynoy Aquino|Bong Revilla|Lani Mercado|JV Ejercito|Jinggoy Estrada|Joseph Estrada|Sarah Duterte|Rodrigo Duterte|Gwen Garcia|Pablo Garcia|Jack Enrile|Juan Enrile|Cynthia Villar|Mark Villar|Nancy Binay|Abby Binay|Toby Tiangco|Ruffy Biazon|Teofisto Guingona|Migz Zubiri|Gibo Teodoro|Neptali Gonzales|Lino Cayetano|Pia Cayetano|Chavit Singson|Danilo Suarez|Prospero Nograles|Pantaleon Alvarez|Martin Romualdez|Jolo Revilla|Ramon Revilla|Rico Puno|Gilbert Teodoro|Alfred Romualdez|Bebot Alvarez|Butz Aquino|Jose Ma\\. Zubiri|Teofisto Guingona|Carlos Padilla|Ronnie Zamora|Del De Guzman|Chiz Escudero|Peping Cojuangco|Gilbert Remulla|Emmanuel Pacquiao|Isidro Ungab|Daisy Avance)\\b')"
    }
  ]
}
,
{
  "id": "PANAKLONG_CLARIFICATION",
  "name": "Gumamit ng Panaklong para sa Paglilinaw",
  "description": 'Ginagamit ang panipi " " upang mabigyan diin ang pamagat ng isang pahayagan, magasin, aklatat iba’t ibang mga akda.',
  "pattern": [
    {
      "regex": "\\b(Manila Times|Philippine Star|Inquirer\\.net|Rappler|ABS-CBN News|GMA News|BusinessMirror|SunStar|Daily Tribune|Tempo|Philippine Daily Inquirer|The Standard|News5|Malaya|BusinessWorld|The Manila Bulletin|Mindanao Times|The Freeman|The Philippine Post|Hataw|The Philippine Star|Philippine News Agency|CNN Philippines)\\b"
    },
    {
      "regex": "\\b(Computer Programming|Software Development|Information Technology|Data Science|Artificial Intelligence|Machine Learning|Cybersecurity|Web Development|Database Management|System Analysis|Computer Engineering|Networking|Cloud Computing|Software Engineering|Algorithm Design|Programming Languages|Data Structures|Operating Systems|Human-Computer Interaction|Software Testing|Mobile Development|Game Development|Project Management|IT Consulting|Tech Support|UI/UX Design|Computer Graphics|Digital Marketing|E-commerce|Network Administration|IT Infrastructure|DevOps|Business Intelligence|Data Analytics|Blockchain Technology)\\b"
    }
  ],
  "message": "Gumamit ng panaklong () upang kulungin ang paglilinaw sa pangungusap. Halimbawa: Ang pambansang pangulo (Bong Bong Marcos) ang may-akda ng Noli Me Tangere.",
  "suggestions": [
    {
      "text": '"$1"',
      "description": "No need to add parentheses as the phrase is already enclosed in parentheses.",
      "condition": "matches('\\b(Manila Times|Philippine Star|Inquirer\\.net|Rappler|ABS-CBN News|GMA News|BusinessMirror|SunStar|Daily Tribune|Tempo|Philippine Daily Inquirer|The Standard|News5|Malaya|BusinessWorld|The Manila Bulletin|Mindanao Times|The Freeman|The Philippine Post|Hataw|The Philippine Star|Philippine News Agency|CNN Philippines)\\b')"
    },
    {
      "text": '"$1"',
      "description": "No need to add parentheses as the phrase is already enclosed in parentheses.",
      "condition": "matches('\\b(Computer Programming|Software Development|Information Technology|Data Science|Artificial Intelligence|Machine Learning|Cybersecurity|Web Development|Database Management|System Analysis|Computer Engineering|Networking|Cloud Computing|Software Engineering|Algorithm Design|Programming Languages|Data Structures|Operating Systems|Human-Computer Interaction|Software Testing|Mobile Development|Game Development|Project Management|IT Consulting|Tech Support|UI/UX Design|Computer Graphics|Digital Marketing|E-commerce|Network Administration|IT Infrastructure|DevOps|Business Intelligence|Data Analytics|Blockchain Technology)\\b')"
    }
  ]
}
,
{
  "id": "A3",
  "name": "Gamit ng Tutuldok",
  "description": "Pagwawasto ng paggamit ng tutuldok matapos ang mga salitang ng halimbawa: tulad ng 'tulad ng: '.",
  "pattern": [
    {
      "regex": "(tulad ng|gaya ng| halimbawa ng|saka ng|paris ng|halimbawa)"
    }
  ],
  "message": "Gumamit ng tutuldok (:) matapos ang mga salitang 'tulad ng'.",
  "suggestions": [
    {
      "text": "$1:",
      "description": "Maglagay ng tutuldok pagkatapos ng 'tulad ng'."
    }
  ],
  "examples": [
    { 
      "incorrect": "Maraming halaman ang namumulaklak sa hardin tulad ng Rosal, Rosas, Orchids, Sampaguita, Santan at iba pa.", 
      "correct": "Maraming halaman ang namumulaklak sa hardin tulad ng: Rosal, Rosas, Orchids, Sampaguita, Santan at iba pa."
    }
  ]
},
{
  "id": "A4",
  "name": "Gamit ng Tutuldok sa Bating Panimula",
  "description": "Pagwawasto ng paggamit ng tutuldok pagkatapos ng bating panimula sa pormal na liham o liham-pangangalakal.",
  "pattern": [
    {
      "regex": "\\b(Dr|Bb|G\\.|Gng|Mr|Mrs|Ms|Engr|Atty)\\.\\s+([A-Z][a-zA-Z]*)"
    }
  ],
  "message": "Gumamit ng tutuldok (:) pagkatapos ng bating panimula sa pormal na liham.",
  "suggestions": [
    {
      "text": "$1. $2:",
      "description": "Maglagay ng tutuldok pagkatapos ng pangalan kung isang salita lamang.",
      "condition": "matches('\\b(Dr|Bb|G\\.|Gng|Mr|Mrs|Ms|Engr|Atty)\\.\\s+([A-Z][a-zA-Z]*)')"
    }
  ],
  "examples": [
    { 
      "incorrect": "Dr. Garcia", 
      "correct": "Dr. Garcia:" 
    },
    { 
      "incorrect": "Bb. Zorilla", 
      "correct": "Bb. Zorilla:" 
    },
    { 
      "incorrect": "Dr. Jose Rizal", 
      "correct": "Dr. Jose Rizal:" 
    },
    {
      "incorrect": "Bb. Marley",
      "correct": "Bb. Marley:"
    },
    {
      "incorrect": "Bb. Gloria",
      "correct": "Bb. Gloria:"
    }
  ]
},
{
  "id": "A5",
  "name": "Pagwawasto ng Pagkakalagay ng Tutuldok sa Oras at Mga Mali sa Oras",
  "description": "Pagwawasto ng mga maling format ng oras sa pamamagitan ng tamang paggamit ng tutuldok (:) at mga wastong halaga para sa oras at minuto.",
  "pattern": [
    {
  "regex": "\\b(0?[1-9]|1[0-2])(\\d{2})\\s*(am|pm|a\\.m\\.|p\\.m\\.)\\b"
}

  ],
  "message": "Gumamit ng tutuldok (:) at tiyaking tama ang oras sa format na oras o military time (00:00-23:59).",
  "suggestions": [
    {
  "text": "$1:$2 $3",
  "description": "Format the time correctly with a colon separator and include AM/PM.",
  "condition": "matches('\\b(0?[1-9]|1[0-2])(\\d{2})\\s*(am|pm|a\\.m\\.|p\\.m\\.)\\b')"
}

  ],
  "examples": [
    {
      "incorrect": "290",
      "correct": "2:30 a.m."
    },
    {
      "incorrect": "1225 pm",
      "correct": "12:25 p.m."
    },
    {
      "incorrect": "845 am",
      "correct": "8:45 a.m."
    },
    {
      "incorrect": "150 pm",
      "correct": "1:50 p.m."
    },
    {
      "incorrect": "1430",
      "correct": "14:30"
    }
  ]
}
,
{
  "id": "A6",
  "name": "Pagwawasto ng Format ng Bible Verse",
  "description": "Pagwawasto ng mga maling format ng Bible verse sa pamamagitan ng paglalagay ng tamang tutuldok (:) sa pagitan ng kabanata at taludtod, pati na rin ang mga saklaw ng taludtod.",
  "pattern": [
    {
      "regex": "\\b([Gg]enesis|[Ee]xodus|[Ll]eviticus|[Nn]umbers|[Dd]euteronomy|[Jj]oshua|[Jj]udges|[Rr]uth|[1Ii]?[Ss]amuel|[2Ii]?[Ss]amuel|[1Ii]?[Kk]ings|[2Ii]?[Kk]ings|[1Ii]?[Cc]hronicles|[2Ii]?[Cc]hronicles|[Ee]zra|[Nn]ehemiah|[Ee]sther|[Jj]ob|[Pp]salms|[Pp]roverbs|[Ee]cclesiastes|[Ss]ong\\s[Oo]f\\s[Ss]olomon|[Ii]saiah|[Jj]eremiah|[Ll]amentations|[Ee]zekiel|[Dd]aniel|[Hh]osea|[Jj]oel|[Aa]mos|[Oo]badiah|[Jj]onah|[Mm]icah|[Nn]ahum|[Hh]abakkuk|[Zz]ephaniah|[Hh]aggai|[Zz]echariah|[Mm]alachi|[Mm]atthew|[Mm]ark|[Ll]uke|[Jj]ohn|[Aa]cts|[Rr]omans|[1Ii]?[Cc]orinthians|[2Ii]?[Cc]orinthians|[Gg]alatians|[Ee]phesians|[Pp]hilippians|[Cc]olossians|[1Ii]?[Tt]hessalonians|[2Ii]?[Tt]hessalonians|[1Ii]?[Tt]imothy|[2Ii]?[Tt]imothy|[Tt]itus|[Pp]hilemon|[Hh]ebrews|[Jj]ames|[1Ii]?[Pp]eter|[2Ii]?[Pp]eter|[1Ii]?[Jj]ohn|[2Ii]?[Jj]ohn|[3Ii]?[Jj]ohn|[Jj]ude|[Rr]evelation)\\s*(\\d{1,2})(\\d{2,3})\\b"
    }
  ],
  "message": "Gumamit ng tutuldok (:) sa pagitan ng kabanata at taludtod, at tiyaking tama ang format ng saklaw ng taludtod.",
  "suggestions": [
    {
      "text": "$1 $2:$3",
      "description": "Ilapat ang tamang format bilang kabanata:taludtod (ex. Genesis 31:2).",
      "condition": "matches('\\b(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\\s*(\\d{1,2})(\\d{2})\\b')"
    },
    {
      "text": "$1 $2:$3",
      "description": "Kapag ang numero ay binubuo ng tatlong bahagi, hatiin bilang kabanata at taludtod (ex. Genesis 3:12).",
      "condition": "matches('\\b(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\\s*(\\d{1})(\\d{2,3})\\b')"
    }
  ],
  "examples": [
    {
      "incorrect": "Matthew 310",
      "correct": [
        "Matthew 3:10"
      ]
    },
    {
      "incorrect": "John 113",
      "correct": [
        "John 11:3"
      ]
    },
    {
      "incorrect": "John 129",
      "correct": [
        "John 1:29"
      ]
    },
    {
      "incorrect": "John 428",
      "correct": [
        "John 4:28"
      ]
    },
    {
      "incorrect": "Genesis 312",
      "correct": [
        "Genesis 3:12"
      ]
    },
    {
      "incorrect": "Genesis 3112",
      "correct": [
        "Genesis 31:12"
      ]
    }
  ]
},
/*{
  "id": "PANAKLONG_YEARS",
  "name": "Gumamit ng Panaklong para sa Taon",
  "description": "Gumamit ng panaklong () upang kulungin ang mga pamilang na nagpapahayag ng taon, at tiyaking tama ang spacing sa pagitan ng mga taon at dash para sa mga saklaw ng taon.",
  "pattern": [
    {
      "regex": "\\b(\\d{4}\\s*-\\s*\\d{4})\\b"
    },
    {
      "regex": "\\b(\\d{4})\\b"
    }
  ],
  "message": "Ilagay ang mga taon sa loob ng panaklong, at tiyaking tama ang spacing sa pagitan ng mga taon at dash para sa mga saklaw. Halimbawa: Jose P. Rizal (1861 – 1896).",
  "suggestions": [
    {
      "text": "($1)",
      "description": "Ilagay ang mga taon sa loob ng panaklong na may tamang spacing (ex. (1861 – 1896)).",
      "condition": "matches('\\b(\\d{4}\\s*-\\s*\\d{4})\\b')"
    },
    {
      "text": "($1)",
      "description": "Ilagay ang taon sa loob ng panaklong (ex. (1861)).",
      "condition": "matches('\\b(\\d{4})\\b')"
    }
  ],
  "examples": [
    {
      "incorrect": "Jose P. Rizal 1861 – 1896",
      "correct": "Jose P. Rizal (1861 – 1896)"
    },
    {
      "incorrect": "Ang kanyang buhay ay mula 1861–1896",
      "correct": "Ang kanyang buhay ay mula (1861–1896)"
    },
    {
      "incorrect": "Kilala siya mula 1861 to 1896",
      "correct": "Kilala siya mula (1861 – 1896)"
    },
    {
      "incorrect": "Ito ay naganap noong 1880 - 1890",
      "correct": "Ito ay naganap noong (1880 – 1890)"
    }
  ]
}

,
{
  "id": "PREFIX_HYPHENATION",
  "name": "Gumamit ng Gitling para sa Mga Prefix na 'de' at 'di'",
  "description": "Siguraduhing tama ang paggamit ng gitling (-) pagkatapos ng mga prefix na 'de' at 'di' sa mga salitang pinagsama, kahit na uppercase o lowercase.",
  "pattern": [
    {
      "regex": "\\b([Dd]e)\\s*(\\w+)"
    },
    {
      "regex": "\\b([Dd]i)\\s*(\\w+)"
    }
  ],
  "message": "Gumamit ng gitling (-) sa pagitan ng prefix na 'de' o 'di' at ang kasunod na salita.",
  "suggestions": [
    {
      "text": "$1-$2",
      "description": "Ilagay ang gitling (-) sa pagitan ng prefix na 'de' at ang sumusunod na salita (ex. de-lata).",
      "condition": "matches('\\b([Dd]e)\\s*(\\w+)')"
    },
    {
      "text": "$1-$2",
      "description": "Ilagay ang gitling (-) sa pagitan ng prefix na 'di' at ang sumusunod na salita (ex. di-mahawakan).",
      "condition": "matches('\\b([Dd]i)\\s*(\\w+)')"
    }
  ],
  "examples": [
    {
      "incorrect": "de lata",
      "correct": "de-lata"
    },
    {
      "incorrect": "de kolor",
      "correct": "de-kolor"
    },
    {
      "incorrect": "di mahawakan",
      "correct": "di-mahawakan"
    },
    {
      "incorrect": "di kalakihan",
      "correct": "di-kalakihan"
    },
    {
      "incorrect": "Delata",
      "correct": "De-lata"
    },
    {
      "incorrect": "Dikolor",
      "correct": "Di-kolor"
    }
  ]
} 
{
  "id": "BATING_PANIMULA_SEMICOLON",
  "name": "Tutuldok-Kuwit for Bating Panimula ng Liham Pangalakal",
  "description": "Ginagamit ang tutuldok-kuwit (;) sa katapusan ng bating panimula ng liham pangalakal, tulad ng 'Ginoo;' o 'Bb;'. Siguraduhing gumagamit ng tamang bantas sa pagtatapos ng mga bating panimula.",
  "pattern": [
    {
      "regex": "\\b(Ginoo|Bb|Gng|Dr|Pang|Sen|Hon)\\b(?!\\.)"
    }
  ],
  "message": "Ang bating panimula ay dapat nagtatapos sa tutuldok-kuwit (;). Halimbawa: 'Ginoo;'",
  "example": "Ginoo",
  "suggestions": [
    {
      "text": "$1;",
      "condition": "matches('\\b(Ginoo|Bb|Gng|Dr|Pang|Sen|Hon)\\b(?!\\.)')"
    }
  ]
}*/

{
  "id": "SEMICOLON_BEFORE_PHRASES",
  "name": "Tutuldok-Kuwit Bago ang Mga Salita o Parirala",
  "description": "Ginagamit ang tutuldok-kuwit (;) sa unahan ng mga salita at parirala tulad ng 'halimbawa,' 'gaya ng,' 'tulad ng,' kapag ito'y nangunguna sa isang paliwanag o halimbawa.",
  "pattern": [
    {
      "regex": "\\b(\\w+)\\b(?=\\s+(halimbawa|gaya ng|tulad ng|paris ng))"
    }
  ],
  "message": "Siguraduhing gumagamit ng tutuldok-kuwit (;) bago ang mga salita o parirlaq1àala tulad ng 'halimbawa,' 'gaya ng,' 'tulad ng,' kapag ito'y nangunguna sa isang paliwanag o halimbawa. Halimbawa: 'Maraming magagandang bulaklak sa Pilipinas na hindi na napag-uukulan ng pansin; gaya ng kakwate, kabalyero, banaba, dapdap at iba pa.'",
  "example": "Maraming magagandang bulaklak sa Pilipinas na hindi na napag-uukulan ng pansin gaya ng kakwate, kabalyero, banaba, dapdap at iba pa.",
  "suggestions": [
    {
      "text": "$1;",
      "condition": "matches('\\b(\\w+)\\b(?=\\s+(halimbawa|gaya ng|tulad ng|paris ng))')"
    }
  ]
}
,
{
  "id": "ELLIPSIS_ENDING",
  "name": "Ellipsis for Paragraph/Sentence Ending",
  "description": "Ang tuldok (.) ay ginagamit upang tapusin ang mga pangungusap na pasalaysay o pautos, gayundin sa mga daglat o pinaikling anyo ng salita.",
  "pattern": [
    {
      "regex": "\\b(\\w+)(?![.,!?])\\s*$"
    }
  ],
  "message": "Siguraduhing ang talata o pangungusap ay nagtatapos sa tamang bantas. Kung sadyang binibitin ang pahayag, idagdag ang tatlong tuldok (...).",
  "example": "Pinagtibay ng Pangulong Arroyo",
  "suggestions": [
   
    {
  "text": "$1.",
  "description": "Idagdag ang tatlong tuldok (.) sa pagtatapos ng pangungusap o talata na may isang salita na walang tamang bantas."
}
  ]
}
/* {
  "id": "41.ch_to_ts",
  "name": "CH to TS Conversion",
  "pattern": [
    {
      "regex": "\\bch([a-zA-Z]*)\\b"
    }
  ],
  "message": "'ch' sa mga salitang hiram ay maaaring palitan ng 'ts' kapag binaybay sa Filipino.",
  "description": "Ang 'ch' sa mga salitang hiram ay maaaring maging 'ts' kapag isinalin sa Filipino.",
  "example": "chinelas -> tsinelas, chocolate -> tsokolate",
  "suggestions": [
    {
      "text": "ts$1",
      "condition": "matches([a-zA-Z]*)ch([a-zA-Z]*)",
      "description": "Palitan ang 'ch' ng 'ts' sa salitang Filipino."
    }
  ]
},
{
  "id": "42.ch_and_c_to_k",
  "name": "CH and C to K Conversion",
  "pattern": [
    {
      "regex": "\\b([a-zA-Z]*)ch([a-zA-Z]*)\\b"
    },
    {
      "regex": "\\b([a-zA-Z]*)c([a-zA-Z]*)\\b"
    }
  ],
  "message": "'ch' at 'c' sa mga salitang hiram ay maaaring palitan ng 'k' kapag binaybay sa Filipino.",
  "description": "Ang 'ch' at 'c' sa mga salitang hiram ay maaaring maging 'k' kapag isinalin sa Filipino.",
  "example": "school -> skul, chemical -> kemikal, machine -> makina, scholar -> iskolar",
  "suggestions": [
    {
      "text": "$1k$2",
      "condition": "matches([a-zA-Z]*ch[a-zA-Z]*)",
      "description": "Palitan ang 'ch' ng 'k' sa salitang Filipino."
    },
    {
      "text": "$1k$2",
      "condition": "matches([a-zA-Z]*c[a-zA-Z]*)",
      "description": "Palitan ang 'c' ng 'k' sa salitang Filipino."
    }
  ]
},
{
  "id": "42.ch_and_c_to_k",
  "name": "CH and C to K Conversion",
  "pattern": [
    {
      "regex": "\\b([a-zA-Z]*)ch([a-zA-Z]*)c([a-zA-Z]*)\\b"
    }
  ],
  "message": "'ch' at 'c' sa mga salitang hiram ay maaaring palitan ng 'k' kapag binaybay sa Filipino.",
  "description": "Ang 'ch' at 'c' sa mga salitang hiram ay maaaring maging 'k' kapag isinalin sa Filipino.",
  "example": "chemical -> kemikal, machine -> makina, scholar -> iskolar",
  "suggestions": [
    {
      "text": "$1k$3k$4",
      "condition": "matches([a-zA-Z]*ch[a-zA-Z]*c[a-zA-Z]*)",
      "description": "Palitan ang 'ch' at 'c' ng 'k' sa salitang Filipino."
    }
  ]
},

*/
/*{
  "id": "43.sh_to_sy",
  "name": "SH to SY Conversion",
  "pattern": [
    {
      "regex": "\\b([a-zA-Z]*)sh([a-zA-Z]*)\\b"
    }
  ],
  "message": "'sh' sa mga salitang hiram ay maaaring palitan ng 'sy' kapag binaybay sa Filipino.",
  "description": "Ang 'sh' sa mga salitang hiram ay maaaring maging 'sy' kapag isinalin sa Filipino.",
  "example": "workshop -> worksyap, shooting -> syuting",
  "suggestions": [
    {
      "text": "sy$2",
      "condition": "matches([a-zA-Z]*)sh([a-zA-Z]*)",
      "description": "Palitan ang 'sh' ng 'sy' sa salitang Filipino."
    }
  ]
},*/
/*{
  "id": "49.add_period_single_letters",
  "name": "Add Period After Single Letters or Roman Numerals",
  "pattern": [
    {
      "regex": "\\b([A-Z]|[IVXLCDM]+|[1-9])\\b(?=\\s)(?![\\.])"
    }
  ],
  "message": "Ang tuldok ay ginagamit pagkatapos ng mga tambilang at titik.",
  "description": "Magdagdag ng tuldok pagkatapos ng mga solong titik o tambilang.",
  "example": "A -> A., II -> II., 4 -> 4.",
  "suggestions": [
    {
      "text": "$1.",
      "condition": "matches([A-Z]|[IVXLCDM]+|[1-9])",
      "description": "Maglagay ng tuldok pagkatapos ng mga solong titik o tambilang."
    }
  ]
},
*/
,
{
  "id": "48.add_period_titles",
  "name": "Add Period in Titles or Abbreviations",
  "pattern": [
    {
      "regex": "(\\b(?:Gng|Jr|Dr|G.|Mrs|Ms)\\b)(?!\\.)"
    }
  ],
  "message": "Ang tuldok ay ginagamit sa mga salitang dinaglat gaya ng ngalan ng tao, titulo, o ranggo.",
  "description": "Magdagdag ng tuldok pagkatapos ng mga dinaglat na titulo o ranggo.",
  "example": "Gng -> Gng., Jr -> Jr.",
  "suggestions": [
    {
      "text": "$1.",
      "condition": "matches(Gng|Jr|Dr|G.|Mrs|Ms)",
      "description": "Maglagay ng tuldok pagkatapos ng mga dinaglat na titulo o ranggo."
    }
  ]
}
,
{
  "id": "48.add_exclamation_padamdam",
  "name": "Add Exclamation Mark for Padamdam",
  "pattern": [
    {
      "regex": "\\b(Aray|Wow|Hala|uyy|Uyy|HALA|ARAYY|ARAY|WOW)\\b(?!\\!)"
    }
  ],
  "message": "Ang bantas na padamdam ay ginagamit sa hulihan ng isang kataga, parirala o masidhing damdamin.",
  "description": "Magdagdag ng tuldok na padamdam sa katapusan ng mga salita o parirala na may masidhing damdamin kung hindi pa ito nagtatapos sa tuldok na padamdam.",
  "example": "Uy ang ganda ng bago mong sapatos -> Uy! ang ganda ng bago mong sapatos",
  "suggestions": [
    {
      "text": "$1!",
      "description": "Magdagdag ng tandang padamdam sa salitang '$0' sa katapusan ng pangungusap."
    }
  ]
}
,
{
  "id": "NANG_REPEATED_WORDS",
  "name": "Wastong Gamit ng Nang para sa Inuulit na Salita",
  "pattern": [
    {
      "regex": "(\\b[Aa-zA-Z]+\\b)\\s+ng\\s+\\1"
    }
  ],
  "message": "Mas tamang gamitin ang 'nang' upang pagdugtungin ang dalawang magkaparehong salita o bahagi ng salita na inuulit.",
  "description": "Ginagamit ang 'nang' para sa mga inuulit na salita o pandiwa",
  "suggestions": [
    {
      "text": "$1 nang $1",
      "condition": "matches('ng')"
    }
  ]
}
,
{
  "id": "NANG_REPEATED_WORDS",
  "name": "Wastong Gamit ng Ng para sa Hindi Inuulit na Salita",
  "pattern": [
    {
      "regex": "(\\b[Aa-zA-Z]+\\b)\\s+nang\\s+(?!\\1\\b)(\\b[Aa-zA-Z]+\\b)"
    }
  ],
  "message": "Mas tamang gamitin ang 'ng' para sa dalawang magkaibang salita o bahagi ng pangungusap.",
  "description": "Ginagamit ang 'ng' para sa hindi inuulit na salita o pandiwa",
  "suggestions": [
    {
      "text": "$1 ng $2",
      "condition": "matches('nang')"
    }
  ]
}
,
{
  "id": "NANG_FIRST_WORD",
  "name": "Palitan ang 'ng' ng 'Nang' sa Simula ng Pangungusap",
  "pattern": [
    {
      "regex": "(^\\s*)ng\\b"
    }
  ],
  "message": "Mas tamang gamitin ang 'Nang' bilang unang salita sa isang pangungusap kapag walang ibang salita bago ito.",
  "description": "Pinapalitan ang 'ng' ng 'Nang' kapag ito ang unang salita ng pangungusap o teksto, at walang ibang salita bago ito.",
  "suggestions": [
    {
      "text": "Nang",
      "condition": "matches('ng')"
    }
  ]
},
{
  "id": "GITLING_1_1",
  "name": "Add Gitling - abalang abala",
  "pattern": [
    {
      "regex": "\\b(iba't)(-)(ibang)"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "ang salitang iba't iba ay pinaikli mula sa iba at iba, kaya hindi kinakailangan ng isa pang gitling sa pagitan ng iba't iba",
  "suggestions": [
    {
      "text": "$1 $3"
    }
  ]
},
{
  "id": "GITLING_1_1",
  "name": "Add Gitling - abalang abala",
  "pattern": [
    {
      "regex": "\\b(iba't)( )(ibang)"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "ang salitang iba't iba ay pinaikli mula sa iba at iba, kaya hindi kinakailangan ng isa pang gitling sa pagitan ng iba't iba",
  "suggestions": [
    {
      "text": "$1 $3"
    }
  ]
},
{
      "id": "GITLING_1",
      "name": "Add Gitling - abalang abala",
      "pattern": [
        {
  "regex": "(\\b([Ii]ba))(t)\\s+(\\b(ibang))"
}
      ],
      "message": "maglagay ng gitling",
  "description": "ang salitang iba't iba ay pinaikli mula sa iba at iba, kaya hindi kinakailangan ng isa pang gitling sa pagitan ng iba't iba",
  "suggestions": [
        {
          "text": "$1'$3 $4"
        }
      ]
    },
    {
      "id": "GITLING_1",
      "name": "Add Gitling - abalang abala",
      "pattern": [
        {
  "regex": "(\\b([Ii]sa))(t)\\s+(\\b(isang))"
}
      ],
      "message": "maglagay ng gitling",
  "description": "ang salitang iba't iba ay pinaikli mula sa iba at iba, kaya hindi kinakailangan ng isa pang gitling sa pagitan ng iba't iba",
  "suggestions": [
        {
          "text": "$1'$3 $4"
        }
      ]
    },
{
  "id": "GITLING_1_1",
  "name": "Add Gitling - abalang abala",
  "pattern": [
    {
      "regex": "\\b(isa't)(-)(isang)"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "ang salitang iba't iba ay pinaikli mula sa iba at iba, kaya hindi kinakailangan ng isa pang gitling sa pagitan ng iba't iba",
  "suggestions": [
    {
      "text": "$1 $3"
    }
  ]
},
{
  "id": "GITLING_1",
  "name": "Add Gitling - abalang abala",
  "pattern": [
    {
      "regex": "(\\b([Ii]sa))(t)(-)(\\b(isang))"
}
      ],
  "message": "maglagay ng gitling",
  "description": "ang salitang iba't iba ay pinaikli mula sa iba at iba, kaya hindi kinakailangan ng isa pang gitling sa pagitan ng iba't iba",
  "suggestions": [
    {
      "text": "$1'$3 $5"
        }
      ]
},
{
  "id": "GITLING_1",
  "name": "Add Gitling - abalang abala",
  "pattern": [
    {
      "regex": "(\\b([Ii]ba))(t)(-)(\\b(ibang))"
}
      ],
  "message": "maglagay ng gitling",
  "description": "ang salitang iba't iba ay pinaikli mula sa iba at iba, kaya hindi kinakailangan ng isa pang gitling sa pagitan ng iba't iba",
  "suggestions": [
    {
      "text": "$1'$3 $5"
        }
      ]
},
    {
      "id": "GITLING_1",
      "name": "Add Gitling - abalang abala",
      "pattern": [
        {
  "regex": "(\\b([Aa]balang))\\s+(\\b(abala))"
}
      ],
      "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
    {
  "id": "GITLING_2",
  "name": "Add Gitling - abang aba",
  "pattern": [
    {
      "regex": "(\\b([Aa]bang))\\s+(\\b(aba))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
    {
      "id": "GITLING_4",
      "name": "Add Gitling - abong abo",
      "pattern": [
        {
          "regex": "(\\b([Aa]bong))\\s+(\\b(abo))"
        }
      ],
      "message": "maglagay ng gitling",
      "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
      "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
    {
      "id": "GITLING_5",
      "name": "Add Gitling - abusadong abusado",
      "pattern": [
        {
          "regex": "(\\b([Aa]busadong))\\s+(\\b(abusado))"
        }
      ],
      "message": "maglagay ng gitling",
      "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
      "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
    {
      "id": "GITLING_6",
      "name": "Add Gitling - abusong abuso",
      "pattern": [
        {
          "regex": "(\\b([Aa]busong))\\s+(\\b(abuso))"
        }
      ],
      "message": "maglagay ng gitling",
      "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
      "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
    {
      "id": "GITLING_7",
      "name": "Add Gitling - akong ako",
      "pattern": [
        {
          "regex": "(\\b([Aa]kong))\\s+(\\b(ako))"
        }
      ],
      "message": "maglagay ng gitling",
      "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
      "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
    {
      "id": "GITLING_8",
      "name": "Add Gitling - alagang alaga",
      "pattern": [
        {
          "regex": "(\\b([Aa]lagang))\\s+(\\b(alaga))"
        }
      ],
      "message": "maglagay ng gitling",
      "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
      "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
    {
      "id": "GITLING_9",
      "name": "Add Gitling - among amo",
      "pattern": [
        {
          "regex": "(\\b([Aa]mong))\\s+(\\b(amo))"
        }
      ],
      "message": "maglagay ng gitling",
      "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
      "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
    {
      "id": "GITLING_10",
      "name": "Add Gitling - asang asa",
      "pattern": [
        {
          "regex": "(\\b([Aa]sang))\\s+(\\b(asa))"
        }
      ],
      "message": "maglagay ng gitling",
      "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
      "suggestions": [
        {
          "text": "$1-$4"
        }
      ]
    },
  {
    "id": "GITLING_10",
    "name": "Add Gitling - asang asa",
    "pattern": [
      {
        "regex": "(\\b([Aa]sang))\\s+(\\b(asa))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_11",
    "name": "Add Gitling - asawang asawa",
    "pattern": [
      {
        "regex": "(\\b([Aa]sawang))\\s+(\\b(asawa))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_12",
    "name": "Add Gitling - awang awa",
    "pattern": [
      {
        "regex": "(\\b([Aa]wang))\\s+(\\b(awa))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_13",
    "name": "Add Gitling - babaeng babae",
    "pattern": [
      {
        "regex": "(\\b([Bb]abaeng))\\s+(\\b(babae))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_14",
    "name": "Add Gitling - babang baba",
    "pattern": [
      {
        "regex": "(\\b([Bb]abang))\\s+(\\b(baba))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_15",
    "name": "Add Gitling - bagang baga",
    "pattern": [
      {
        "regex": "(\\b([Bb]agang))\\s+(\\b(baga))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_16",
    "name": "Add Gitling - bagong bago",
    "pattern": [
      {
        "regex": "(\\b([Bb]agong))\\s+(\\b(bago))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_17",
    "name": "Add Gitling - bagyong bagyo",
    "pattern": [
      {
        "regex": "(\\b([Bb]agyong))\\s+(\\b(bagyo))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_18",
    "name": "Add Gitling - bahang baha",
    "pattern": [
      {
        "regex": "(\\b([Bb]ahang))\\s+(\\b(baha))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_19",
    "name": "Add Gitling - baklang bakla",
    "pattern": [
      {
        "regex": "(\\b([Bb]aklang))\\s+(\\b(bakla))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_20",
    "name": "Add Gitling - banyong banyo",
    "pattern": [
      {
        "regex": "(\\b([Bb]anyong))\\s+(\\b(banyo))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_21",
    "name": "Add Gitling - barya baryang",
    "pattern": [
      {
        "regex": "(\\b([Bb]arya))\\s+(\\b(baryang))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_22",
    "name": "Add Gitling - baryang barya",
    "pattern": [
      {
        "regex": "(\\b([Bb]aryang))\\s+(\\b(barya))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_23",
    "name": "Add Gitling - basang basa",
    "pattern": [
      {
        "regex": "(\\b([Bb]asang))\\s+(\\b(basa))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_24",
    "name": "Add Gitling - batang bata",
    "pattern": [
      {
        "regex": "(\\b([Bb]atang))\\s+(\\b(bata))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_25",
    "name": "Add Gitling - batong bato",
    "pattern": [
      {
        "regex": "(\\b([Bb]atong))\\s+(\\b(bato))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_26",
    "name": "Add Gitling - bawing bawi",
    "pattern": [
      {
        "regex": "(\\b([Bb]awing))\\s+(\\b(bawi))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_27",
    "name": "Add Gitling - bayaning bayani",
    "pattern": [
      {
        "regex": "(\\b([Bb]ayaning))\\s+(\\b(bayani))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_28",
    "name": "Add Gitling - bayong bayo",
    "pattern": [
      {
        "regex": "(\\b([Bb]ayong))\\s+(\\b(bayo))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_29",
    "name": "Add Gitling - berdeng berde",
    "pattern": [
      {
        "regex": "(\\b([Bb]erdeng))\\s+(\\b(berde))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
  },
  {
    "id": "GITLING_30",
    "name": "Add Gitling - besong beso",
    "pattern": [
      {
        "regex": "(\\b([Bb]esong))\\s+(\\b(beso))"
      }
    ],
    "message": "maglagay ng gitling",
    "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
    "suggestions": [
      {
        "text": "$1-$4"
      }
    ]
    },
{
  "id": "GITLING_31",
  "name": "Add Gitling - bibong bibo",
  "pattern": [
    {
      "regex": "(\\b([Bb]ibong))\\s+(\\b(bibo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_32",
  "name": "Add Gitling - bidang bida",
  "pattern": [
    {
      "regex": "(\\b([Bb]idang))\\s+(\\b(bida))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_33",
  "name": "Add Gitling - bikining bikini",
  "pattern": [
    {
      "regex": "(\\b([Bb]ikining))\\s+(\\b(bikini))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_34",
  "name": "Add Gitling - biling bili",
  "pattern": [
    {
      "regex": "(\\b([Bb]iling))\\s+(\\b(bili))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_35",
  "name": "Add Gitling - binging bingi",
  "pattern": [
    {
      "regex": "(\\b([Bb]inging))\\s+(\\b(bingi))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_36",
  "name": "Add Gitling - biyaheng biyahe",
  "pattern": [
    {
      "regex": "(\\b([Bb]iyaheng))\\s+(\\b(biyahe))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_37",
  "name": "Add Gitling - bokang boka",
  "pattern": [
    {
      "regex": "(\\b([Bb]okang))\\s+(\\b(boka))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_38",
  "name": "Add Gitling - bolang bola",
  "pattern": [
    {
      "regex": "(\\b([Bb]olang))\\s+(\\b(bola))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_39",
  "name": "Add Gitling - botong boto",
  "pattern": [
    {
      "regex": "(\\b([Bb]otong))\\s+(\\b(boto))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_40",
  "name": "Add Gitling - bugsong bugso",
  "pattern": [
    {
      "regex": "(\\b([Bb]ugsong))\\s+(\\b(bugso))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_41",
  "name": "Add Gitling - bukang buka",
  "pattern": [
    {
      "regex": "(\\b([Bb]ukang))\\s+(\\b(buka))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_42",
  "name": "Add Gitling - bukong buko",
  "pattern": [
    {
      "regex": "(\\b([Bb]ukong))\\s+(\\b(buko))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_43",
  "name": "Add Gitling - bulang bula",
  "pattern": [
    {
      "regex": "(\\b([Bb]ulang))\\s+(\\b(bula))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_44",
  "name": "Add Gitling - bungong bungo",
  "pattern": [
    {
      "regex": "(\\b([Bb]ungong))\\s+(\\b(bungo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_45",
  "name": "Add Gitling - buryong buryo",
  "pattern": [
    {
      "regex": "(\\b([Bb]uryong))\\s+(\\b(buryo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_46",
  "name": "Add Gitling - daang daan",
  "pattern": [
    {
      "regex": "(\\b([Dd]aang))\\s+(\\b(daan))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_47",
  "name": "Add Gitling - dalang dala",
  "pattern": [
    {
      "regex": "(\\b([Dd]alang))\\s+(\\b(dala))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_48",
  "name": "Add Gitling - daling dali",
  "pattern": [
    {
      "regex": "(\\b([Dd]aling))\\s+(\\b(dali))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_49",
  "name": "Add Gitling - damang dama",
  "pattern": [
    {
      "regex": "(\\b([Dd]amang))\\s+(\\b(dama))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_50",
  "name": "Add Gitling - dating dati",
  "pattern": [
    {
      "regex": "(\\b([Dd]ating))\\s+(\\b(dati))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
  },
  /* Batch 50 to 60 must continue here
  
  */
  {
  "id": "GITLING_60",
  "name": "Add Gitling - ganoong ganoon",
  "pattern": [
    {
      "regex": "(\\b([Gg]anoong))\\s+(\\b(ganoon))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_61",
  "name": "Add Gitling - gawang gawa",
  "pattern": [
    {
      "regex": "(\\b([Gg]awang))\\s+(\\b(gawa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_62",
  "name": "Add Gitling - gintong ginto",
  "pattern": [
    {
      "regex": "(\\b([Gg]intong))\\s+(\\b(ginto))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_63",
  "name": "Add Gitling - guhong guho",
  "pattern": [
    {
      "regex": "(\\b([Gg]uhong))\\s+(\\b(guho))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_64",
  "name": "Add Gitling - gulong gulo",
  "pattern": [
    {
      "regex": "(\\b([Gg]ulong))\\s+(\\b(gulo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_65",
  "name": "Add Gitling - gustong gusto",
  "pattern": [
    {
      "regex": "(\\b([Gg]ustong))\\s+(\\b(gusto))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_66",
  "name": "Add Gitling - guwapong guwapo",
  "pattern": [
    {
      "regex": "(\\b([Gg]uwapong))\\s+(\\b(guwapo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_67",
  "name": "Add Gitling - halinang halina",
  "pattern": [
    {
      "regex": "(\\b([Hh]alinang))\\s+(\\b(halina))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_68",
  "name": "Add Gitling - halong halo",
  "pattern": [
    {
      "regex": "(\\b([Hh]along))\\s+(\\b(halo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_69",
  "name": "Add Gitling - hangang hanga",
  "pattern": [
    {
      "regex": "(\\b([Hh]angang))\\s+(\\b(hanga))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_70",
  "name": "Add Gitling - hangong hango",
  "pattern": [
    {
      "regex": "(\\b([Hh]angong))\\s+(\\b(hango))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_71",
  "name": "Add Gitling - hapong hapo",
  "pattern": [
    {
      "regex": "(\\b([Hh]apong))\\s+(\\b(hapo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_72",
  "name": "Add Gitling - haring hari",
  "pattern": [
    {
      "regex": "(\\b([Hh]aring))\\s+(\\b(hari))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_73",
  "name": "Add Gitling - hasang hasa",
  "pattern": [
    {
      "regex": "(\\b([Hh]asang))\\s+(\\b(hasa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_74",
  "name": "Add Gitling - hating hati",
  "pattern": [
    {
      "regex": "(\\b([Hh]ating))\\s+(\\b(hati))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_75",
  "name": "Add Gitling - hiblang hibla",
  "pattern": [
    {
      "regex": "(\\b([Hh]iblang))\\s+(\\b(hibla))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_76",
  "name": "Add Gitling - hilang hila",
  "pattern": [
    {
      "regex": "(\\b([Hh]ilang))\\s+(\\b(hila))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_77",
  "name": "Add Gitling - hilong hilo",
  "pattern": [
    {
      "regex": "(\\b([Hh]ilong))\\s+(\\b(hilo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_78",
  "name": "Add Gitling - hinang hina",
  "pattern": [
    {
      "regex": "(\\b([Hh]inang))\\s+(\\b(hina))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_79",
  "name": "Add Gitling - hinding hindi",
  "pattern": [
    {
      "regex": "(\\b([Hh]inding))\\s+(\\b(hindi))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_80",
  "name": "Add Gitling - hingang hinga",
  "pattern": [
    {
      "regex": "(\\b([Hh]ingang))\\s+(\\b(hinga))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_80",
  "name": "Add Gitling - hingang hinga",
  "pattern": [
    {
      "regex": "(\\b([Hh]ingang))\\s+(\\b(hinga))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_81",
  "name": "Add Gitling - hipong hipo",
  "pattern": [
    {
      "regex": "(\\b([Hh]ipong))\\s+(\\b(hipo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_82",
  "name": "Add Gitling - hiwagang hiwaga",
  "pattern": [
    {
      "regex": "(\\b([Hh]iwagang))\\s+(\\b(hiwaga))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_83",
  "name": "Add Gitling - hiyang hiya",
  "pattern": [
    {
      "regex": "(\\b([Hh]iyang))\\s+(\\b(hiya))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_84",
  "name": "Add Gitling - hubong hubo",
  "pattern": [
    {
      "regex": "(\\b([Hh]ubong))\\s+(\\b(hubo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_85",
  "name": "Add Gitling - hulang hula",
  "pattern": [
    {
      "regex": "(\\b([Hh]ulang))\\s+(\\b(hula))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_86",
  "name": "Add Gitling - hupang hupa",
  "pattern": [
    {
      "regex": "(\\b([Hh]upang))\\s+(\\b(hupa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_87",
  "name": "Add Gitling - hustong husto",
  "pattern": [
    {
      "regex": "(\\b([Hh]ustong))\\s+(\\b(husto))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_88",
  "name": "Add Gitling - ibang iba",
  "pattern": [
    {
      "regex": "(\\b([Ii]bang))\\s+(\\b(iba))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_89",
  "name": "Add Gitling - isa isang",
  "pattern": [
    {
      "regex": "(\\b([Ii]sa))\\s+(\\b(isang))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_90",
  "name": "Add Gitling - jowang jowa",
  "pattern": [
    {
      "regex": "(\\b([Jj]owang))\\s+(\\b(jowa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_91",
  "name": "Add Gitling - kalabasang kalabasa",
  "pattern": [
    {
      "regex": "(\\b([Kk]alabasang))\\s+(\\b(kalabasa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_92",
  "name": "Add Gitling - kaliwang kaliwa",
  "pattern": [
    {
      "regex": "(\\b([Kk]aliwang))\\s+(\\b(kaliwa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_93",
  "name": "Add Gitling - kamukhang kamukha",
  "pattern": [
    {
      "regex": "(\\b([Kk]amukhang))\\s+(\\b(kamukha))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_94",
  "name": "Add Gitling - kaniyang kaniya",
  "pattern": [
    {
      "regex": "(\\b([Kk]aniyang))\\s+(\\b(kaniya))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_95",
  "name": "Add Gitling - kanto kantong",
  "pattern": [
    {
      "regex": "(\\b([Kk]anto))\\s+(\\b(kantong))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_96",
  "name": "Add Gitling - kanyang kanya",
  "pattern": [
    {
      "regex": "(\\b([Kk]anyang))\\s+(\\b(kanya))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_97",
  "name": "Add Gitling - kapeng kape",
  "pattern": [
    {
      "regex": "(\\b([Kk]apeng))\\s+(\\b(kape))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_98",
  "name": "Add Gitling - karneng karne",
  "pattern": [
    {
      "regex": "(\\b([Kk]arneng))\\s+(\\b(karne))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_99",
  "name": "Add Gitling - kasang kasa",
  "pattern": [
    {
      "regex": "(\\b([Kk]asang))\\s+(\\b(kasa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_100",
  "name": "Add Gitling - kastang kasta",
  "pattern": [
    {
      "regex": "(\\b([Kk]astang))\\s+(\\b(kasta))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_101",
  "name": "Add Gitling - kating kati",
  "pattern": [
    {
      "regex": "(\\b([Kk]ating))\\s+(\\b(kati))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_102",
  "name": "Add Gitling - kawawang kawawa",
  "pattern": [
    {
      "regex": "(\\b([Kk]awawang))\\s+(\\b(kawawa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_103",
  "name": "Add Gitling - kayang kaya",
  "pattern": [
    {
      "regex": "(\\b([Kk]ayang))\\s+(\\b(kaya))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_104",
  "name": "Add Gitling - kayumangging kayumanggi",
  "pattern": [
    {
      "regex": "(\\b([Kk]ayumangging))\\s+(\\b(kayumanggi))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_105",
  "name": "Add Gitling - kesong keso",
  "pattern": [
    {
      "regex": "(\\b([Kk]esong))\\s+(\\b(keso))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_106",
  "name": "Add Gitling - kilalang kilala",
  "pattern": [
    {
      "regex": "(\\b([Kk]ilalang))\\s+(\\b(kilala))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_107",
  "name": "Add Gitling - kitang kita",
  "pattern": [
    {
      "regex": "(\\b([Kk]itang))\\s+(\\b(kita))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_108",
  "name": "Add Gitling - konting konti",
  "pattern": [
    {
      "regex": "(\\b([Kk]onting))\\s+(\\b(konti))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_109",
  "name": "Add Gitling - kuhang kuha",
  "pattern": [
    {
      "regex": "(\\b([Kk]uhang))\\s+(\\b(kuha))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_110",
  "name": "Add Gitling - kulong kulo",
  "pattern": [
    {
      "regex": "(\\b([Kk]ulong))\\s+(\\b(kulo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_111",
  "name": "Add Gitling - labang laba",
  "pattern": [
    {
      "regex": "(\\b([Ll]abang))\\s+(\\b(laba))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_112",
  "name": "Add Gitling - lagang laga",
  "pattern": [
    {
      "regex": "(\\b([Ll]agang))\\s+(\\b(laga))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_113",
  "name": "Add Gitling - lagong lago",
  "pattern": [
    {
      "regex": "(\\b([Ll]agong))\\s+(\\b(lago))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_114",
  "name": "Add Gitling - lahing lahi",
  "pattern": [
    {
      "regex": "(\\b([Ll]ahing))\\s+(\\b(lahi))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_115",
  "name": "Add Gitling - laking laki",
  "pattern": [
    {
      "regex": "(\\b([Ll]aking))\\s+(\\b(laki))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_116",
  "name": "Add Gitling - lalaking lalaki",
  "pattern": [
    {
      "regex": "(\\b([Ll]alaking))\\s+(\\b(lalaki))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_117",
  "name": "Add Gitling - lalong lalo",
  "pattern": [
    {
      "regex": "(\\b([Ll]along))\\s+(\\b(lalo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_118",
  "name": "Add Gitling - langong lango",
  "pattern": [
    {
      "regex": "(\\b([Ll]angong))\\s+(\\b(lango))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_119",
  "name": "Add Gitling - larong laro",
  "pattern": [
    {
      "regex": "(\\b([Ll]arong))\\s+(\\b(laro))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_120",
  "name": "Add Gitling - latang lata",
  "pattern": [
    {
      "regex": "(\\b([Ll]atang))\\s+(\\b(lata))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
  },
  {
  "id": "GITLING_120",
  "name": "Add Gitling - latang lata",
  "pattern": [
    {
      "regex": "(\\b([Ll]atang))\\s+(\\b(lata))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_121",
  "name": "Add Gitling - lawang lawa",
  "pattern": [
    {
      "regex": "(\\b([Ll]awang))\\s+(\\b(lawa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_122",
  "name": "Add Gitling - layong layo",
  "pattern": [
    {
      "regex": "(\\b([Ll]ayong))\\s+(\\b(layo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_123",
  "name": "Add Gitling - libo libong",
  "pattern": [
    {
      "regex": "(\\b([Ll]ibo))\\s+(\\b(libong))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_124",
  "name": "Add Gitling - ligong ligo",
  "pattern": [
    {
      "regex": "(\\b([Ll]igong))\\s+(\\b(ligo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_125",
  "name": "Add Gitling - likong liko",
  "pattern": [
    {
      "regex": "(\\b([Ll]ikong))\\s+(\\b(liko))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_126",
  "name": "Add Gitling - liksing liksi",
  "pattern": [
    {
      "regex": "(\\b([Ll]iksing))\\s+(\\b(liksi))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_127",
  "name": "Add Gitling - lilang lila",
  "pattern": [
    {
      "regex": "(\\b([Ll]ilang))\\s+(\\b(lila))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_128",
  "name": "Add Gitling - lingong lingo",
  "pattern": [
    {
      "regex": "(\\b([Ll]ingong))\\s+(\\b(lingo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_129",
  "name": "Add Gitling - litong lito",
  "pattern": [
    {
      "regex": "(\\b([Ll]itong))\\s+(\\b(lito))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_130",
  "name": "Add Gitling - lobong lobo",
  "pattern": [
    {
      "regex": "(\\b([Ll]obong))\\s+(\\b(lobo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_131",
  "name": "Add Gitling - lokong loko",
  "pattern": [
    {
      "regex": "(\\b([Ll]okong))\\s+(\\b(loko))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_132",
  "name": "Add Gitling - luging lugi",
  "pattern": [
    {
      "regex": "(\\b([Ll]uging))\\s+(\\b(lugi))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_133",
  "name": "Add Gitling - luksong lukso",
  "pattern": [
    {
      "regex": "(\\b([Ll]uksong))\\s+(\\b(lukso))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_134",
  "name": "Add Gitling - lumang luma",
  "pattern": [
    {
      "regex": "(\\b([Ll]umang))\\s+(\\b(luma))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_135",
  "name": "Add Gitling - lumpong lumpo",
  "pattern": [
    {
      "regex": "(\\b([Ll]umpong))\\s+(\\b(lumpo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_136",
  "name": "Add Gitling - lupang lupa",
  "pattern": [
    {
      "regex": "(\\b([Ll]upang))\\s+(\\b(lupa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_137",
  "name": "Add Gitling - lutong luto",
  "pattern": [
    {
      "regex": "(\\b([Ll]utong))\\s+(\\b(luto))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_138",
  "name": "Add Gitling - maamong maamo",
  "pattern": [
    {
      "regex": "(\\b([Mm]aamong))\\s+(\\b(maamo))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_139",
  "name": "Add Gitling - mababang mababa",
  "pattern": [
    {
      "regex": "(\\b([Mm]ababang))\\s+(\\b(mababa))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
},
{
  "id": "GITLING_140",
  "name": "Add Gitling - mabangong mabango",
  "pattern": [
    {
      "regex": "(\\b([Mm]abangong))\\s+(\\b(mabango))"
    }
  ],
  "message": "maglagay ng gitling",
  "description": "Sa pag-uulit ng mga salitang-ugat, nananatili ang orihinal na anyo. Ang pag-uulit ng salita ay hindi kinakailangang baguhin dahil ito'y may tiyak na naaayon na orihinal na anyo ng salita.",
  "suggestions": [
    {
      "text": "$1-$4"
    }
  ]
  },

];
}

app.use((req, res, next) =>  {
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

const preprocessText = (text, excludedWords = []) => {
  let processedText = text;

  // Remove exact matches of excluded words
  excludedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi'); // Create regex for word (case-insensitive)
    processedText = processedText.replace(regex, ''); // Remove the word
  });

  // Regex to identify and preserve patterns like "( anytypeofwords )"
  const preservePatternRegex = /\(\s?[a-zA-Z]+\s?\)/g;

  // Preserve patterns inside parentheses by temporarily replacing them with placeholders
  const placeholders = [];
  processedText = processedText.replace(preservePatternRegex, match => {
    placeholders.push(match);
    return `__PLACEHOLDER_${placeholders.length - 1}__`;
  });

  // Regex to remove unwanted patterns like ( G... ) or any other words inside parentheses
  const namePatternRegex = /\(\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s?\)/g;
  processedText = processedText.replace(namePatternRegex, ''); // Remove patterns matching the regex

  // Restore the preserved patterns back to their original form
  placeholders.forEach((placeholder, index) => {
    processedText = processedText.replace(`__PLACEHOLDER_${index}__`, placeholder);
  });

  return processedText.trim(); // Trim any leading/trailing whitespace
};


const callLanguageToolAPI = async (text, excludedWords = []) => {
  const preprocessedText = preprocessText(text, excludedWords);

  // Make the API call with the preprocessed text
  const apiUrl = 'https://api.languagetool.org/v2/check';
  const params = new URLSearchParams();
  params.append('text', preprocessedText);
  params.append('language', 'tl-PH');

  try {
    return null;
  } catch (error) {
    console.error('Error calling LanguageTool API:', error);
    return null;
  }
};


const checkTextAgainstRules = async (text, rules) => {
  let matches = [];

  console.log("Starting to check text against rules");

  for (const rule of rules) {
    console.log(`Checking rule: ${rule.id}`);

    if (!rule.pattern || !Array.isArray(rule.pattern)) {
      console.error(`Invalid or missing pattern for rule ${rule.id}`);
      continue;
    }

    for (const patternObj of rule.pattern) {
      let regex;

      if (patternObj.token && patternObj.token.value) {
        console.log(`Using token match: ${patternObj.token.value}`);
        regex = new RegExp(`\\b${patternObj.token.value}\\b`, 'gi');
      } else if (patternObj.regex) {
        console.log(`Using regex pattern: ${patternObj.regex}`);
        regex = new RegExp(patternObj.regex, 'gi');
      } else {
        console.warn(`Invalid pattern in rule ${rule.id}`);
        continue;
      }

      let match;
      while ((match = regex.exec(text)) !== null) {
        console.log(`Match found for rule ${rule.id}:`, match[0]);

        let suggestions = [];

        // Handle repeated words with whitespace
        const repeatedWordRegex = /\b(\w+)\s+\1\b/gi;
        let repeatedMatch;

        // Existing suggestion logic
        if (rule.suggestions) {
          console.log(`Processing suggestions for rule ${rule.id}`);
          rule.suggestions.forEach(suggestion => {
            if (typeof suggestion === 'string') {
              suggestions.push(suggestion);
            } else if (suggestion.text) {
              let suggestionText = suggestion.text;

              // Replace capturing groups with the matched content
              for (let i = 1; i < match.length; i++) {
                if (match[i]) {
                  const groupRegex = new RegExp(`\\$${i}`, 'g');
                  suggestionText = suggestionText.replace(groupRegex, match[i]);
                }
              }

              suggestions.push(suggestionText);
            }
          });
        }

        // Log the suggestions for debugging
        console.log(`Suggestions for match: ${suggestions}`);

        // Add match to results with suggestions
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

        console.log(`Match added for rule ${rule.id}`);
      }
    }
  }

  console.log("Finished checking text against rules");

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

    // Run custom rule checking first
    const customRulesResult = await checkTextAgainstRules(text, grammarRules);

    const excludedWords = ["kendi", "Kendi", "Sen", "Sen.", "Joel", "Senador", "January", "degree", "Bulakenyo", "College", "State", "state", "college", "Gloria", "Macapagal Arroyo", "Arroyo", " Gloria Macapagal Arroyo "]; // Add "kundi" to excluded words

    // Then call the LanguageTool API
    const languageToolResult = await callLanguageToolAPI(text, excludedWords);

    // Combine matches from both custom rules and LanguageTool API
    let combinedMatches = [...customRulesResult.matches];

    if (languageToolResult && languageToolResult.matches) {
      const languageToolMatches = languageToolResult.matches.map(match => ({
        message: match.message,
        shortMessage: match.rule.issueType || '',
        replacements: match.replacements.map(replacement => replacement.value),
        offset: match.offset,
        length: match.length,
        context: {
          text: text.slice(Math.max(0, match.offset - 20), match.offset + match.length + 20),
          offset: Math.min(20, match.offset),
          length: match.length
        },
        sentence: text.slice(
          Math.max(0, text.lastIndexOf('.', match.offset) + 1),
          text.indexOf('.', match.offset + match.length) + 1
        ),
        rule: {
          id: match.rule.id,
          description: match.rule.description
        }
      }));

      combinedMatches = combinedMatches.concat(languageToolMatches);
    }

    console.log('Number of combined matches:', combinedMatches.length);
    return res.json({ matches: combinedMatches });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
