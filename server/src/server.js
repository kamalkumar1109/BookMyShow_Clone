require("dotenv").config();

const app = require("./app");
const AppDataSource = require("./data-source");

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    console.log("🚀 Starting server...");
    console.log("👉 PORT:", PORT);

    await AppDataSource.connect();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
  }
})();