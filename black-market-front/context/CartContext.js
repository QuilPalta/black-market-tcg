'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito
  useEffect(() => {
    const savedCart = localStorage.getItem('black_market_cart');
    if (savedCart) {
        try {
            setCart(JSON.parse(savedCart));
        } catch(e) {
            console.error("Error cargando carrito", e);
            localStorage.removeItem('black_market_cart');
        }
    }
  }, []);

  // Guardar carrito
  useEffect(() => {
    localStorage.setItem('black_market_cart', JSON.stringify(cart));
  }, [cart]);

  // --- AGREGAR (Con Validación de Stock) ---
  const addToCart = (product) => {
    if (!product.id) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        // SI YA EXISTE: Validamos si al sumar 1 superamos el stock
        if (existing.quantity >= product.stock) {
            // Opcional: Podrías disparar un toast/alerta aquí
            return prev; 
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // SI ES NUEVO: Validamos si hay stock inicial (por seguridad)
      if (product.stock < 1) return prev;
      
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // --- BORRAR ---
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // --- ACTUALIZAR CANTIDAD (Con Validación de Stock) ---
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prev) =>
      prev.map((item) => {
          if (item.id === id) {
              // Validamos que la nueva cantidad no supere el stock del ítem
              if (newQuantity > item.stock) {
                  return item; // Retornamos el item sin cambios
              }
              return { ...item, quantity: newQuantity };
          }
          return item;
      })
    );
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);