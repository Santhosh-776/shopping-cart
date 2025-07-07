import { useContext, useState } from 'react';
import profile from '../assets/icons/profile.svg';
import Dropdown from './Dropdown';
import { accountList } from '../constants';
import { Link } from 'react-router-dom';
import { ShopContext } from '../sections/ShopContext';

const Account = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { user } = useContext(ShopContext); // Get user from ShopContext

    const handleMouseOver = () => {
        setShowDropdown(true);
    };

    const handleMouseOut = () => {
        setShowDropdown(false);
    };

    return (
        <div
            className='relative flex justify-center items-center 
                        gap-3 hover:bg-blue-700
                        hover:text-white
                        px-1.5 rounded-lg cursor-pointer'
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            {user ? (
                // If user is logged in, display profile and username
                <div className="flex gap-2 items-center p-1">
                    <img src={profile} className='w-8' alt="Profile" />
                    <span>{user.displayName || user.email}</span>
                </div>
            ) : (
                // If user is not logged in, display "Login" link
                <Link to="/login" className='flex gap-2 items-center p-1'>
                    <img src={profile} className='w-8' alt="Profile" />
                    <span>Login</span>
                </Link>
            )}

            {/* Dropdown */}
            {showDropdown && (
                <div className='absolute top-full text-black z-10'>
                    <Dropdown type={user ? "Log out" : null} list={accountList} user={user} />
                </div>
            )}
        </div>
    );
};

export default Account;
