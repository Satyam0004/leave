import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import authService from '../api/authService';

const StudentDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState(null);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
        emergency: false
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        fetchLeaves();
        fetchStats();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get(`/leaves/my-leaves`);
            setLeaves(response.data);
        } catch (error) {
            console.error("Error fetching leaves", error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/leaves/my-stats');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
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
            const response = await api.post('/leaves/apply', {
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason,
                emergency: formData.emergency
            });
            setMessage(response.data);
            fetchLeaves();
            fetchStats();
            setFormData({ startDate: '', endDate: '', reason: '', emergency: false });
        } catch (err) {
            setError(err.response?.data || 'Failed to apply for leave');
        }
    };

    const lowAttendance = stats && stats.attendancePercentage !== null && stats.attendancePercentage < 75;

    const getStatusStyle = (status) => {
        if (status === 'APPROVED') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'DECLINED') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (status === 'PENDING_ADMIN') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Student Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400">Welcome back! Apply for leave and track your status.</p>
            </div>

            {/* Feature 1: Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 text-center">
                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.leavesRemainingThisMonth}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Leaves Left</div>
                        <div className="text-[10px] text-gray-400">This Month</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className="text-3xl font-black text-orange-500">{stats.leavesUsedThisMonth}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Used</div>
                        <div className="text-[10px] text-gray-400">This Month</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className="text-3xl font-black text-green-600 dark:text-green-400">{stats.totalApproved}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Approved</div>
                        <div className="text-[10px] text-gray-400">All Time</div>
                    </div>
                    <div className={`glass-card p-4 text-center ${lowAttendance ? 'border-2 border-red-400' : ''}`}>
                        <div className={`text-3xl font-black ${lowAttendance ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {stats.attendancePercentage != null ? `${stats.attendancePercentage}%` : 'N/A'}
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Attendance</div>
                        {lowAttendance && <div className="text-[10px] text-red-400 font-bold">⚠ Below 75%</div>}
                    </div>
                </div>
            )}

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

                            {/* Feature 4: Emergency Leave checkbox — shown only when attendance < 75% */}
                            {lowAttendance && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="emergency"
                                            checked={formData.emergency}
                                            onChange={handleChange}
                                            className="mt-0.5 accent-red-500 w-4 h-4"
                                        />
                                        <div>
                                            <span className="text-sm font-bold text-red-700 dark:text-red-400">🚨 Emergency Leave</span>
                                            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                                                Your attendance is below 75%. Emergency leave requires approval from both your Coordinator and Admin.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            <button type="submit" className={`w-full py-3 font-bold rounded-xl transition-all ${formData.emergency ? 'bg-red-600 hover:bg-red-700 text-white' : 'btn-primary'}`}>
                                {formData.emergency ? '🚨 Submit Emergency Application' : 'Submit Application'}
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
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Feedback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {leaves.length === 0 ? (
                                        <tr><td colSpan="5" className="py-12 text-center text-gray-400">No leave applications found</td></tr>
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
                                                    {leave.emergency ? (
                                                        <span className="badge bg-red-100 text-red-700">🚨 Emergency</span>
                                                    ) : (
                                                        <span className="badge bg-gray-100 text-gray-600">Normal</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${getStatusStyle(leave.status)}`}>
                                                        {leave.status === 'PENDING_ADMIN' ? '⏳ Awaiting Admin' : leave.status}
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
