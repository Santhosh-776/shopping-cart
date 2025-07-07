import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

const CART_COLLECTION = "cartItems";

/**
 * Get all cart items for a specific user
 * @param {string} userId - The user's unique ID
 * @returns {Array} Array of cart items
 */
export const getUserCartItems = async (userId) => {
    if (!userId) return [];

    try {
        console.log("Fetching cart items for user:", userId);
        const cartQuery = query(
            collection(db, CART_COLLECTION),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(cartQuery);
        const cartItems = [];

        querySnapshot.forEach((doc) => {
            cartItems.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        console.log("Successfully fetched cart items:", cartItems.length);
        if (cartItems.length === 0) {
            console.log(
                "No existing cart items found - this is normal for new users or empty collections"
            );
        }
        return cartItems;
    } catch (error) {
        console.error("Error fetching cart items:", error);
        console.error("Error details:", {
            code: error.code,
            message: error.message,
            userId: userId,
        });
        return [];
    }
};

/**
 * Add item to cart in Firestore
 * @param {string} userId - The user's unique ID
 * @param {Object} product - The product to add
 * @returns {boolean} Success status
 */
export const addItemToFirestore = async (userId, product) => {
    if (!userId) return false;

    try {
        // Debug current user and auth state
        const currentUser = auth.currentUser;
        console.log("Cart service auth state:", {
            userId,
            currentUserUid: currentUser?.uid,
            isAuthenticated: !!currentUser,
            hasIdToken: !!currentUser?.accessToken,
            userEmail: currentUser?.email,
        });

        if (!currentUser) {
            console.error("No authenticated user found");
            return false;
        }

        try {
            const idToken = await currentUser.getIdToken(true);
            console.log(
                "ID Token obtained successfully, length:",
                idToken.length
            );
        } catch (tokenError) {
            console.error("Failed to get ID token:", tokenError);
            return false;
        }

        const cartItemId = `${userId}_${product.asin}`;
        const cartItemRef = doc(db, CART_COLLECTION, cartItemId);

        console.log("Attempting Firestore operation:", {
            collection: CART_COLLECTION,
            documentId: cartItemId,
            operation: "add/update item",
        });

        const cartItemDoc = await getDoc(cartItemRef);

        if (cartItemDoc.exists()) {
            const currentData = cartItemDoc.data();
            console.log(
                "Updating existing item, current count:",
                currentData.count
            );
            await updateDoc(cartItemRef, {
                count: currentData.count + 1,
                updatedAt: new Date().toISOString(),
            });
            console.log("Item updated successfully");
        } else {
            console.log("Creating new cart item");
            await setDoc(cartItemRef, {
                userId,
                asin: product.asin,
                product_title: product.product_title,
                product_price: product.product_price,
                product_photo: product.product_photo,
                product_url: product.product_url,
                count: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            console.log("New item created successfully");
        }

        return true;
    } catch (error) {
        console.error("Error adding item to Firestore:", error);
        console.error("Error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack,
        });
        return false;
    }
};

/**
 * Remove item from cart in Firestore
 * @param {string} userId - The user's unique ID
 * @param {string} asin - The product's ASIN
 * @returns {boolean} Success status
 */
export const removeItemFromFirestore = async (userId, asin) => {
    if (!userId) return false;

    try {
        const cartItemId = `${userId}_${asin}`;
        const cartItemRef = doc(db, CART_COLLECTION, cartItemId);

        // Check if item exists
        const cartItemDoc = await getDoc(cartItemRef);

        if (cartItemDoc.exists()) {
            const currentData = cartItemDoc.data();

            if (currentData.count > 1) {
                // Decrease count
                await updateDoc(cartItemRef, {
                    count: currentData.count - 1,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                // Remove item completely
                await deleteDoc(cartItemRef);
            }

            return true;
        }

        return false;
    } catch (error) {
        console.error("Error removing item from Firestore:", error);
        return false;
    }
};

/**
 * @param {string} userId - The user's unique ID
 * @returns {boolean} Success status
 */
export const clearUserCart = async (userId) => {
    if (!userId) return false;

    try {
        const cartQuery = query(
            collection(db, CART_COLLECTION),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(cartQuery);

        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });

        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
    }
};

/**
 * Sync local cart items to Firestore when user logs in
 * @param {string} userId - The user's unique ID
 * @param {Array} localCartItems - Local cart items to sync
 * @returns {boolean} Success status
 */
export const syncLocalCartToFirestore = async (userId, localCartItems) => {
    if (!userId || !localCartItems.length) return false;

    try {
        const syncPromises = localCartItems.map(async (item) => {
            const cartItemId = `${userId}_${item.asin}`;
            const cartItemRef = doc(db, CART_COLLECTION, cartItemId);

            // Check if item already exists in Firestore
            const cartItemDoc = await getDoc(cartItemRef);

            if (cartItemDoc.exists()) {
                // Merge counts (local + firestore)
                const firestoreData = cartItemDoc.data();
                await updateDoc(cartItemRef, {
                    count: firestoreData.count + item.count,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                await setDoc(cartItemRef, {
                    userId,
                    asin: item.asin,
                    product_title: item.product_title,
                    product_price: item.product_price,
                    product_photo: item.product_photo,
                    product_url: item.product_url,
                    count: item.count,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        });

        await Promise.all(syncPromises);
        return true;
    } catch (error) {
        console.error("Error syncing local cart to Firestore:", error);
        return false;
    }
};

export const testFirebaseConnection = async () => {
    try {
        const currentUser = auth.currentUser;
        console.log("=== Firebase Connection Test ===");
        console.log(
            "Current user:",
            currentUser
                ? {
                      uid: currentUser.uid,
                      email: currentUser.email,
                      emailVerified: currentUser.emailVerified,
                  }
                : "No user"
        );

        if (!currentUser) {
            return false;
        }

        const idToken = await currentUser.getIdToken();
        console.log("✅ ID Token obtained, length:", idToken.length);

        const testQuery = query(
            collection(db, CART_COLLECTION),
            where("userId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(testQuery);
        console.log(" Firestore read successful, documents:", snapshot.size);

        const testDocRef = doc(
            db,
            CART_COLLECTION,
            `test_${currentUser.uid}_${Date.now()}`
        );
        console.log("Testing write to document:", testDocRef.path);

        await setDoc(testDocRef, {
            userId: currentUser.uid,
            test: true,
            timestamp: new Date().toISOString(),
        });
        console.log(
            "✅ Firestore write successful - collection created/verified"
        );

        await deleteDoc(testDocRef);
        console.log("✅ Test document cleaned up");

        console.log("=== All tests passed! ===");
        return true;
    } catch (error) {
        console.error("Firebase test failed:", error);
        console.error("Error details:", {
            code: error.code,
            message: error.message,
        });
        return false;
    }
};
