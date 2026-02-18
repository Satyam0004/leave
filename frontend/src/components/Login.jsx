import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            const user = response.data;
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'STUDENT') {
                navigate('/student');
            } else if (user.role === 'COORDINATOR') {
                navigate('/coordinator');
            } else if (user.role === 'ADMIN') {
                navigate('/admin');
            }
        } catch (err) {
            setError(err.response?.data || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Login
                    </button>
                    <div className="text-sm text-center text-gray-500 mt-4">
                        <p>Default Users:</p>
                        <ul className="list-disc align-middle inline-block text-left">
                            <li>student1@test.com / student123 (Eligible)</li>
                            <li>student2@test.com / student123 (Not Eligible)</li>
                            <li>coordinator@test.com / coord123</li>
                            <li>admin@test.com / admin123</li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
