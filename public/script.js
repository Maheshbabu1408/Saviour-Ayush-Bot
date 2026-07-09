document.getElementById("pairBtn").addEventListener("click", async () => {

    const number = document.getElementById("number").value;

    if (!number) {
        alert("Please enter your WhatsApp number");
        return;
    }

    document.getElementById("result").innerHTML = "⏳ Generating Pair Code...";

    try {

        const res = await fetch("/pair", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                number
            })
        });

        const data = await res.json();

        if (data.code) {
            document.getElementById("result").innerHTML =
                "🔑 Pair Code : <br><br><b>" + data.code + "</b>";
        } else {
            document.getElementById("result").innerHTML =
                "❌ " + data.error;
        }

    } catch (e) {

        document.getElementById("result").innerHTML =
            "❌ Server Error";

    }

});
