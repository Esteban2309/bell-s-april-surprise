const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'database.db'));

console.log("Limpiando base de datos antigua...");

// Borrar tablas existentes para aplicar el nuevo esquema sin UNIQUE
db.exec(`
  DROP TABLE IF EXISTS spins;
  DROP TABLE IF EXISTS gifts;
`);

// Crear tablas con la nueva estructura (date ya no es UNIQUE)
db.exec(`
  CREATE TABLE gifts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    message TEXT,
    emoji TEXT
  );
  CREATE TABLE spins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gift_id INTEGER,
    date TEXT,
    FOREIGN KEY(gift_id) REFERENCES gifts(id)
  );
`);

const gifts = [
  { id: 1, title: "¡felipumpe  ! ", message: "feli pumpe a la persona mas bella d este mundo, gachas por tanto eres la mejor del mundo teamo y espero con todo mi corazon k pases un dia muymuy lindo, yo voy a hacer lo posible para k asi sea hoy, este mes y siempre te amooooooo mi bebe 😽♥, la sorpresa d hoy eeeees un misterio, solo t voy a dar una pista cada dia y es k tiene  ver el regalo con straigh kids ", emoji: "🎂" },
  { id: 2, title: "detallito ", message: "hoy t voy a dar un detalle k hice pensando en ti ojala t guste mucho perdom por tanta helokity mi helokita", emoji: "💌" },
  { id: 3, title: "t mando un abrazo psicologico hoy, ese es tu regalito d hoy", message: "SJKJASJSAJKASKJ no mentira hoy es algo d comer k recuerda a ti es cmo lo de las nanas, nana si hubieramos sido novias no crees k un abrazo hubiera solucionado tdo", emoji: "😿" },
  { id: 4, title: "oli pelilinda", message: "sabias k tienes el cabello mas precioso del mundo entonces hoy t doy un regalito para el, ojala t guste mucho muamuamua", emoji: "(●'◡'●)" },
  { id: 5, title: "fuegooooooooo m kemo d amorxti", message: "algo k encienda la chispa d tu corazon ", emoji: "🔥🔥🔥🥵" },
  { id: 6, title: "ip ip ip ipip ", message: "oli como tas, hoy toca algo k te va a gustar asi mucho mucho yo se, spoiler es d comer", emoji: "⭐" },
  { id: 7, title: "majimamshorom mama majimamshorom", message: "psss, toco admitir k blackpink ganó, pero ps k injusticia k hagan comeback al tiempo con twice", emoji: "🖤💗" },
  { id: 8, title: "HOLIIIIIIIIIII MIAMOR YA 5MESES", message: "hoy ya 5 meses desde el picnic wao, gachas por estar a mi lado todo este tiempo ti amo muchomucho gracias por aguantarme y animarme los dias con tu presencia, personalidad, y tdooooo tiamo, hoy hay unboxin 🥵KSKJAKJSAKJAJSAK ", emoji: "😲" },
  { id: 9, title: "A-B-C, Do-Re-Mi", message: "un pekeño detalle para mi lobita, perdon si uso mucho la k, es k esta dañada en el pc la ku", emoji: "🐺" },
  { id: 10, title: "사랑해, 꼬마 늑대야", message: "para mi transcoreana fav", emoji: "(⊙_⊙;)" },
  { id: 11, title: "7x8", message: "algo pa tucola", emoji: "🌸" },
  { id: 12, title: "teamo", message: "si t toco este hoy viene el regalo mas bacano k hice solo para ti", emoji: "🥰" },
  { id: 13, title: "pa k comas", message: "la cutymark de applejack :0, nada  ver el emoji KJSAJKAKSKJAS maumauamua", emoji: "🍳" },
  { id: 14, title: "un petuche", message: "helokito, ya se k mucho hellokito pero es k yo k hago tiamo, despues ya vario mas", emoji: "😻" },
  { id: 15, title: "wao", message: "🚂🏯⛩️👻🇯🇵🐉🐷", emoji: "🏯" },
  { id: 16, title: "ñomi", message: "ñomiñomi", emoji: "🥄" },
  { id: 17, title: "nitenite", message: "para k muermas o no she, cuando viajemos en avion a algun lado de pronto lo usas", emoji: "🌙" },
  { id: 18, title: "pinpinpin pinpin pinpinpin pinpin ", message: "gatopezconejoratacartera", emoji: "😾" },
  { id: 19, title: "mama cierto k la abuela wako tiene sangre coriana", message: "española🗣🗣🗣", emoji: "🇪🇸" },
  { id: 20, title: "hoy toco armarlo", message: "o m ayudas si algo de pronto tu sabes mas o nose, tiamo", emoji: "💎" },
  { id: 21, title: "jenlisa tuy yo", message: "cual somos, solo puedes decir uno, winrina, jenlisa o hyunming", emoji: "👀" },
    { id: 22, title: "han", message: "산을 넘어, 산 넘어 강을 넘어, 강 넘어산을 넘어, 산맥 강을 넘어 바다 다 넘어가 또 다음", emoji: "😛" },
  { id: 23, title: "mi chocolatito tiamo", message: "un chocolatito para otro", emoji: "🍫" },
  { id: 24, title: "mezcle dos d tus cosas favoritas jijiji", message: "te amo mi minecraftera fav y mas pro y mas crack makina fiera bestia mastodonte", emoji: "👾" },
  { id: 25, title: "piña para laniña", message: "piña, no hay mas misterio hoy", emoji: "🍍" },
  { id: 26, title: "par d pepas helokitas", message: "este esta mas facil k el otro", emoji: "(∪.∪ )...zzz" },
  { id: 27, title: "le guta lo kinkinasti aunk sea fancy", message: "sangre mi brazo en partes, soy fiel a mi cora ese es mi martir, si me traicionan le hago plaplapla", emoji: "🍥" },
  { id: 28, title: "yo", message: "Birds of a feather, we should stick together, I know I said I'd never think I wasn't better alone", emoji: "🔵" },
  { id: 29, title: "boblox?", message: "niña rata tamo", emoji: "🎭" },
  { id: 30, title: "🎁", message: "lit", emoji: "🎁" },
];

const insert = db.prepare('INSERT INTO gifts (id, title, message, emoji) VALUES (@id, @title, @message, @emoji)');

db.transaction((data) => {
  for (const gift of data) insert.run(gift);
})(gifts);

console.log("¡Base de datos reseteada y regalos insertados correctamente!");
