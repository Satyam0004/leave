import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import CoordinatorDashboard from './components/CoordinatorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />; // Or unauthorized page
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route
              path="/student"
              element={
                <PrivateRoute role="STUDENT">
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/coordinator"
              element={
                <PrivateRoute role="COORDINATOR">
                  <CoordinatorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute role="ADMIN">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
