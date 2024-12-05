const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;
app.use(express.json());
app.get("/send-msg", (req, res) => {
    res.send("Hello world")
});
app.listen(PORT, () => console.log("Server running at port " + PORT));