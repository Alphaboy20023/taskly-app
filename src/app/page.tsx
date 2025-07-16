import TaskCard from "./components/TaskCard"
import Calendar from "./components/Calendar"
import SchedulePage from "./components/Schedule"

const Home = () => {
  return (
    <>
      <div className="flex lg:flex-nowrap flex-wrap">
        <div className="flex flex-col p-6 bg-[#F6F7FB] w-1/3">
          <div className="flex space-x-3">
            <img src="/Img/Logo.jpg" alt="" className="bg-transparent" />
            <p className=" font-semibold text-xl">taskly</p>
          </div>
          <div className="flex justify-between">
            <h2 className="py-12 text-xl">Weekly Pinned</h2>
            <button className="text-orange-400 font-semibold">View all</button>
          </div>
          <TaskCard />
          <Calendar />
        </div>
        <div className="w-full">
          <SchedulePage />
        </div>
        <div>
          lastpage
        </div>
      </div>
    </>
  )
}

export default Home