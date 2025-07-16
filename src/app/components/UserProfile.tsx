import { FaUserCircle } from "react-icons/fa";



const UserProfile = () => {

    return (
        <>
            <div className="flex items-center justify-between p-5">
                <div>
                    <p className="font-medium text-xl">username</p>
                    <p className="font-medium text-orange-400 text-xl">My settings</p>
                </div>
                <FaUserCircle  className="text-3xl text-gray-300"/>
            </div>
        </>
    )
}

export default UserProfile;