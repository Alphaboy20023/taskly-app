import Link from "next/link";

const Login = () => {
    return (
        <>
            <div className="flex justify-center flex-col items-center h-[100vh]">
               <div className=" bg-gray-100 p-10 rounded-lg lg:w-1/3 w-auto">
                <p className="font-medium text-2xl text-orange-600 text-center">Welcome back to taskly</p>
                <p className="font-medium text-2xl text-center">Login</p>
                <div className="flex items-center flex-col w-full gap-7">
                    <div className="flex flex-col gap-3 w-full">
                        <label htmlFor="email">Email</label>
                        <input type="text" id="email"
                            className="p-2 border-0 bg-gray-300 rounded-md"
                            placeholder="you@example.com"
                        />
                        <label htmlFor="password">Password</label>
                        <input type="text" id="password"
                            className="p-2 border-0 bg-gray-300 rounded-md"
                            placeholder="password"
                        />
                    </div>

                    <button className="bg-black text-white p-1 text-xl w-full rounded-md">Login</button>
                </div>
               </div>
            </div>
        </>
    )
}
export default Login;