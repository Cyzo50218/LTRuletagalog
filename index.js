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
    },
    {
  "regex": "\\b(\\w+o)\\s+\\1\\b"
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
    { "text": "$1-$1" }
  ]
},
{
  "id": "A1",
  "name": "Proper Nouns with 'pa' Prefix",
  "description": "Magdagdag ng gitling sa mga pangngalan kapag may panlaping 'pa' o 'pag'.",
  "pattern": [
    { "regex": "\\b(Pa(?!g)|pa(?!g))\\s*([A-Z]\\w+)\\b|\\b(Pag|pag)\\s*([A-Z]\\w+)\\b" }
  ],
  "message": "Ginigitlingan ang pangngalang pantangi kapag may panlaping 'pa' o 'pag'.",
  "suggestions": [
    { "text": "pa-$3", "description": "Maglagay ng 'pa-' na panlapi na may gitling bago ang pangngalan." },
    { "text": "pag-$5", "description": "Maglagay ng gitling pagkatapos ng 'pag' bago ang pangngalan." }
  ],
  "examples": [
    { "incorrect": "paDavao", "correct": "pa-Davao" },
    { "incorrect": "paManila", "correct": "pa-Manila" },
    { "incorrect": "pagDavao", "correct": "pag-Davao" },
    { "incorrect": "pagManila", "correct": "pag-Manila" }
  ],
  "exceptions": [
    "paa", "paano", "paanong", "paaralan", "pababa", "pabango", "pabaya", "pabor", "paborita", "paborito",
    "pabrika", "padala", "pader", "padre", "padrino", "padyak", "padyama", "pagal", "pagano", "pagasa",
    "pagbabago", "pagbasa", "pagbati", "pagbili", "pagbuo", "pagdaan", "pagdaka", "pagdating", "pagdiriwang",
    "paggalang", "paggawa", "paghinga", "pagi", "pagibig", "pagitan", "pagka", "pagkain", "pagkakaisa",
    "pagkakataon", "pagkanta", "pag-asa", "pag-ibig", "pag-iisa", "pag-unlad"
  ]
},
{
  "id": "A2",
  "name": "Words with 'maka' Prefix",
  "description": "Magdagdag ng gitling sa mga salitang may panlaping 'maka'.",
  "pattern": [
    { "regex": "\\b(maka)(\\w+)\\b" },
    { "regex": "\\b(Maka)(\\w+)\\b" },
    { "regex": "\\b(mka)(\\w+)\\b" },
    { "regex": "\\b(Mka)(\\w+)\\b" },
    { "regex": "\\b(maka)\\s*(\\w+)\\b" },
    { "regex": "\\b(Maka)\\s*(\\w+)\\b" },
    { "regex": "\\b(mka)\\s*(\\w+)\\b" },
    { "regex": "\\b(Mka)\\s*(\\w+)\\b" }
  ],
  "message": "Ginigitlingan ang mga salitang may panlaping 'maka'.",
  "suggestions": [ 
    { "text": "maka-$1", "description": "Maglagay ng gitling sa pagitan ng panlaping 'maka' at ng ugat na salita." }
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
    { "regex": "\\b(mag|Mag|mg|Mg)([bcdfghjklmnpqrstvwxyz][aeiou])([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" },
    { "regex": "\\b(mag|Mag|mg|Mg)\\s*([bcdfghjklmnpqrstvwxyz][aeiou])([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" },
    { "regex": "\\b(mag|Mag|mg|Mg)(po|co|pa|fo)?([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" },
    { "regex": "\\b(mag|Mag|mg|Mg)([bcdfghjklmnpqrstvwxyz][aeiou])\\s*([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" }, { "regex": "\\b(mag|Mag|mg|Mg)\\s*(po|co|pa|fo)?\\s*([bcdfghjklmnpqrstvwxyz][aeiou]\\w*)\\b" }
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
{
  "id": "PAGUULIT_E",
  "name": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'",
  "pattern": [
    { "regex": "\\b(\\w+e)\\1\\b" }, 
    {
  "regex":"\\b(\\w+e)\\s+\\1\\b"
}
  ],
  "message": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'. Hindi ito pinapalitan ng letrang 'i'.",
  "description": "Sa pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e', hindi ito pinapalitan ng letrang 'i'. Kinakabitan ng pang-ugnay/linker (-ng) at ginagamitan ng gitling sa pagitan ng salitang-ugat.",
  "examples": [
    { "incorrect": "tseke tseke", "correct": "tseke-tseke" },
    { "incorrect": "bente bente", "correct": "bente-bente" },
    { "incorrect": "pale pale", "correct": "pale-pale" },
    { "incorrect": "tseketseke", "correct": "tseke-tseke" }
  ],
  "suggestions": [
    { "text": "$1-$1"
}
  ]
},
{
  "id": "PAGUULIT",
  "name": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'",
  "pattern": [
{
  "regex": "\\b(\\w+)\\s+\\1\\b"
}
  ],
  "message": "Pag-uulit ng salitang-ugat na nagtatapos sa patinig na 'e'. Hindi ito pinapalitan ng letrang 'i'.",
  "description": "Sa pag-uulit ng salitang-ugat kinakabitan to ng '-' ",
  "examples": [
    { "incorrect": "tseke tseke", "correct": "tseke-tseke" },
    { "incorrect": "bente bente", "correct": "bente-bente" },
    { "incorrect": "pale pale", "correct": "pale-pale" },
    { "incorrect": "tseketseke", "correct": "tseke-tseke" }
  ],
  "suggestions": [
    {
  "text": "$1-$1"
}
  ]
},
{
  "id": "PAGHULAPIAN_COMBINED",
  "name": "Pagbabago ng huling pantig ng salitang-ugat",
  "pattern": [
    {
      "regex": "\\b(?!babae|tao|telebisyon|komersyo|kompyuter|kape|puno|taho|pili|sine|bote|onse|base|cheque|calle|niño|mantequilla|espejo|coche|maestro|casa|cuatro|sabado|nueve|año|libro|piedra|sinosino|tseke|bente|pale|ate|karte|lente|note|jefe|chicle)(\\w*e)\\b",
      "exceptions": ["\\b(\\w*e\\1)\\b"]
    },
    {
      "regex": "\\b(?!buhos|sampu|tao|to|telepono|nilo|kilo|po|opo|Opo|Po|litro|metro|reto|calle|niño|mantequilla|espejo|coche|maestro|casa|cuatro|sabado|nueve|año|libro|piedra|anoano|ano|sino|sinosino|pito|pitopito|halo|halohalo|buto|butobuto|piso|pisopiso|pa\\w*o|hello|ako|mo|bago|barko|baso|buko|damo|ginto|hilo|kanto|kubo|lako|lobo|pako|plato|puto|sako|sulo|tabo|talo|tubo|ulo|zero|hero|piano|photo|mango|potato|avocado|echo|bingo|logo|memo|silo|soprano|tornado|volcano|arroz|codo|dedo|fuego|gusto|hilo|palo|queso|rato|santo|sombrero|vino|zapato)(\\w*o)\\b",
      "exceptions": ["\\b(\\w+\\1)\\b", "\\b(pa\\w*o)\\b"]
    }
  ],
  "message": "Kapag hinuhulapian ang huling pantig ng salitang-ugat na nagtatapos sa 'e' o 'o', dapat itong i-apply ang tamang hulapi. May mga salitang nagtatapos sa 'e' na nananatili ang 'e' kahit hinuhulapian.",
  "description": "Kapag ang salitang-ugat ay nagtatapos sa 'e', ang huling pantig ay nagiging 'i' at ang hulapi ay '-ihan'. Kapag nagtatapos sa 'o', ang huling pantig ay nagiging 'u' at ang hulapi ay '-an'. May mga salitang nananatili ang 'e' kahit hinuhulapian, at hindi puwedeng palitan ng 'i' ang 'e' at 'o' sa 'u'.",
  "suggestions": [
    {
      "text": "$1ihan",
      "condition": "endsWith('e')",
      "exceptions": ["babae", "tao", "telebisyon", "komersyo", "kompyuter", "kape", "puno", "taho", "pili", "sine", "bote", "onse", "base", "cheque", "calle", "niño", "mantequilla", "espejo", "coche", "maestro", "casa", "cuatro", "sabado", "nueve", "año", "libro", "piedra", "ate", "ideya", "karte", "lente", "note", "poste", "suwerte", "tigre", "jefe", "chicle", "suerte", "bueno", "grande", "puente"]
    },
    { "text": "$1ng $2" },
    { "text": "$1-$2" },
    {
      "text": "$1an",
      "condition": "endsWith('o')",
      "exceptions": [
        "buhos", "sampu", "tao", "telepono", "nilo", "kilo", "litro", "metro", "reto", "calle", "niño", "mantequilla", "espejo", "coche", "maestro", "casa", "cuatro", "sabado", "nueve", "año", "libro", "piedra",
        "hello", "ako", "mo", "bago", "barko", "baso", "buko", "damo", "ginto", "hilo", "kanto", "kubo", "lako", "lobo", "pako", "plato", "puto", "sako", "sulo", "tabo", "talo", "tubo", "ulo",
        "zero", "hero", "piano", "photo", "mango", "potato", "avocado", "echo", "bingo", "logo", "memo", "silo", "soprano", "tornado", "volcano",
        "arroz", "codo", "dedo", "fuego", "gusto", "hilo", "palo", "queso", "rato", "santo", "sombrero", "vino", "zapato"
      ]
    }
  ]
},
{
  "id": "PAGTUNOG_E_O",
  "name": "Pagbabago ng tunog na 'e' at 'o' sa mga hiram na salita",
  "pattern": [
    {
      "regex": "\\bmesa\\b"
    },
    {
      "regex": "\\buso\\b"
    },
    {
      "regex": "\\btela\\b"
    },
    {
      "regex": "\\bselo\\b"
    },
    {
      "regex": "\\bbote\\b"
    },
    {
      "regex": "\\bbabay\\b"
    },
    {
      "regex": "\\bsabi\\b"
    },
    {
      "regex": "\\bsino\\b"
    },
    {
      "regex": "\\bbango\\b"
    },
    {
      "regex": "\\bsisi\\b"
    },
    {
      "regex": "\\bbinti\\b"
    },
    {
      "regex": "\\btanggap\\b"
    },
    {
      "regex": "\\bpinta\\b"
    },
    {
      "regex": "\\bmango\\b"
    }
  ],
  "message": "Makabuluhan ang tunog na 'e' at 'o' kapag inihahambing ang mga hiram na salita sa mga katutubo o hiram na salita.",
  "description": "Ang tunog na 'e' at 'o' sa mga hiram na salita ay maaaring ihalin sa katutubong Tagalog na tunog.",
  "suggestions": [
    {
      "text": "misa",
      "condition": "matches('mesa')",
      "description": "Palitan ang 'mesa' ng 'misa' na katutubong tunog."
    },
    {
      "text": "oso",
      "condition": "matches('uso')",
      "description": "Palitan ang 'uso' ng 'oso' na katutubong tunog."
    },
    {
      "text": "tila",
      "condition": "matches('tela')",
      "description": "Palitan ang 'tela' ng 'tila' na katutubong tunog."
    },
    {
      "text": "babae",
      "condition": "matches('babay')",
      "description": "Palitan ang 'babay' ng 'babae' na katutubong tunog."
    },
    {
      "text": "sabihin",
      "condition": "matches('sabi')",
      "description": "Palitan ang 'sabi' ng 'sabihin' na katutubong tunog."
    },
    {
      "text": "sinu",
      "condition": "matches('sino')",
      "description": "Palitan ang 'sino' ng 'sinu' na katutubong tunog."
    },
    {
      "text": "bangong",
      "condition": "matches('bango')",
      "description": "Palitan ang 'bango' ng 'bangong' na katutubong tunog."
    },
    {
      "text": "sising",
      "condition": "matches('sisi')",
      "description": "Palitan ang 'sisi' ng 'sising' na katutubong tunog."
    },
    {
      "text": "mangga",
      "condition": "matches('mango')",
      "description": "Palitan ang 'mango' ng 'mangga' na katutubong tunog."
    }
  ]
},{
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
   "regex": "\\b(higit|hgt|hgtpa)\\b",
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
  "id": "DITO_RITO",
  "name": "DITO at RITO",
  "pattern": [
    {
      "regex": "\\b(\\w+[bdfghjklmnpqrstvz]* dito)\\b"
    },
    {
      "regex": "\\b(\\w+[yw|ra|re|ri|ro|ru] dito)\\b"
    }
  ],
  "message": "'Rito' ang tamang gamitin kung hindi nagtatapos sa 'y' o 'w' ang unang salita; 'dito' kung nagtatapos sa 'y' o 'w'.",
  "description": "'Dito' ang ginagamit kung ang naunang salita ay nagtatapos sa 'y' o 'w'. 'Rito' ang ginagamit kung hindi nagtatapos sa 'y' o 'w' ang naunang salita.",
  "example": "Pumunta ka rito. Pumunta ka dito (kung nagtatapos sa 'y' o 'w' ang naunang salita).",
  "suggestions": [
    {
      "text": "rito",
      "condition": "matches(\\w+[bdfghjklmnpqrstvz]* dito)"
    },
    {
  "text": "rin",
  "condition": "matches(\\w+[bdfghjklmnpqrstvz]* dito)"
},
    {
      "text": "dito",
      "condition": "matches(\\w+[?!yw|ra|re|ri|ro|ru] dito)"
    },
    {
      "text": "din",
      "condition": "matches(\\w+[?!yw|ra|re|ri|ro|ru] dito)"
    }
  ]
},
{
  "id": "DAW_RAW",
  "name": "DAW at RAW",
  "pattern": [
    {
      "regex": "\\b(\\w+[wy|yw|ya|wa]* daw)\\b"
    },
    {
      "regex": "\\b(\\w+[ra|ri|raw|ray|is|im|aeiou] raw)\\b"
    }
  ],
  "message": "'Din/Daw'Ang Mananatili kung ang sinusundannitong salita ay hindi nagtatapos sa patinig o sa malapatinig na 'y' o 'w' gayundin, nananatili ang D kung ang sinusundang salita ay nagtatapos sa –ra,-ri, -raw, o –ray, samantalang ang 'Raw/Rin' ang ginagamit kung ang unang salita ay D at ito ay napapalitan ng R kung ang sinusundannitong salita ay nagtatapos sa patinig o sa malapatinig na W at Y",
  "description": "'Dito' ang ginagamit kung ang naunang salita ay nagtatapos sa 'y' o 'w'. 'Rito' ang ginagamit kung hindi nagtatapos sa 'y' o 'w' ang naunang salita.",
  "example": "Pumunta ka rito. Pumunta ka dito (kung nagtatapos sa 'y' o 'w' ang naunang salita).",
  "suggestions": [
    {
      "text": "raw",
      "condition": "matches(\\w+[wy|yw|ya|wa]* daw)"
    },
    {
      "text": "daw",
      "condition": "matches(\\w+[ra|ri|ro|ruraw|ray|is|im|aeiou] raw)"
},
    {
  "text": "rin",
  "condition": "matches(\\w+[wy|yw|ya|wa]* daw)"
},
{
  "text": "din",
  "condition": "matches(\\w+[ra|ri|ro|ru|raw|ray|is|im|aeiou] raw)"
}
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

        // Handle repeated words with whitespace
        const repeatedWordRegex = /\b(\w+)\s+\1\b/gi;
        let repeatedMatch;
        while ((repeatedMatch = repeatedWordRegex.exec(text)) !== null) {
          if (repeatedMatch.index >= match.index && repeatedMatch.index < (match.index + match[0].length)) {
            // Add repeated word suggestion to the suggestions array
            
          }
        }

        // Existing suggestion logic
        if (rule.suggestions) {
          rule.suggestions.forEach(suggestion => {
            if (typeof suggestion === 'string') {
              suggestions.push(suggestion);
            } else if (suggestion.text) {
              let suggestionText = suggestion.text;

              // Replace capturing groups with the matched content
              for (let i = 1; i < match.length; i++) { // Start from 1 because $0 is the whole match
                if (match[i]) {
                  // Replace $i with the match[i] value
                  const groupRegex = new RegExp(`\\$${i}`, 'g');
                  suggestionText = suggestionText.replace(groupRegex, match[i]);
                }
              }

              // Apply capitalization preservation for the first occurrence only
              const parts = suggestionText.split('$1');
              if (parts.length > 1) {
                const capitalizedFirstPart = parts[0];
                const lowercasedSecondPart = parts.slice(1).join('$1').toLowerCase();
                
                // Capitalize the first part if the original match was capitalized
                const isFirstPartCapitalized = match[1] && match[1][0] === match[1][0].toUpperCase();
                const finalSuggestion = (isFirstPartCapitalized ? capitalizedFirstPart.charAt(0).toUpperCase() + capitalizedFirstPart.slice(1) : capitalizedFirstPart) + lowercasedSecondPart;

                suggestions.push(finalSuggestion);
              } else {
                suggestions.push(suggestionText);
              }
            }
          });
        }

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


