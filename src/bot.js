const {
  default: makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const QRCode = require("qrcode-terminal");
const P = require("pino");

const config = require("../config/config");
const handleMessage = require("./message");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("\n📱 Scan this QR Code:\n");
      QRCode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(`✅ ${config.BOT_NAME} Connected Successfully`);
    }

    if (connection === "close") {
      console.log(lastDisconnect);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    await handleMessage(sock, msg);
  });
}

module.exports = { startBot };
