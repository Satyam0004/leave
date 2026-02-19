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

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <nav className="bg-white dark:bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Leave Portal</h1>
                <div className="flex items-center space-x-4">
                    <span>{user?.name} ({user?.role})</span>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none relative"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">{unreadCount}</span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg overflow-hidden z-20">
                                <div className="py-2">
                                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">Notifications</h3>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                                        ) : (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-gray-900' : ''}`}
                                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                                >
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                        title="Toggle Theme"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            <main className="p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
