import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

const Register = () => {
    const [role, setRole] = useState('STUDENT'); // STUDENT or COORDINATOR
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        studentClass: '',
        assignedClass: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            let response;
            if (role === 'STUDENT') {
                response = await authService.registerStudent({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    rollNumber: formData.rollNumber,
                    studentClass: formData.studentClass
                });
            } else {
                response = await authService.registerCoordinator({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    assignedClass: formData.assignedClass
                });
            }
            setMessage(response.data.message);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your details.');
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <div className="glass-auth-card !max-w-lg">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Join the Portal</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Select your role and create an account</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-8">
                    <button
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'STUDENT' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                        onClick={() => setRole('STUDENT')}
                    >
                        🎓 Student
                    </button>
                    <button
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'COORDINATOR' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                        onClick={() => setRole('COORDINATOR')}
                    >
                        👔 Coordinator
                    </button>
                </div>

                {message && (
                    <div className="p-4 mb-6 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-xl border border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-4">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="auth-input" />
                            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="auth-input" />
                            <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="auth-input" />
                        </div>

                        <div className="space-y-4">
                            {role === 'STUDENT' && (
                                <>
                                    <input type="text" name="rollNumber" placeholder="Roll Number" onChange={handleChange} required className="auth-input" />
                                    <input type="text" name="studentClass" placeholder="Class (e.g., CSE-B)" onChange={handleChange} required className="auth-input" />
                                </>
                            )}
                            {role === 'COORDINATOR' && (
                                <input type="text" name="assignedClass" placeholder="Assigned Class" onChange={handleChange} required className="auth-input" />
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn-auth mt-4 uppercase tracking-widest font-black">
                        Complete Registration
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link to="/" className="font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
