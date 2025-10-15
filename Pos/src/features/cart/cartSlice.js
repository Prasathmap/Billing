// features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  paymentMethods: {
    Cash: 0,
    CreditCard: 0,
    OnlinePay: 0,
    Rupay: 0,
  },

};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add a product to the cart
    addProduct: (state, action) => {
      const product = action.payload;
      const existingProduct = state.items.find((item) => item._id === product._id);

      if (existingProduct) {
        existingProduct.quantity += 1; // Increase quantity if product already exists
      } else {
        state.items.push({ ...product, quantity: 1 }); // Add new product to cart
      }
    },
    setCart: (state, action) => {
      state.items = action.payload;
    },
    // Increase the quantity of a product in the cart
    increase: (state, action) => {
      const productId = action.payload;
      const product = state.items.find((item) => item._id === productId);

      if (product) {
        product.quantity += 1;
      }
    },

    // Decrease the quantity of a product in the cart
    decrease: (state, action) => {
      const productId = action.payload;
      const product = state.items.find((item) => item._id === productId);

      if (product && product.quantity > 1) {
        product.quantity -= 1;
      }
    },

    // Delete a product from the cart
    deleteProduct: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
    },

    // Update the quantity of a product in the cart
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const product = state.items.find((item) => item._id === id);

      if (product) {
        product.quantity = quantity;
      }
    },
    // Update payment methods
    updatePaymentMethod: (state, action) => {
      const { method, amount } = action.payload;
    
      state.paymentMethods = {
        ...state.paymentMethods, // Preserve existing payment methods
        [method]: amount, // Update the specific method
      };
    },
    
    // Clear the entire cart
    clearCart: (state) => {
      state.items = [];
    },

    // Reset the cart state to initial state
    resetState: () => initialState,
  },
});

// Export actions
export const { addProduct, increase, decrease, deleteProduct,updateQuantity,updatePaymentMethod, clearCart, resetState,setCart } = cartSlice.actions;

// Export the reducer
export default cartSlice.reducer;