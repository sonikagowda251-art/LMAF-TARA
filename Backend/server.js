require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route and API health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    brand: "LMAF TARA",
    message: "LMAF TARA backend is running",
    features: [
      "Home",
      "Shop",
      "New Arrivals",
      "Winter Collection",
      "About Us",
      "Contact Us",
      "Product Search",
      "Shopping Cart",
      "Login and Account"
    ]
  });
});

// Load API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// Handle unexpected server errors
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: "Internal server error"
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`LMAF TARA server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
