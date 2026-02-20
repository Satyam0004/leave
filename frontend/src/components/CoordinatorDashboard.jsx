import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import authService from '../api/authService';

const CoordinatorDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [leaveSummary, setLeaveSummary] = useState([]);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('leaves');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLeaveId, setActionLeaveId] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [comment, setComment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Feature 2: Date filter for pending leaves — default empty = show ALL pending
    const [filterDate, setFilterDate] = useState('');
    const [showAllDates, setShowAllDates] = useState(false);

    const currentUser = authService.getCurrentUser();

    const fetchLeaves = useCallback(async () => {
        try {
            if (showAllDates) {
                // Show all leaves (any status) for the assigned class
                const response = await api.get('/leaves/all');
                setLeaves(response.data);
            } else {
                // No date = all PENDING leaves; date = filtered by submission date
                const params = filterDate ? { date: filterDate } : {};
                const response = await api.get('/leaves/pending', { params });
                setLeaves(response.data);
            }
        } catch (error) {
            console.error("Error fetching leaves", error);
        }
    }, [filterDate, showAllDates]);

    useEffect(() => {
        fetchLeaves();
        fetchPendingStudents();
        fetchAllStudents();
        fetchLeaveSummary();
    }, [fetchLeaves]);

    const fetchPendingStudents = async () => {
        try {
            const response = await api.get('/coordinator/pending-students');
            setPendingStudents(response.data);
        } catch (error) {
            console.error("Error fetching pending students", error);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const response = await api.get('/coordinator/students');
            setAllStudents(response.data);
        } catch (error) {
            console.error("Error fetching all students", error);
        }
    };

    // Feature 3: Per-student leave summary
    const fetchLeaveSummary = async () => {
        try {
            const response = await api.get('/coordinator/leave-summary');
            setLeaveSummary(response.data);
        } catch (error) {
            console.error("Error fetching leave summary", error);
        }
    };

    const approveStudent = async (id) => {
        try {
            await api.post(`/coordinator/approve-student/${id}`);
            setSuccess('Student approved successfully');
            fetchPendingStudents();
            fetchAllStudents();
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
                coordinatorId: currentUser.id,
                comment
            });
            fetchLeaves();
            setSuccess(`Leave ${status === 'APPROVED' ? 'approved' : 'declined'} successfully`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update leave status');
            setTimeout(() => setError(''), 3000);
        }
    };

    const filteredStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleActionSearch = (id, type) => {
        setActionLeaveId(id);
        setActionType(type);
        setComment('');
    };

    const confirmAction = () => {
        if (actionLeaveId && actionType) {
            updateLeaveStatus(actionLeaveId, actionType, comment);
            setActionLeaveId(null);
            setActionType(null);
            setComment('');
        }
    };

    const cancelAction = () => {
        setActionLeaveId(null);
        setActionType(null);
        setComment('');
    };

    const getStatusStyle = (status) => {
        if (status === 'APPROVED') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'DECLINED') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (status === 'PENDING_ADMIN') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    };

    // Merge summary data into students list
    const studentsWithSummary = allStudents.map(s => {
        const summary = leaveSummary.find(ls => ls.studentId === s.id);
        return { ...s, leaveApproved: summary?.approved ?? 0, leavePending: summary?.pending ?? 0, leaveDeclined: summary?.declined ?? 0 };
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Coordinator Panel</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage leaves and students for {currentUser?.assignedClass || 'your class'}</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                    {[
                        { id: 'leaves', label: 'Leaves', icon: '📝' },
                        { id: 'approvals', label: 'Pending', icon: '⏳', count: pendingStudents.length },
                        { id: 'students', label: 'Students', icon: '🎓' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.count > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{tab.count}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-in slide-in-from-left-4">{error}</div>}
            {success && <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg animate-in slide-in-from-left-4">{success}</div>}

            {activeTab === 'leaves' && (
                <div className="glass-card p-6">
                    {/* Feature 2: Date filter bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-xl font-bold">
                            {showAllDates
                                ? 'All Leave Requests'
                                : filterDate
                                    ? `Pending Leaves — Submitted on ${filterDate}`
                                    : 'All Pending Leaves'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                            {!showAllDates && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold uppercase text-gray-400 ml-1">Filter by Submission Date</span>
                                    <input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="p-2 text-sm border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            )}
                            {filterDate && !showAllDates && (
                                <button
                                    onClick={() => setFilterDate('')}
                                    className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-2"
                                    title="Clear date filter"
                                >✕ Clear</button>
                            )}
                            <button
                                onClick={() => setShowAllDates(!showAllDates)}
                                className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${showAllDates ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'btn-secondary'}`}
                            >
                                {showAllDates ? '⏳ Show Pending Only' : '📋 Show All Statuses'}
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Dates</th>
                                    <th>Reason</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {leaves.length === 0 ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-400">
                                        {showAllDates ? 'No leave requests found' : filterDate ? `No pending leaves submitted on ${filterDate}` : 'No pending leaves found'}
                                    </td></tr>
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/20 ${leave.emergency ? 'border-l-4 border-red-400' : ''}`}>
                                            <td className="px-6 py-4 font-semibold">
                                                {leave.student?.name}
                                                {leave.emergency && <span className="ml-2 text-red-500 text-xs font-bold">🚨</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex flex-col">
                                                    <span>{leave.startDate}</span>
                                                    <span className="text-[10px] uppercase font-bold text-gray-300">to</span>
                                                    <span>{leave.endDate}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm max-w-xs truncate">{leave.reason}</td>
                                            <td className="px-6 py-4">
                                                {leave.emergency
                                                    ? <span className="badge bg-red-100 text-red-700">🚨 Emergency</span>
                                                    : <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">Normal</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getStatusStyle(leave.status)}`}>
                                                    {leave.status === 'PENDING_ADMIN' ? '⏳ Awaiting Admin' : leave.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 space-x-2">
                                                {leave.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleActionSearch(leave.id, 'APPROVED')} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Approve">✅</button>
                                                        <button onClick={() => handleActionSearch(leave.id, 'DECLINED')} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Decline">❌</button>
                                                    </div>
                                                )}
                                                {leave.status === 'PENDING_ADMIN' && (
                                                    <span className="text-xs text-purple-500 font-semibold">Awaiting Admin</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Pending Student Approvals</h3>
                    {pendingStudents.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">No pending student registrations.</div>
                    ) : (
                        <div className="table-container">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Roll Number</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {pendingStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <td className="px-6 py-4 font-semibold">{student.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{student.rollNumber}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => approveStudent(student.id)}
                                                    className="btn-primary py-1.5"
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
            )}

            {activeTab === 'students' && (
                <div className="glass-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold">Registered Students</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or roll..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Roll Number</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    {/* Feature 3: Leave summary columns */}
                                    <th>✅ Approved</th>
                                    <th>⏳ Pending</th>
                                    <th>❌ Declined</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredStudents.length === 0 ? (
                                    <tr><td colSpan="7" className="py-12 text-center text-gray-400">No students found</td></tr>
                                ) : (
                                    studentsWithSummary.filter(s =>
                                        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{student.rollNumber}</td>
                                            <td className="px-6 py-4 font-semibold">{student.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${student.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {student.approved ? 'REGISTERED' : 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-green-600">{student.leaveApproved}</td>
                                            <td className="px-6 py-4 text-center font-bold text-yellow-600">{student.leavePending}</td>
                                            <td className="px-6 py-4 text-center font-bold text-red-500">{student.leaveDeclined}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionLeaveId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in transition-opacity">
                    <div className="glass-card w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2">
                            {actionType === 'APPROVED' ? 'Approve' : 'Decline'} Request
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            You are about to {actionType.toLowerCase()} this leave request.
                            {actionType === 'APPROVED' && leaves.find(l => l.id === actionLeaveId)?.emergency && (
                                <span className="block mt-1 text-purple-600 font-semibold">🚨 This is an emergency leave — it will go to Admin for final approval.</span>
                            )}
                        </p>

                        <textarea
                            className="w-full p-4 border rounded-xl mb-6 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                            placeholder="Reason for approval/rejection..."
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button onClick={cancelAction} className="btn-secondary flex-1">Cancel</button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 font-bold ${actionType === 'APPROVED' ? 'btn-primary' : 'btn-danger'}`}
                            >
                                Confirm {actionType === 'APPROVED' ? 'Approval' : 'Decline'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatorDashboard;
