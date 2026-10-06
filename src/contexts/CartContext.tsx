import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  type: "ticket" | "rental" | "service";
  name: string;
  price: number;
  quantity: number;
  image?: string;
  // Specific fields
  startDate?: string;
  endDate?: string;
  days?: number;
  includeSetup?: boolean;
  packageType?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartDelivery: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("kundwa_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("kundwa_cart", JSON.stringify(newItems));
  };

  const addToCart = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    const existingIndex = items.findIndex((item) => item.id === newItem.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += qty;
    } else {
      updated = [...items, { ...newItem, quantity: qty } as CartItem];
    }

    saveCart(updated);
    toast.success(`${newItem.name} added to cart!`);
  };

  const removeFromCart = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    saveCart(updated);
    toast.info("Item removed from cart");
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = items.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Calculations
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = items.reduce((acc, item) => {
    if (item.type === "rental") {
      const rentalDays = item.days || 1;
      return acc + item.price * item.quantity * rentalDays;
    }
    return acc + item.price * item.quantity;
  }, 0);

  // Rwanda VAT: 18% on rentals & services, tickets are usually exempt or flat
  const cartTax = parseFloat((cartSubtotal * 0.18).toFixed(2));

  // Delivery: flat setup and transport fee if rental setup is active
  const hasSetup = items.some((item) => item.type === "rental" && item.includeSetup);
  const cartDelivery = 0; // Delivery/setup fee for rentals is quote-based (no flat monetary rate displayed)

  const cartTotal = cartSubtotal + cartTax + cartDelivery;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTax,
        cartDelivery,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
