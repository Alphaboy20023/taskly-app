const TaskCard = () => {
  return (
    <>
      <div className="flex justify-between items-start gap-4 p-4 rounded-lg shadow-md bg-white border border-gray-200">

        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img
            src="https://source.unsplash.com/80x80/?task,productivity"
            alt="Task"
            className="w-full h-full object-cover"
          />
        </div>


        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">Title</h3>
          <p className="text-sm text-gray-500 mb-1">Scheduled for: 2025-07-19 2:30 PM</p>
          <p className="text-sm text-gray-700 mb-2">
            This is a short description of the task.
          </p>


          <span className="inline-block text-xs px-2 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700 mb-3">
            Scheduled
          </span>


          <div className="flex gap-3 mt-2">
            <button className="text-blue-600 hover:underline text-sm">Edit</button>
            <button className="text-red-600 hover:underline text-sm">Delete</button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl flex justify-between items-center mt-5 shadow-lg shadow ">
        <p className="px-4 text-white text-xl bg-orange-400 rounded-lg ">+</p>
        <p>Add New Task</p>
      </div>
    </>
  );
};

export default TaskCard;

