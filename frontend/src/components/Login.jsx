import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login({ email, password });
            const { token, ...user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'STUDENT') {
                navigate('/student');
            } else if (user.role === 'COORDINATOR') {
                navigate('/coordinator');
            } else if (user.role === 'ADMIN') {
                navigate('/admin');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <div className="glass-auth-card">
                <div className="text-center mb-10">
                    <div className="inline-block p-4 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 mb-4 animate-bounce">
                        <span className="text-3xl">🔓</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to manage your leave portal</p>
                </div>

                {error && (
                    <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@university.com"
                            className="auth-input"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Password</label>
                            <a href="#" className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="auth-input"
                        />
                    </div>

                    <button type="submit" className="btn-auth group relative overflow-hidden">
                        <span className="relative z-10 uppercase tracking-widest">Secure Login</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        New to the portal?{" "}
                        <Link to="/register" className="font-black text-indigo-600 dark:text-indigo-400 hover:underline decoration-2 underline-offset-4">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
