
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../Controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

// All order routes require login
router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
