const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const PHONE_NUMBER = "919493932631";

async function createConnection() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["Saviour Ayush Bot", "Chrome", "1.0.0"],
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, qr }) => {
    if ((connection === "connecting" || qr) && !sock.authState.creds.registered) {
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        console.log("\n🔑 Pairing Code:", code, "\n");
      } catch (err) {
        console.error("Failed to generate pairing code:", err);
      }
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }
  });

  return sock;
}

module.exports = { createConnection };
