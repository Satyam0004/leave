import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AdminDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [pendingCoordinators, setPendingCoordinators] = useState([]);
    const [allCoordinators, setAllCoordinators] = useState([]);
    const [selectedCoordinator, setSelectedCoordinator] = useState(null);
    const [coordinatorStudents, setCoordinatorStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('leaves');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    useEffect(() => {
        fetchPendingCoordinators();
        fetchAllLeaves();
        fetchAllCoordinators();
    }, [filterSection, filterDate]);

    const fetchPendingCoordinators = async () => {
        try {
            const response = await api.get('/admin/pending-coordinators');
            setPendingCoordinators(response.data);
        } catch (err) {
            console.error('Failed to fetch pending coordinators', err);
        }
    };

    const fetchAllCoordinators = async () => {
        try {
            const response = await api.get('/admin/coordinators');
            setAllCoordinators(response.data);
        } catch (err) {
            console.error('Failed to fetch all coordinators', err);
        }
    };

    const fetchAllLeaves = async () => {
        try {
            const params = {};
            if (filterSection) params.section = filterSection;
            if (filterDate) params.date = filterDate;

            const response = await api.get('/leaves/all', { params });
            setLeaves(response.data);
        } catch (err) {
            console.error("Failed to fetch leaves", err);
        }
    };

    const fetchCoordinatorStudents = async (coordinatorId) => {
        setIsLoadingStudents(true);
        try {
            const response = await api.get(`/admin/coordinator/${coordinatorId}/students`);
            setCoordinatorStudents(response.data);
            const coord = allCoordinators.find(c => c.id === coordinatorId);
            setSelectedCoordinator(coord);
            setActiveTab('drilldown');
        } catch (err) {
            setError('Failed to fetch students for this coordinator');
        } finally {
            setIsLoadingStudents(false);
        }
    };

    const approveCoordinator = async (id) => {
        try {
            await api.post(`/admin/approve-coordinator/${id}`);
            setSuccess('Coordinator approved successfully');
            fetchPendingCoordinators();
            fetchAllCoordinators();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to approve coordinator');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Admin Control Panel</h2>
                    <p className="text-gray-500 dark:text-gray-400">System-wide leave management and staff oversight</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                    {[
                        { id: 'leaves', label: 'All Leaves', icon: '📋' },
                        { id: 'coordinators', label: 'Coordinators', icon: '👔' },
                        { id: 'approvals', label: 'Pending', icon: '🚨', count: pendingCoordinators.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSelectedCoordinator(null); }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id || (activeTab === 'drilldown' && tab.id === 'coordinators') ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.count > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{tab.count}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">{error}</div>}
            {success && <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg">{success}</div>}

            {activeTab === 'leaves' && (
                <div className="glass-card p-6">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
                        <h3 className="text-xl font-bold">Comprehensive Leave Records</h3>
                        <div className="flex flex-wrap gap-2">
                            <input
                                type="text"
                                placeholder="Section..."
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                                className="p-2 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="p-2 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button onClick={() => { setFilterSection(''); setFilterDate(''); }} className="btn-secondary text-xs">Reset</button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th>Coordinator</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {leaves.length === 0 ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-gray-400">No records matching filters</td></tr>
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold">{leave.student?.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">{leave.student?.rollNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-500">{leave.student?.studentClass}</td>
                                            <td className="px-6 py-4 text-xs">
                                                {leave.startDate} <span className="text-gray-300 mx-1">→</span> {leave.endDate}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        leave.status === 'DECLINED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm italic text-gray-500">
                                                {leave.coordinator ? leave.coordinator.name : 'Unassigned'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'coordinators' && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Active Class Coordinators</h3>
                    <div className="table-container">
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Assigned Class</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {allCoordinators.length === 0 ? (
                                    <tr><td colSpan="4" className="py-12 text-center text-gray-400">No active coordinators</td></tr>
                                ) : (
                                    allCoordinators.map((coordinator) => (
                                        <tr key={coordinator.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">{coordinator.name}</td>
                                            <td className="px-6 py-4 font-semibold">{coordinator.assignedClass}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{coordinator.email}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => fetchCoordinatorStudents(coordinator.id)}
                                                    className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                                                >
                                                    View Students ➔
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'drilldown' && selectedCoordinator && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <button
                        onClick={() => setActiveTab('coordinators')}
                        className="text-sm font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-2"
                    >
                        ← Back to Coordinators
                    </button>
                    <div className="glass-card p-6">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black">Students for {selectedCoordinator.name}</h3>
                            <p className="text-sm text-gray-500 font-mono">CLASS: {selectedCoordinator.assignedClass}</p>
                        </div>

                        <div className="table-container">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Roll Number</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {coordinatorStudents.length === 0 ? (
                                        <tr><td colSpan="4" className="py-12 text-center text-gray-400">No students registered in this class</td></tr>
                                    ) : (
                                        coordinatorStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                                <td className="px-6 py-4 font-mono text-xs font-bold">{student.rollNumber}</td>
                                                <td className="px-6 py-4 font-semibold">{student.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${student.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {student.approved ? 'REGISTERED' : 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Pending Coordinator Approvals</h3>
                    {pendingCoordinators.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">No pending coordinator applications.</div>
                    ) : (
                        <div className="table-container">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Assigned Class</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {pendingCoordinators.map((coordinator) => (
                                        <tr key={coordinator.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <td className="px-6 py-4 font-semibold">{coordinator.name}</td>
                                            <td className="px-6 py-4 font-medium text-gray-600">{coordinator.assignedClass}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{coordinator.email}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => approveCoordinator(coordinator.id)}
                                                    className="btn-primary py-1.5"
                                                >
                                                    Enable Account
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
