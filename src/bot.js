const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
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

    console.log("✅ Saviour Ayush Bot Started");
}

module.exports = { startBot };
