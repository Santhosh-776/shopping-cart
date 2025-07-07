import { useContext, useState } from 'react';
import { auth, googleprovider } from '../../config/firebase';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { ShopContext } from '../../sections/ShopContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
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

    const SignIn = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password.trim());
            navigate("/");
        } catch (error) {
            console.error('Error during sign in', error.message);
            setMessage('Sign-In Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await signInWithPopup(auth, googleprovider);
            setMessage('Sign-in successful! Redirecting to home page...');
            navigate("/");
        } catch (error) {
            console.error('Error during sign in with Google', error.message);
            setMessage('Sign-In Error: ' + error.message);
            if (error.code === 'auth/invalid-credential') {
                console.log('Credentials are malformed or invalid.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex  items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 backdrop-blur-sm z-0"></div>

            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-96 z-10 flex flex-col gap-5">
                <div className='flex flex-col gap-4'>
                    <h2 className="text-2xl font-semibold text-center mb-4">Sign In</h2>
                    <input
                        placeholder="Email"
                        type="email"
                        className="p-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        className="p-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md text-white transition duration-300"
                        onClick={SignIn}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                    <p className='text-center'>
                        New user? Click here to <Link to="/signup" className="text-blue-500 hover:text-blue-800 font-bold text-sm" >Sign Up</Link>
                    </p>
                </div>
                {message && <p className="text-red-500 text-center">{message}</p>}
                <button onClick={signInWithGoogle} disabled={loading}>
                    Sign In with Google
                </button>

                <button
                    className="mt-4 text-sm text-gray-400 hover:text-gray-200"
                    onClick={closeAuth}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Login;
