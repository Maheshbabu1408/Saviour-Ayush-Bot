const express = require("express");
const path = require("path");

const { startBot, generatePairCode } = require("./src/bot");

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/pair", async (req, res) => {
    try {
        let { number } = req.body;

        if (!number) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        number = number.replace(/\D/g, "");

        const code = await generatePairCode(number);

        return res.json({
            success: true,
            code
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

startBot();
