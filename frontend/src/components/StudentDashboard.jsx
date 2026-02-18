import { useState, useEffect } from 'react';
import api from '../api/axios';

const StudentDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [message, setMessage] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get(`/leaves/student/${user.id}`);
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
        try {
            const payload = {
                student: { id: user.id },
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason
            };
            const response = await api.post('/leaves/apply', payload);
            setMessage(response.data);
            fetchLeaves();
            setFormData({ startDate: '', endDate: '', reason: '' });
        } catch (error) {
            setMessage(error.response?.data || "Application failed");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
            <div className="mb-4">
                <p className="text-lg">Welcome, <span className="font-semibold">{user.name}</span></p>
                <p>Attendance: <span className={user.attendancePercentage >= 75 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{user.attendancePercentage}%</span></p>
            </div>

            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Apply for Leave</h2>
                {message && <div className={`p-4 mb-4 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Reason</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Apply</button>
                </form>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">My Leave History</h2>
                {leaves.length === 0 ? (
                    <p>No leave requests found.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.startDate} to {leave.endDate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{leave.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                leave.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{leave.coordinatorComment || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/' }} className="mt-6 text-red-600 hover:text-red-800">Logout</button>
        </div>
    );
};

export default StudentDashboard;
