const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const QRCode = require("qrcode-terminal");

async function createConnection() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["Saviour Ayush Bot", "Chrome", "1.0.0"],
    syncFullHistory: false,
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }

    if (qr) {
      console.log("📱 Scan this QR Code:\n");
      QRCode.generate(qr, { small: true });
    }

    if (connection === "close") {
      console.log("❌ WhatsApp Disconnected");
    }
  });

  return sock;
}

module.exports = { createConnection };
