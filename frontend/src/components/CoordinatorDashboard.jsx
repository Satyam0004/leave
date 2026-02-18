import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import authService from '../api/authService';

const CoordinatorDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        fetchLeaves();
        fetchPendingStudents();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves/all');
            setLeaves(response.data);
        } catch (error) {
            console.error("Error fetching leaves", error);
        }
    };

    const fetchPendingStudents = async () => {
        try {
            const response = await api.get('/coordinator/pending-students');
            setPendingStudents(response.data);
        } catch (error) {
            console.error("Error fetching pending students", error);
        }
    };

    const approveStudent = async (id) => {
        try {
            await api.post(`/coordinator/approve-student/${id}`);
            setSuccess('Student approved successfully');
            fetchPendingStudents();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to approve student');
            setTimeout(() => setError(''), 3000);
        }
    };

    const updateLeaveStatus = async (id, status, comment) => {
        try {
            await api.put(`/leaves/${id}/status`, {
                status,
                coordinatorId: "0", // Backend uses SecurityContext now, but might still expect a value or map
                comment
            });
            fetchLeaves();
            setSuccess(`Leave ${status.toLowerCase()} successfully`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update leave status');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Coordinator Dashboard</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Pending Student Approvals</h3>
                {pendingStudents.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No pending approvals.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roll Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {pendingStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.rollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => approveStudent(student.id)}
                                                className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Leave Requests</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {leaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{leave.student?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.startDate} to {leave.endDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                leave.status === 'DECLINED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {leave.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => updateLeaveStatus(leave.id, 'APPROVED', 'Approved')} className="text-green-600 hover:text-green-900 dark:hover:text-green-400">Approve</button>
                                                <button onClick={() => updateLeaveStatus(leave.id, 'DECLINED', 'Declined')} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Decline</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CoordinatorDashboard;
