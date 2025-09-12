import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      // Add item to cart
      addToCart: (product) => {
        const items = get().items;
        const existingItem = items.find(item => 
          item.id === product.id && item.type === product.type
        );

        if (existingItem) {
          // Update quantity if item exists
          set({
            items: items.map(item =>
              item.id === product.id && item.type === product.type
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            )
          });
        } else {
          // Add new item
          set({
            items: [...items, { ...product, quantity: 1 }]
          });
        }
        get().calculateTotal();
      },

      // Remove item from cart
      removeFromCart: (productId, productType) => {
        set({
          items: get().items.filter(item => 
            !(item.id === productId && item.type === productType)
          )
        });
        get().calculateTotal();
      },

      // Update item quantity
      updateQuantity: (productId, productType, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, productType);
        } else {
          set({
            items: get().items.map(item =>
              item.id === productId && item.type === productType
                ? { ...item, quantity }
                : item
            )
          });
          get().calculateTotal();
        }
      },

      // Calculate total
      calculateTotal: () => {
        const total = get().items.reduce((sum, item) => {
          return sum + (item.price * (item.quantity || 1));
        }, 0);
        set({ total });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [], total: 0 });
      },

      // Get cart count
      getCartCount: () => {
        return get().items.reduce((count, item) => 
          count + (item.quantity || 1), 0
        );
      },

      // Check if item is in cart
      isInCart: (productId, productType) => {
        return get().items.some(item => 
          item.id === productId && item.type === productType
        );
      },

      // Get item from cart
      getCartItem: (productId, productType) => {
        return get().items.find(item => 
          item.id === productId && item.type === productType
        );
      }
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage
    }
  )
);

export { useCartStore };
