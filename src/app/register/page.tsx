'use client';

import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
// import { setUser, googleLogin } from '../redux/authSlice';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import Link from "next/link";
import type { RootState } from '../redux/store';
import { AppDispatch } from '../redux/store';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../lib/firebase';
import { googleLogin } from "app/redux/authSlice";

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [signUpType] = useState<'google' | 'normal' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const auth = getAuth(app);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!username || !email || !password) {
                throw new Error('All fields are required');
            }

            // 1. Firebase registration
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            // 2. Sync with backend
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    username,
                    email,
                    name: username,
                    password
                })
            });

            if (!response.ok) throw new Error(await response.text());

            toast.success('Your account has been created successfully');
            localStorage.setItem('taskly_token', token);
            router.push('/login');

        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message || "Login failed");
            } else {
                toast.error("Login failed");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleLogin = async () => {
        try {
            await dispatch(googleLogin());
            toast.success("Login successful");
            router.push('/');

        } catch (error) {
            console.error("Google login failed:", error);
            // Show error toast
        }
    };
    useEffect(() => {
        if (user) {
            toast.success("Your account has been created successfully");
            const timer = setTimeout(() => {
                router.push('/');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user, router]);

    return (
        <div className="flex justify-center flex-col items-center h-[100vh]">
            <div className="bg-gray-100 p-12 rounded-lg shadow shadow-lg h-[95vh]">
                <p className="font-medium text-2xl text-center text-orange-400 py-2">Welcome to taskly</p>
                <div className="flex items-center flex-col w-full gap-4">
                    <p className="text-gray-600 text-xl text-center font-medium">Enter Your email below to create an account</p>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 px-4 py-2 border-gray-300 rounded-lg bg-white text-black hover:shadow-md transition duration-200 w-full max-w-xs mx-auto disabled:opacity-50"
                    >
                        <FcGoogle className="text-2xl" />
                        <span className="text-base sm:text-lg font-medium">
                            {loading && signUpType === 'google' ? 'Signing up...' : 'Continue with Google'}
                        </span>
                    </button>
                    <p className="font-medium text-xl text-black">or continue with</p>

                    <form onSubmit={handleRegister} className="flex flex-col gap-2 w-full max-w-xs">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="p-2 bg-gray-300 focus:outline-none rounded-md border border-gray-100"
                            placeholder="Your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="p-2 bg-gray-300 focus:outline-none rounded-md border border-gray-100"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="p-2 bg-gray-300 focus:outline-none rounded-md border border-gray-100"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        <button
                            type="submit"
                            className="bg-gray-800 text-white p-2 text-xl w-full rounded-md disabled:opacity-50 mt-4"
                            disabled={loading}
                        >
                            {loading && signUpType === 'normal' ? "Registering..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="flex gap-3 font-medium text-md items-center">
                        <p className="text-black">Already have an Account?</p>
                        <Link
                            href="/login"
                            className="hover:text-white hover:bg-blue-400 bg-white border border-blue-400 text-blue-400 px-3 text-xl p-1 rounded-md"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;