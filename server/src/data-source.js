const mongoose = require("mongoose");

class AppDataSource {
  static async connect() {
    try {
      console.log("🔌 Connecting to DB...");
      console.log("👉 MONGODB_URI:", process.env.MONGODB_URI);

      await mongoose.connect(process.env.MONGODB_URI);

      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ DB CONNECTION ERROR:", err);
      throw err; // VERY IMPORTANT
    }
  }

  static async disconnect() {
    await mongoose.disconnect();
  }
}

module.exports = AppDataSource;