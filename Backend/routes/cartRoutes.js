
const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../Controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All cart routes require login
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/item/:itemId", updateCartItem);
router.delete("/item/:itemId", removeCartItem);
router.delete("/clear", clearCart);

module.exports = router;
