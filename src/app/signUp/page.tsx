
'use client'
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, googleLogin } from '../redux/authSlice'
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { toast } from "react-toastify";




const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const dispatch = useDispatch()
    const { loading, error, user } = useSelector((state: any) => state.auth)


    const handleRegisterUser = () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }
        dispatch(registerUser({ email, password }) as any)
    }

    
    const handleGoogleSignUp = async () => {
        const resultAction = await dispatch(googleLogin() as any);

        if (googleLogin.fulfilled.match(resultAction)) {
            console.log('User:', resultAction.payload);
        } else {
            //Login failed
            console.error('Login failed:', resultAction.payload || resultAction.error);
        }
    };

    useEffect(() => {
         if (user) {
            toast.success("Your account has been created successfully");
            const timer = setTimeout(() => router.push('/'), 2000);
            return () => clearTimeout(timer);
        }
    }, [user, router])


    return (
        <>
            <div className="flex justify-center flex-col items-center h-[100vh]">
                <div className=" bg-gray-100 p-10 rounded-lg shadow shadow-lg">
                    <p className="font-medium text-2xl text-center text-orange-400 py-3">Welcome to taskly</p>
                    <div className="flex items-center flex-col w-full gap-4">
                        <p className="text-gray-600 text-xl font-medium">Enter Your email below to create an account</p>
                        <button
                            onClick={handleGoogleSignUp}
                            className="flex items-center justify-center gap-3 px-4 py-2  border-gray-300 rounded-lg bg-white text-black hover:shadow-md transition duration-200 w-full max-w-xs mx-auto"
                        >
                            <FcGoogle className="text-2xl" />
                            <span className="text-base sm:text-lg font-medium">Continue with Google</span>
                        </button>
                        <p className="font-medium text-xl">or continue with</p>
                        <div className="flex flex-col gap-3 w-full">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email"
                                className="p-2 border-0 bg-gray-300 rounded-md focus:outline-none"
                                placeholder="you@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password"
                                className="p-2 border-0 bg-gray-300 rounded-md focus:outline-none"
                                placeholder="password"
                                onChange={(e) => setPassword(e.target.value)}

                            />
                        </div>

                        <button className="bg-black text-white text-xl p-2 w-full rounded-md"
                            onClick={handleRegisterUser}
                        >Sign Up</button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SignUp;