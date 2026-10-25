
import { useEffect, useState } from "react";
import { fetchProducts } from "../utils/data";

// Shared catalog hook — fetches once (cached in the service layer)
export function useProducts() {
  const [state, setState] = useState({
    products: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    fetchProducts()
      .then((products) => {
        if (active) setState({ products, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ products: [], loading: false, error });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
