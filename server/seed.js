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
  { id: 1, title: "¡felipumpe  ! ", message: "¡Hoy es TU día! La persona más increíble del mundo cumple años y yo soy la más afortunada por tenerte. Que este año te traiga todo lo que mereces (que es TODO). ¡Te amo, Bell! 🎀🎂💕", emoji: "🎂" },
  { id: 2, title: "Playlist secreta 🎵", message: "Hoy te dedico una canción de Billie Eilish. Escucha 'Ocean Eyes' pensando en mí 💙", emoji: "🎧" },
  { id: 3, title: "Abrazo virtual 🤗", message: "Imagina que te estoy abrazando ahora mismo. Bien fuerte. No te suelto. 🫂", emoji: "🧸" },
  { id: 4, title: "Dato curioso ✨", message: "¿Sabías que en el mundo de Ghibli, Totoro solo aparece ante personas de corazón puro? Por eso tú lo verías siempre 🌿", emoji: "🍃" },
  { id: 5, title: "Cupón de película 🎬", message: "Vale por una noche de pelis de Studio Ghibli juntos. Tú eliges cuál 🏰", emoji: "🎬" },
  { id: 6, title: "Stray Kids moment 🐺", message: "Como dice SKZ: 'You make Stray Kids stay'. Tú me haces quedarme siempre 💫", emoji: "⭐" },
  { id: 7, title: "Deseo de estrella ⭐", message: "Hoy pide un deseo. El universo conspira para que se cumpla porque tú lo mereces todo 🌙", emoji: "🌟" },
  { id: 8, title: "¡5 Meses juntas! 💗", message: "Hoy cumplimos 5 meses y cada día a tu lado es mejor que el anterior. Gracias por ser mi persona favorita, Bell. Aquí vamos por muchos más meses, años y toda la vida 💗🎀", emoji: "💝" },
  { id: 9, title: "Gatito para ti 🐱", message: "Si fueras un personaje de Hello Kitty, serías la protagonista porque todo gira alrededor de lo linda que eres 🎀", emoji: "🐱" },
  { id: 10, title: "Carta de amor 💌", message: "Cada día que pasa me enamoro más de ti. No es cursi, es la verdad más honesta que tengo 💕", emoji: "💌" },
  { id: 11, title: "Susurro mágico 🌸", message: "El viento de hoy lleva un mensaje: Bell es increíble y el mundo es mejor con ella 🌺", emoji: "🌸" },
  { id: 12, title: "Recuerdo bonito 📸", message: "Piensa en nuestro mejor momento juntos. ¿Ya? Pues habrá miles más así 📷", emoji: "📸" },
  { id: 13, title: "Poder secreto ⚡", message: "Tu superpoder es hacer sonreír a todos a tu alrededor sin siquiera intentarlo ✨", emoji: "⚡" },
  { id: 14, title: "Jardín mágico 🌷", message: "Si cada 'te quiero' fuera una flor, ya tendrías un jardín infinito 🌻", emoji: "🌷" },
  { id: 15, title: "Mundo Ghibli 🏯", message: "En un mundo de Ghibli, tú serías la heroína valiente y hermosa que salva todo con bondad 🌾", emoji: "🏯" },
  { id: 16, title: "Beat drop 🎤", message: "Si Stray Kids hiciera una canción sobre ti, sería su mejor hit. Título: 'Bell' 🎶", emoji: "🎤" },
  { id: 17, title: "Magia nocturna 🌙", message: "La luna de hoy brilla pensando en ti. Ok, tal vez no, pero yo sí ✨🌙", emoji: "🌙" },
  { id: 18, title: "Promesa 🤞", message: "Te prometo que siempre voy a estar para ti. En los días buenos y en los no tan buenos 💪", emoji: "🤞" },
  { id: 19, title: "Billie mood 🖤", message: "'I'm the bad guy' dice Billie, pero tú eres todo lo bueno en mi vida 🦋", emoji: "🦋" },
  { id: 20, title: "Tesoro escondido 💎", message: "Encontraste el tesoro del día: saber que alguien piensa en ti cada segundo 💎", emoji: "💎" },
  { id: 21, title: "Lluvia de estrellas 🌠", message: "Esta noche mira al cielo. Cada estrella es un motivo por el que te quiero ⭐", emoji: "🌠" },
  { id: 22, title: "Sonrisa gatuna 😸", message: "Hello Kitty no tiene boca pero si la tuviera, sonreiría al conocerte 🎀", emoji: "😸" },
  { id: 23, title: "Aventura Ghibli 🌿", message: "Quisiera llevarte al castillo ambulante y viajar juntos por los cielos 🏰☁️", emoji: "🌿" },
  { id: 24, title: "Código secreto 🔐", message: "Nuestro código secreto: cada vez que veas un corazón rosa, soy yo mandándote amor 💗", emoji: "🔐" },
  { id: 25, title: "Festival SKZ 🎪", message: "Imagina que estamos en un concierto de Stray Kids juntos. La pasaríamos increíble 🤘", emoji: "🎪" },
  { id: 26, title: "Espíritu libre 🕊️", message: "Eres como el espíritu del bosque en Ghibli: mágica, libre y absolutamente hermosa 🌲", emoji: "🕊️" },
  { id: 27, title: "Noche Billie 🌃", message: "Ponemos 'Lovely' de Billie y nos quedamos en silencio, solo estando juntos 💜", emoji: "🌃" },
  { id: 28, title: "Corona de flores 👑", message: "Te corono oficialmente como la persona más especial de mi universo 👑🌸", emoji: "👑" },
  { id: 29, title: "Casi el final 🎭", message: "Se acaba abril pero nunca se acaba lo que siento por ti. Esto es solo el comienzo 💫", emoji: "🎭" },
  { id: 30, title: "Último regalo 🎁", message: "El mejor regalo de todos: saber que mañana y todos los días seguiré eligiéndote a ti, Bell 💕🎀", emoji: "🎁" },
];

const insert = db.prepare('INSERT INTO gifts (id, title, message, emoji) VALUES (@id, @title, @message, @emoji)');

db.transaction((data) => {
  for (const gift of data) insert.run(gift);
})(gifts);

console.log("¡Base de datos reseteada y regalos insertados correctamente!");
