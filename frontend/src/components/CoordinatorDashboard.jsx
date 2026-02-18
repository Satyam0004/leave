import { useState, useEffect } from 'react';
import api from '../api/axios';

const CoordinatorDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves/all');
            setLeaves(response.data);
        } catch (error) {
            console.error("Error fetching leaves", error);
        }
    };

    const handleStatusUpdate = async (leaveId, status) => {
        const comment = prompt("Enter a comment (optional):");
        try {
            await api.put(`/leaves/${leaveId}/status`, {
                status,
                coordinatorId: user.id,
                comment: comment || ''
            });
            fetchLeaves();
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status");
        }
    };

    const filteredLeaves = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Coordinator Dashboard</h1>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-gray-600">Welcome, {user.name}</p>
                    <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/' }} className="text-red-600 hover:text-red-800 text-sm">Logout</button>
                </div>
                <div>
                    <label className="mr-2 font-medium">Filter Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded p-1">
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DECLINED">Declined</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeaves.map((leave) => (
                            <tr key={leave.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={leave.student.attendancePercentage < 75 ? "text-red-600 font-bold" : "text-green-600"}>
                                        {leave.student.attendancePercentage}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.startDate} to {leave.endDate}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{leave.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            leave.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {leave.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {leave.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(leave.id, 'APPROVED')} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                            <button onClick={() => handleStatusUpdate(leave.id, 'DECLINED')} className="text-red-600 hover:text-red-900">Decline</button>
                                        </>
                                    )}
                                    {leave.status !== 'PENDING' && (
                                        <span className="text-gray-400">Processed by {leave.coordinator?.name}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoordinatorDashboard;
