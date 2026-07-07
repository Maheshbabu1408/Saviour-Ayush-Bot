const {
  default: makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const QRCode = require("qrcode-terminal");
const P = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, qr }) => {
        if (qr) {
            console.log("📱 Scan this QR Code:");
            QRCode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ WhatsApp Connected Successfully!");
        }
    });

    console.log("✅ Saviour Ayush Bot Started");
}

module.exports = { startBot };
