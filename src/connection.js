const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const P = require("pino");
const { setSocket } = require("./socket");

const PHONE_NUMBER = "919493932631";

async function createConnection() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const logger = P({ level: "silent" });

  const sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ["Saviour Ayush Bot", "Chrome", "1.0.0"],
    printQRInTerminal: false,
    syncFullHistory: false,
  });

  // Save socket globally
  setSocket(sock);

  sock.ev.on("creds.update", saveCreds);

  let pairingRequested = false;

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;

    console.log("Connection Update:", update);

    if (
      qr &&
      !pairingRequested &&
      !sock.authState.creds.registered
    ) {
      pairingRequested = true;

      try {
        // Small delay to let the socket finish initialization
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const code = await sock.requestPairingCode(PHONE_NUMBER);

        console.log("\n==============================");
        console.log("PAIR CODE:", code);
        console.log("==============================\n");
      } catch (err) {
        pairingRequested = false;
        console.error("Pairing Error:", err);
      }
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }

    if (connection === "close") {
      console.log("❌ Connection Closed");
    }
  });

  return sock;
}

module.exports = { createConnection };
