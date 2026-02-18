import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import authService from '../api/authService';

const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

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
