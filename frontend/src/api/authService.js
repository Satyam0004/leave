import api from './axiosConfig';

const registerStudent = (data) => {
    return api.post('/auth/register/student', data);
};

const registerCoordinator = (data) => {
    return api.post('/auth/register/coordinator', data);
};

const login = (data) => {
    return api.post('/auth/login', data);
};

const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export default {
    registerStudent,
    registerCoordinator,
    login,
    getCurrentUser,
    logout
};
