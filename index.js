const express = require("express");
const path = require("path");

const { startBot } = require("./src/bot");

const app = express();

const PORT = process.env.PORT || 8000;

// Parse JSON
app.use(express.json());

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Pair API (temporary)
app.post("/pair", async (req, res) => {

    const { number } = req.body;

    if (!number) {
        return res.json({
            error: "Phone number required"
        });
    }

    return res.json({
        code: "Coming Soon 🚀"
    });

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

startBot();
