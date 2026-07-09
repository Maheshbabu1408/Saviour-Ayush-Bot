const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const QRCode = require("qrcode-terminal");
const P = require("pino");
const config = require("../config/config");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("\n📱 Scan this QR Code:\n");
      QRCode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(`✅ ${config.BOT_NAME} Connected Successfully`);
    }

    if (connection === "close") {
      console.log("❌ Disconnected... Reconnecting");

      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        startBot();
      } else {
        console.log("⚠️ Logged out. Delete the session folder and scan again.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message) return;
    if (msg.key.fromMe) return;

    const jid = msg.key.remoteJid;

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
