
export const addToCart = (product) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existingProduct = cart.find(
    (item) => item._id === product._id
  );

  if (existingProduct) {
    existingProduct.quantity = (existingProduct.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  return cart;
};

export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart") || "[]");
};
