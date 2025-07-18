'use client'
import Link from "next/link";
import { toast } from "react-toastify";
import { loginUser } from "app/redux/authSlice";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const router = useRouter();

    const { user, error } = useSelector((state: any) => state.auth);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        const resultAction = await dispatch(loginUser({ email, password }) as any);

        if (loginUser.fulfilled.match(resultAction)) {
            toast.success("Login successful!");
            router.push('/'); // redirect to home or dashboard
        } else {
            toast.error(resultAction.payload?.message || "Login failed");
        }
    };

    return (
        <div className="flex justify-center flex-col items-center h-[100vh]">
            <div className="bg-gray-100 p-10 rounded-lg lg:w-1/3 w-auto">
                <p className="font-medium text-2xl text-orange-600 text-center">Welcome back to taskly</p>
                <p className="font-medium text-2xl text-center">Login</p>
                <div className="flex items-center flex-col w-full gap-7">
                    <div className="flex flex-col gap-3 w-full">
                        
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            id="email"
                            className="p-2 border-0 bg-gray-300 rounded-md"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="p-2 border-0 bg-gray-300 rounded-md"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="bg-black text-white p-2 text-xl w-full rounded-md"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                    <div className="flex gap-3 flex-wrap font-medium text-xl items-center">
                        <p>Don&apos;t have an Account?</p>
                        <Link href="/register" className="hover:text-white hover:bg-blue-400 bg-white border border-blue-400 text-blue-400 px-3 p-1 rounded-md">Register</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
