import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_STATE: 'SET_STATE',
};

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const calculateCartState = (items) => {
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  return { items, itemCount, total };
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(i => i.id === action.payload.id && i.type === action.payload.type);
      if (existingItem) {
        toast.error('Este item ya está en tu carrito.');
        return state;
      }
      const newItems = [...state.items, { ...action.payload, quantity: 1 }];
      return calculateCartState(newItems);
    }
    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(i => !(i.id === action.payload.id && i.type === action.payload.type));
      return calculateCartState(newItems);
    }
    case CART_ACTIONS.UPDATE_QUANTITY: {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: action.payload });
      }
      const newItems = state.items.map(i => 
        (i.id === action.payload.id && i.type === action.payload.type) 
          ? { ...i, quantity: action.payload.quantity } 
          : i
      );
      return calculateCartState(newItems);
    }
    case CART_ACTIONS.CLEAR_CART: {
      return initialState;
    }
    case CART_ACTIONS.SET_STATE: {
      return action.payload;
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, userHasPurchased } = useAuth();

  // Cargar carrito desde localStorage al inicio
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed.items) {
          dispatch({ type: CART_ACTIONS.SET_STATE, payload: calculateCartState(parsed.items) });
        }
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items: state.items }));
  }, [state.items]);

  // Verificar si el usuario ya ha comprado items en el carrito
  useEffect(() => {
    if (user && state.items.length > 0) {
      const itemsToRemove = state.items.filter(item => userHasPurchased(item.id, item.type));
      if (itemsToRemove.length > 0) {
        let currentItems = state.items;
        itemsToRemove.forEach(item => {
          toast.info(`'${item.name}' ya fue adquirido y se ha quitado del carrito.`);
          currentItems = currentItems.filter(i => !(i.id === item.id && i.type === item.type));
        });
        dispatch({ type: CART_ACTIONS.SET_STATE, payload: calculateCartState(currentItems) });
      }
    }
  }, [user, state.items, userHasPurchased]);

  const addToCart = (item) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item });
    toast.success(`'${item.name}' añadido al carrito.`);
  };

  const removeFromCart = (id, type) => {
    const item = state.items.find(i => i.id === id && i.type === type);
    if (item) {
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id, type } });
      toast.success(`'${item.name}' eliminado del carrito.`);
    }
  };

  const updateQuantity = (id, type, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id, type, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook personalizado para usar el carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
