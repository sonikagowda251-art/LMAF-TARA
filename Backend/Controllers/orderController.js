
const mongoose = require("mongoose");
const Cart = require("../Models/Cart");
const Product = require("../Models/Product");
const Order = require("../Models/Order");

// Place an order
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          message: "A product in your cart no longer exists",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock or has insufficient stock`,
        });
      }

      if (
        Array.isArray(product.sizes) &&
        !product.sizes.includes(item.size)
      ) {
        return res.status(400).json({
          message: `Size ${item.size} is unavailable for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
      });

      totalPrice += product.price * item.quantity;
    }

    // Stock changes and order creation are atomic
    // when MongoDB is configured as a replica set.
    await session.withTransaction(async () => {
      for (const item of orderItems) {
        const result = await Product.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          throw new Error(
            `Insufficient stock for ${item.name}. Please try again.`
          );
        }
      }

      await Order.create(
        [
          {
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            status: "Pending",
            paymentStatus:
              paymentMethod === "COD" ? "Pending" : "Pending",
          },
        ],
        { session }
      );

      await Cart.updateOne(
        { user: req.user.id },
        { $set: { items: [] } },
        { session }
      );
    });

    const order = await Order.findOne({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Unable to place order",
    });
  } finally {
    await session.endSession();
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one of the logged-in user's orders
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
