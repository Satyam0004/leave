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
            // Optionally redirect after a delay
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Register</h2>
                {message && <p className="text-green-500 text-center">{message}</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}

                <div className="flex justify-center space-x-4 mb-4">
                    <button
                        className={`px-4 py-2 rounded ${role === 'STUDENT' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setRole('STUDENT')}
                    >
                        Student
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${role === 'COORDINATOR' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setRole('COORDINATOR')}
                    >
                        Coordinator
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full px-3 py-2 border rounded" />

                    {role === 'STUDENT' && (
                        <>
                            <input type="text" name="rollNumber" placeholder="Roll Number" onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                            <input type="text" name="studentClass" placeholder="Class (e.g., Class A)" onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                        </>
                    )}

                    {role === 'COORDINATOR' && (
                        <input type="text" name="assignedClass" placeholder="Assigned Class (e.g., Class A)" onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                    )}

                    <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700">Register</button>
                </form>
                <div className="text-center">
                    <Link to="/" className="text-indigo-600 hover:text-indigo-800">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
