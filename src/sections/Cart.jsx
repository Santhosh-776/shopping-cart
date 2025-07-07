import { useContext } from 'react';
import { ShopContext } from './ShopContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, loading, user, isAuthenticated } = useContext(ShopContext);
    const navigate = useNavigate();

    const handleViewProduct = (product) => {
        console.log(product);
        navigate(`/product/${product.asin}`, { state: { product } });
    };

    const handleClearCart = async () => {
        if (!isAuthenticated || !user) {
            alert('Please log in to manage your cart');
            return;
        }

        if (window.confirm('Are you sure you want to clear your cart?')) {
            const success = await clearCart();
            if (!success) {
                alert('Failed to clear cart. Please try again.');
            }
        }
    };

    const handleRemoveFromCart = async (asin) => {
        if (!isAuthenticated || !user) {
            alert('Please log in to manage your cart');
            return;
        }

        const success = await removeFromCart(asin);
        if (!success) {
            alert('Failed to remove item. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <p>Loading cart...</p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="p-6 text-center">
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Cart Access Restricted</h2>
                    <p className="text-gray-600 mb-6">
                        Please log in to view and manage your cart items.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="p-6">
            {cartItems.length > 0 ? (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Your Cart</h2>
                        <button
                            onClick={handleClearCart}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {user && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded">
                            <p className="text-green-700">✓ Cart synced with your account</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {cartItems.map((item) => (
                            <div key={item.asin} className="border p-4 rounded-lg shadow-md flex">
                                <img
                                    src={item.product_photo}
                                    alt={item.product_title}
                                    className="w-20 h-20 object-contain rounded-md"
                                />
                                <div className="ml-4 flex-1">
                                    <p className="text-lg font-semibold text-gray-700 hover:text-blue-700 hover:cursor-pointer"
                                        onClick={() => handleViewProduct(item)}>{item.product_title}</p>
                                    <p className="text-blue-500 font-medium text-md">{item.product_price}</p>
                                    <p className="text-gray-600">Quantity: {item.count}</p>
                                    <button
                                        onClick={() => handleRemoveFromCart(item.asin)}
                                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                    >
                                        Remove One
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-xl mb-4">Your cart is empty.</p>
                    {!user && (
                        <p className="text-gray-600 mb-4">
                            Sign in to sync your cart across devices!
                        </p>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Continue Shopping
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;
