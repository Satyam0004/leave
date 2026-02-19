import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useTheme } from '../context/ThemeContext';
import authService from '../api/authService';

const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const clearNotifications = async () => {
        try {
            await api.delete('/notifications/clear-all');
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to clear notifications", error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                            <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Leave Portal</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="hidden md:inline-block text-sm font-medium text-gray-600 dark:text-gray-300">
                                {user?.name} <span className="text-gray-400">|</span> <span className="text-indigo-600 dark:text-indigo-400 uppercase text-xs">{user?.role}</span>
                            </span>

                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
                                >
                                    <span className="text-xl">🔔</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Notifications</h3>
                                                {notifications.length > 0 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); clearNotifications(); }}
                                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                                        <span className="text-4xl mb-2">📭</span>
                                                        <p className="text-sm">All caught up!</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notification => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-4 border-b border-gray-50 dark:border-gray-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                                        >
                                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 flex items-center">
                                                                <span className="mr-1">🕒</span> {new Date(notification.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xl"
                                title="Toggle Theme"
                            >
                                {theme === 'light' ? '🌙' : '☀️'}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg focus:outline-none"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
