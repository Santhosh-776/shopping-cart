import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  getUserCartItems,
  addItemToFirestore,
  removeItemFromFirestore,
  syncLocalCartToFirestore,
  clearUserCart
} from "../services/cartService";

export const ShopContext = createContext();

export const Provider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);

        try {
          const firestoreCartItems = await getUserCartItems(currentUser.uid);

          if (cartItems.length > 0) {
            await syncLocalCartToFirestore(currentUser.uid, cartItems);
            const updatedCartItems = await getUserCartItems(currentUser.uid);
            setCartItems(updatedCartItems);
          } else {
            setCartItems(firestoreCartItems);
          }
        } catch (error) {
          // Keep local cart items if Firestore fails
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setCartItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUser = (userData) => {
    setUser(userData);
  };
  const addToCart = async (product) => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      // First update Firestore, then update local state based on result
      const success = await addItemToFirestore(user.uid, product);
      if (success) {
        setCartItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (item) => item.asin === product.asin
          );
          if (existingItemIndex > -1) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex].count++;
            return updatedItems;
          } else {
            return [...prevItems, { ...product, count: 1 }];
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const removeFromCart = async (asin) => {
    if (!isAuthenticated || !user) {
      return false;
    }

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.asin === asin
      );
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        if (updatedItems[existingItemIndex].count > 1) {
          updatedItems[existingItemIndex].count -= 1;
          return updatedItems;
        } else {
          return prevItems.filter((item) => item.asin !== asin);
        }
      }
      return prevItems;
    });

    try {
      const success = await removeItemFromFirestore(user.uid, asin);
      if (!success) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !user) {
      return false;
    }

    setCartItems([]);

    try {
      await clearUserCart(user.uid);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <ShopContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      user,
      handleUser,
      loading,
      isAuthenticated
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export default Provider;