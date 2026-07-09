const { getSocket } = require("./socket");

async function generatePairCode(number) {
    const sock = getSocket();

    if (!sock) {
        throw new Error("WhatsApp socket not initialized.");
    }

    if (!number) {
        throw new Error("Phone number is required.");
    }

    const cleanNumber = number.replace(/\D/g, "");

    const code = await sock.requestPairingCode(cleanNumber);

    return code.match(/.{1,4}/g)?.join("-") || code;
}

module.exports = {
    generatePairCode,
};
