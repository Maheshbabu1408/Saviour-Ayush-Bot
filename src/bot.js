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
}

module.exports = { startBot };
