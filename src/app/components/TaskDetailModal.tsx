'use client';
import { Task } from "./Schedule"; 

type Props = {
    task: Task;
    onClose: () => void;
};

const TaskDetailModal = ({ task, onClose }: Props) => {
    return (
        <div className="fixed inset-0  bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
                <h2 className="text-xl font-bold mb-2">{task.title}</h2>
                <p className="text-gray-600 mb-4">{task.description || 'No descriptions'}</p>
                <p className="text-sm text-gray-800">
                    Scheduled for: {new Date(task.scheduledAt).toLocaleString()}
                </p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default TaskDetailModal;
