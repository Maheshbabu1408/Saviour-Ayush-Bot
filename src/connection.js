cconst {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

async function createConnection() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ["Saviour Ayush Bot", "Chrome", "1.0.0"],
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

module.exports = { createConnection };
