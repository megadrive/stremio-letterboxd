import "dotenv/config";
import express from "express";
const app = express();

app.all("/*path", (req, res) => {
  return res.redirect("https://stremboxd.com");
});

app.listen(process.env.PORT ?? 3000, () => {
  console.log("Server is running on port 3000");
});
