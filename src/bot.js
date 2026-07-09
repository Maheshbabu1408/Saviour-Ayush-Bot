const {
  default: makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const QRCode = require("qrcode-terminal");
const P = require("pino");

const config = require("../config/config");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("📱 Scan the QR Code below:");
      QRCode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(`✅ ${config.BOT_NAME} is now online!`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message) return;
    if (msg.key.fromMe) return;

    const jid = msg.key.remoteJid;

    // Ignore group messages
    if (jid.endsWith("@g.us")) return;

    await sock.sendMessage(jid, {
      text: `🙏 *Welcome to ${config.BOT_NAME}* 🌿

Namaste!

Thank you for contacting *${config.BOT_NAME}*.

Please choose an option:

1️⃣ Book Appointment
2️⃣ Doctor Timings
3️⃣ Treatments
4️⃣ Hospital Location
5️⃣ Contact Us

Reply with the option number.`,
    });
  });
}

module.exports = { startBot };
