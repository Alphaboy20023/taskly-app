'use client'
import UserProfile from "../components/UserProfile"
import TaskCard from "../components/TaskCard"
import Calendar from "../components/Calendar"
import SchedulePage from "../components/Schedule"
import MusicCard from "../components/Music"
import { FaLongArrowAltRight } from "react-icons/fa";
import Weather from "../components/Weather"
import { useState } from "react"
import Image from "next/image"


const Home = () => {

  const [newScheduledAt, setNewScheduledAt] = useState<Date | null>(new Date());

  return (
    <>
      <div className="flex lg:flex-nowrap flex-wrap">
        <div className="lg:hidden  w-full shadow shadow-lg bg-gray-300">
          <UserProfile />
        </div>
        <div className="flex flex-col p-6 bg-[#F6F7FB] lg:w-1/2 w-full">
          <div className="flex space-x-3">
            <Image src="/Img/Logo.jpg" alt="" className="bg-transparent"
              width={40}
              height={40}
            />
            <p className=" font-semibold text-xl">taskly</p>
          </div>
          <div className="flex justify-between">
            <h2 className="py-8 text-xl">Weekly Pinned</h2>
            <button className="text-orange-400 font-semibold">View all</button>
          </div>
          <TaskCard />
          <Calendar value={newScheduledAt} onChange={setNewScheduledAt} />
        </div>
        <div className="w-full">
          <SchedulePage />
        </div>
        <div className="lg:w-1/2 w-full space-y-10 p-3">
          <div className=" hidden lg:block">
            <UserProfile />
          </div>
          <Weather />
          <MusicCard />
          <div className="rounded-lg p-6 shadow shadow-lg bg-gray-100 space-y-3">
            <p className="text-3xl">
              unleash the freelance super power
            </p>
            <div className="text-gray-700 font-medium text-md">
              <p>Unlimited task, premium features and much more.</p>
              <div className="flex justify-between items-center">
                <Image src="/img/bust.jpg" alt="" className="object-cover mix-blend-multiply"
                  width={100}
                  height={100}
                />
                <p className="text-2xl font-semibold bg-[#F8D57E] p-3 rounded-md">
                  <FaLongArrowAltRight className="text-black" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home