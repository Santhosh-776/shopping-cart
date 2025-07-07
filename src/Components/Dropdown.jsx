import { LogOut } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { auth } from '../config/firebase';
import { signOut } from "firebase/auth";
import { ShopContext } from "../sections/ShopContext";

const Dropdown = ({ type, list, user }) => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out successfully");
        } catch (error) {
            console.error("Error logging out: ", error.message);
        }
    };

    return (
        <div className='bg-white shadow-lg rounded-md p-3 w-60'>
            <ul>
                {user ? (
                    <>
                        <li className='flex items-center gap-2 hover:bg-gray-300 p-2 rounded-md cursor-pointer' onClick={handleLogout}>
                            <LogOut className='w-5 h-5' />
                            <span>{type}</span>
                        </li>
                        {list.map((item, index) => (
                            <li key={index} className='flex items-center gap-2 hover:bg-gray-300 p-2 rounded-md cursor-pointer'>
                                <img src={item.icon} alt={item.name} className='w-5 h-5' />
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </>
                ) : (
                    list.map((item, index) => (
                        <li key={index} className='flex items-center gap-2 hover:bg-gray-300 p-2 rounded-md cursor-pointer'>
                            <img src={item.icon} alt={item.name} className='w-5 h-5' />
                            <span>{item.name}</span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default Dropdown;
