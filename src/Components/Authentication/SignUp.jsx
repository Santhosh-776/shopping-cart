import { useContext, useState } from 'react';
import { auth, googleprovider } from '../../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth';
import { ShopContext } from '../../sections/ShopContext';
import { useNavigate, Link } from 'react-router-dom';

const signUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { handleUser } = useContext(ShopContext);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSetUser = () => {
        if (auth.currentUser) {
            handleUser(auth.currentUser);
        }
    };

    const closeAuth = () => {
        navigate("/");
    };

    const signUp = async () => {
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
            setMessage('Sign-up successful! Redirecting to login page...');
            console.log('Navigating to login...');
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setMessage("Email already in use");
                    break;
                case 'auth/invalid-email':
                    console.log(`Email address ${email} is invalid.`);
                    setMessage("Invalid Email");
                    break;
                case 'auth/operation-not-allowed':
                    console.log(`Error during sign up.`);
                    setMessage("Error during sign up");
                    break;
                case 'auth/weak-password':
                    console.log('Password is not strong enough. Add additional characters including special characters and numbers.');
                    setMessage("Password not strong enough");
                    break;
                default:
                    console.log(error.message);
                    setMessage(error.message);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, googleprovider);
            navigate("/");
        } catch (error) {
            console.error('Error during sign in', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex  items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 backdrop-blur-sm z-0"></div>

            <div className="bg-white text-black p-8 rounded-lg shadow-lg w-96 z-10 flex flex-col gap-5">
                <div className='flex flex-col gap-4'>
                    <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>
                    <input
                        placeholder="Email"
                        type="email"
                        className="p-2 rounded-md bg-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        className="p-2 rounded-md bg-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md text-white transition duration-300"
                        onClick={signUp}
                        disabled={loading}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <p className='text-center'>
                        Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-800 font-bold text-sm" >Login</Link>
                    </p>
                </div>

                {message && <p className="text-green-500 text-center">{message}</p>}

                <button onClick={signInWithGoogle} disabled={loading}>
                    Sign In with Google
                </button>

                <button
                    className="mt-4 text-sm text-gray-800 hover:text-gray-200"
                    onClick={closeAuth}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default signUp;
