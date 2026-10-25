
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "Men",
        "Women",
        "Unisex",
        "Accessories",
      ],
    },

    image: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL"],
      validate: {
        validator: (sizes) =>
          sizes.every((size) =>
            ["XS", "S", "M", "L", "XL", "XXL", "Free Size"]
              .includes(size)
          ),
        message: "Invalid clothing size",
      },
    },

    collection: {
      type: String,
      enum: [
        "New Arrivals",
        "Winter Collection",
        "Regular Collection",
      ],
      default: "Regular Collection",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
