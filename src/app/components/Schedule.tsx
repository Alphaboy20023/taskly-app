
const SchedulePage = () => {

    return (
        <>
            <div className="p-4 w-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-medium p-2">Today&apos;s Schedule</h1>
                        <p className="text-2xl font-medium p-2">\\Days Date</p>
                    </div>
                    <img src="/Img/Logo.jpg" alt="" className="w-10 h-10" />
                </div>

                <div className="gap-4 flex flex-col">
                    <div className="flex text-xl rounded-2xl shadow-lg shadow text-black font-medium justify-between items-center bg-[#F8D57E] px-6 p-4 gap-4 items-center">
                        <div className="flex gap-10">
                            <img src="/Img/Logo.jpg" alt="" />
                            <p>Title</p>
                        </div>
                        <p>time</p>
                    </div>
                    <div className="flex text-xl rounded-2xl shadow-lg shadow black font-medium justify-between items-center bg-[#F6F7FB] px-6 p-4 gap-4 items-center">
                        <div className="flex gap-10">
                            <img src="/Img/Logo.jpg" alt="" className="w-10 h-10"/>
                            <div className="">
                                <p>Title</p>
                                <p className="text-gray-600">description</p>
                            </div>
                        </div>
                        <p>time</p>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SchedulePage;