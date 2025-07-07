import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation, useNavigation } from 'react-router-dom';
import Account from '../Components/Account';
import cartIcon from '../assets/icons/shopping-cart.png';
import searchIcon from '../assets/icons/search.svg';
import { ShopContext } from './ShopContext';
import LoadingScreen from '../Components/LoadingScreen';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [inputValue, setInputValue] = useState('');
    const { cartItems, user } = useContext(ShopContext);
    const navigation = useNavigation();

    useEffect(() => {
        if (location.pathname === '/') {
            setInputValue('');
        }
    }, [location.pathname]);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate(`/searchresults?q=${encodeURIComponent(inputValue)}`);
        }
    };

    if (navigation.state === "loading") {
        return <LoadingScreen message="Searching for products..." />;
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleCartClick = () => {
        navigate('/cart');
    };

    // Calculate total items in cart
    const totalCartItems = cartItems.reduce((total, item) => total + item.count, 0);

    return (
        <header className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white w-full xl:px-20">
            <div className="flex justify-between w-full sm:w-auto mb-4 sm:mb-0">
                <Link to='/' className="lg:text-2xl text-xl font-bold text-blue-500 cursor-pointer">ShopOn</Link>
                <div className="flex items-center gap-6 sm:hidden">
                    <Account />
                    <div
                        className="relative flex justify-center items-center cursor-pointer gap-2"
                        onClick={handleCartClick}
                    >
                        Cart
                        <img src={cartIcon} className="w-8" alt="Cart" />
                        {totalCartItems > 0 && (
                            <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {totalCartItems}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative flex-1 max-w-xl mx-4 w-full sm:w-auto">
                <input
                    className="border border-blue-200 bg-blue-50 rounded-lg w-full h-10 pl-12 pr-3 xl:w-[800px] focus:outline-none"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search"
                />
                <img
                    src={searchIcon}
                    alt="search"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6"
                />
            </div>

            <div className="hidden sm:flex items-center gap-6">
                <Account />
                <div
                    className="relative flex justify-center items-center cursor-pointer gap-2"
                    onClick={handleCartClick}
                >
                    Cart
                    <img src={cartIcon} className="w-8" alt="Cart" />
                    {totalCartItems > 0 && (
                        <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {totalCartItems}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
