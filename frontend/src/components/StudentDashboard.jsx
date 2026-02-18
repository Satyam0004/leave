import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import authService from '../api/authService';

const StudentDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // We don't need currentUser from authService for the request body anymore, 
    // as backend handles it, but good to have for UI.
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get(`/leaves/my-leaves`);
            setLeaves(response.data);
        } catch (error) {
            console.error("Error fetching leaves", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            // Backend expects leaveRequest object. 
            // setStudent logic is now in backend.
            const response = await api.post('/leaves/apply', {
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason
            });
            setMessage(response.data);
            fetchLeaves();
            setFormData({ startDate: '', endDate: '', reason: '' });
        } catch (err) {
            setError(err.response?.data || 'Failed to apply for leave');
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Student Dashboard</h2>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Apply for Leave</h3>
                {message && <p className="text-green-500 mb-4">{message}</p>}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                        <textarea name="reason" value={formData.reason} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" rows="3"></textarea>
                    </div>
                    <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Submit Application</button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">My Leave History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coordinator Comment</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {leaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.startDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.endDate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{leave.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                leave.status === 'DECLINED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{leave.coordinatorComment || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
