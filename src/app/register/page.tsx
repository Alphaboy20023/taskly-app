
'use client';

import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, googleLogin } from '../redux/authSlice'
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { toast } from "react-toastify";
import Link from "next/link";
import type { RootState } from '../redux/store';
import { AppDispatch } from '../redux/store';


const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [signUpType, setSignUpType] = useState<'google' | 'normal' | null>(null);
    const [loading, setLoading] = useState(false);




    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth)


    const handleRegisterUser = async () => {
        if (!username || !email || !password) {
            toast.error("Please enter all details");
            return;
        }

        setSignUpType('normal');

        setLoading(true);
        const resultAction = await dispatch(registerUser({ username, email, password }));
        setLoading(false);
        if (registerUser.rejected.match(resultAction)) {
            toast.error(resultAction.payload as string); // backend message
        }
    };



    const handleGoogleSignUp = async () => {
        setSignUpType('google');

        const resultAction = await dispatch(googleLogin());

        if (googleLogin.fulfilled.match(resultAction)) {
            console.log('User:', resultAction.payload);
        } else {
            //Login failed
            console.error('Login failed:', resultAction.payload || resultAction.error);
        }
    };

    useEffect(() => {
        if (user && signUpType) {
            toast.success("Your account has been created successfully");
            const timer = setTimeout(() => {
                if (signUpType === 'google') {
                    router.push('/');
                } else {
                    router.push('/login');
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user, signUpType, router]);


    return (
        <>
            <div className="flex justify-center flex-col items-center h-[100vh]">
                <div className=" bg-gray-100 p-12 rounded-lg shadow shadow-lg h-[95vh]">
                    <p className="font-medium text-2xl text-center text-orange-400 py-2">Welcome to taskly</p>
                    <div className="flex items-center flex-col w-full gap-4">
                        <p className="text-gray-600 text-xl text-center font-medium">Enter Your email below to create an account</p>
                        <button
                            onClick={handleGoogleSignUp}
                            className="flex items-center justify-center gap-3 px-4 py-2  border-gray-300 rounded-lg bg-white text-black hover:shadow-md transition duration-200 w-full max-w-xs mx-auto"
                        >
                            <FcGoogle className="text-2xl" />
                            <span className="text-base sm:text-lg font-medium">Continue with Google</span>
                        </button>
                        <p className="font-medium text-xl text-black">or continue with</p>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="email">Username</label>
                            <input
                                type="text"
                                id="username"
                                className="p-2 bg-gray-300 focus:outline-none rounded-md border border-gray-100 rounded-md"
                                placeholder="you@example.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email"
                                className="p-2 bg-gray-300 focus:outline-none rounded-md border border-gray-100 rounded-md"
                                placeholder="you@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password"
                                className="p-2 bg-gray-300 focus:outline-none rounded-md border border-gray-100 rounded-md"
                                placeholder="password"
                                onChange={(e) => setPassword(e.target.value)}

                            />
                        </div>

                        <button
                            className="bg-gray-800 text-white p-2 text-xl w-full rounded-md"
                            onClick={handleRegisterUser}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Sign Up"}
                        </button>

                        <div className="flex gap-3 font-medium text-md items-center">
                            <p className="text-black">Already have an Account?</p>
                            <Link href="/login" className="hover:text-white hover:bg-blue-400 bg-white border border-blue-400 text-blue-400 px-3 text-xl p-1 rounded-md">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SignUp;