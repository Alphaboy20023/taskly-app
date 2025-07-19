'use client'

import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "app/lib/firebase";

interface UserInfo {
    uid: string;
    email: string | null;
    name: string | null;
    photo: string | null;
    provider: string;
}

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            let token: string = '';
            let user: UserInfo;

            // 1. Try Firebase login
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                token = await userCredential.user.getIdToken();
                user = {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    name: userCredential.user.displayName,
                    photo: userCredential.user.photoURL,
                    provider: 'firebase'
                };

                // Send token to Firebase backend route for optional user sync/validation
                const res = await fetch('/api/auth/firebase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(user)
                });

                if (!res.ok) throw new Error("Firebase user not accepted");

            } catch (firebaseErr) {
                // 2. If Firebase login fails, try local login instead
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) throw new Error(await res.text());

                const data = await res.json();
                token = data.token;
                user = {
                    ...data.user,
                    provider: 'local',
                };
            }

            // Store token and user
            localStorage.setItem('taskly_token', token);
            localStorage.setItem('taskly_user', JSON.stringify(user));
            toast.success("Login successful!");
            router.push('/');

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


    return (
        <div className="flex justify-center flex-col items-center h-[100vh]">
            <div className="bg-gray-100 p-10 rounded-lg lg:w-1/3 w-auto">
                <p className="font-medium text-2xl text-orange-600 text-center">Welcome back to taskly</p>
                <p className="font-medium text-2xl text-center text-black">Login</p>
                <div className="flex items-center flex-col w-full gap-7">
                    <div className="flex flex-col gap-3 w-full ">
                        <label htmlFor="email" className="text-black font-medium">Email</label>
                        <input
                            type="text"
                            id="email"
                            className="p-2 focus:outline-none rounded-md border border-gray-300 bg-gray-300"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="p-2 bg-gray-300 focus:outline-none rounded-md border border-gray-400"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="bg-black text-white p-2 text-xl w-full rounded-md disabled:opacity-50"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
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
