import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AdminDashboard = () => {
    const [leaves, setLeaves] = useState([]); // Assuming admin also views leaves? Or just approvals?
    // Let's focus on approvals as primary admin task for now, plus all leaves maybe.
    const [pendingCoordinators, setPendingCoordinators] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPendingCoordinators();
        fetchAllLeaves();
    }, []);

    const fetchPendingCoordinators = async () => {
        try {
            const response = await api.get('/admin/pending-coordinators');
            setPendingCoordinators(response.data);
        } catch (err) {
            console.error('Failed to fetch coordinators', err);
        }
    };

    const fetchAllLeaves = async () => {
        try {
            const response = await api.get('/leaves/all');
            setLeaves(response.data);
        } catch (err) {
            console.error("Failed to fetch leaves", err);
        }
    };

    const approveCoordinator = async (id) => {
        try {
            await api.post(`/admin/approve-coordinator/${id}`);
            setSuccess('Coordinator approved successfully');
            fetchPendingCoordinators();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to approve coordinator');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Admin Dashboard</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Pending Coordinator Approvals</h3>
                {pendingCoordinators.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No pending approvals.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {pendingCoordinators.map((coordinator) => (
                                    <tr key={coordinator.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{coordinator.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{coordinator.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{coordinator.assignedClass}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => approveCoordinator(coordinator.id)}
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
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">All Leave Requests</h3>
                {/* Reuse table logic or component for leaves if needed, simplifying for now */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
