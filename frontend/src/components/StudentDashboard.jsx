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

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError("End Date cannot be before Start Date");
            return;
        }

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
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Student Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400">Welcome back! Apply for leave and track your status.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Apply Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 sticky top-24">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📝</span> Apply for Leave
                        </h3>
                        {message && <div className="p-3 mb-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">{message}</div>}
                        {error && <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Reason</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                    rows="4"
                                    placeholder="Explain why you need leave..."
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-primary w-full py-3 font-bold">
                                Submit Application
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 min-h-[400px]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📜</span> My Leave History
                        </h3>

                        <div className="table-container">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Dates</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Feedback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {leaves.length === 0 ? (
                                        <tr><td colSpan="4" className="py-12 text-center text-gray-400">No leave applications found</td></tr>
                                    ) : (
                                        leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold">{leave.startDate}</div>
                                                    <div className="text-[10px] text-gray-300">to</div>
                                                    <div className="text-sm font-semibold">{leave.endDate}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{leave.reason}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                            leave.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm italic text-gray-500">
                                                    {leave.coordinatorComment || 'No feedback yet'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
