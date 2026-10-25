
const Cart = require("../Models/Cart");
const Product = require("../Models/Product");

// Get the logged-in user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.status(200).json({
      items: cart ? cart.items : [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a product to the cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    const qty = Number(quantity);

    if (
      !productId ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      !size
    ) {
      return res.status(400).json({
        message: "Valid product ID, quantity and size are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        message: "Requested quantity is unavailable",
      });
    }

    if (
      Array.isArray(product.sizes) &&
      !product.sizes.includes(size)
    ) {
      return res.status(400).json({
        message: "Selected size is unavailable",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size
    );

    if (existingItem) {
      if (existingItem.quantity + qty > product.stock) {
        return res.status(400).json({
          message: "Requested quantity exceeds available stock",
        });
      }

      existingItem.quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        size,
      });
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    res.status(200).json({
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    const product = await Product.findById(item.product);

    if (!product || qty > product.stock) {
      return res.status(400).json({
        message: "Requested quantity is unavailable",
      });
    }

    item.quantity = qty;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    res.status(200).json({
      message: "Cart updated",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove an item from the cart
const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    item.deleteOne();
    await cart.save();

    res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear the cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } }
    );

    res.status(200).json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
