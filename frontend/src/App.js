import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Instructors from './pages/Instructors';
import Payments from './pages/Payments';
import Appointments from './pages/Appointments';
import Vehicles from './pages/Vehicles';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';
import Exams from './pages/Exams';
import Settings from './pages/Settings';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorPlanning from './pages/instructor/InstructorPlanning';
import InstructorStudents from './pages/instructor/InstructorStudents';
import InstructorReports from './pages/instructor/InstructorReports';
import InstructorProfile from './pages/instructor/InstructorProfile';

import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateTracking from './pages/candidate/CandidateTracking';
import CandidateSessions from './pages/candidate/CandidateSessions';
import CandidatePayments from './pages/candidate/CandidatePayments';
import CandidateDocuments from './pages/candidate/CandidateDocuments';
import CandidateResources from './pages/candidate/CandidateResources';
import CandidateProfile from './pages/candidate/CandidateProfile';


import RoleGuard from './components/RoleGuard';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="d-flex min-vh-100 justify-content-center align-items-center"><div className="spinner-grow text-primary"></div></div>;
    return user ? children : <Navigate to="/login" />;
};

const HomeRedirect = () => {
    const { user } = useAuth();
    if (user?.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    if (user?.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
};


function AppRoutes() {

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<HomeRedirect />} />
                
                {/* Admin/Secretary Routes */}
                <Route path="dashboard" element={<RoleGuard allowedRoles={['admin', 'secretary']}><Dashboard /></RoleGuard>} />
                <Route path="candidates" element={<RoleGuard allowedRoles={['admin', 'secretary']}><Candidates /></RoleGuard>} />
                <Route path="instructors" element={<RoleGuard allowedRoles={['admin', 'secretary']}><Instructors /></RoleGuard>} />
                <Route path="payments" element={<RoleGuard allowedRoles={['admin', 'secretary']}><Payments /></RoleGuard>} />
                <Route path="appointments" element={<RoleGuard allowedRoles={['admin', 'secretary']}><Appointments /></RoleGuard>} />
                <Route path="vehicles" element={<RoleGuard allowedRoles={['admin', 'secretary']}><Vehicles /></RoleGuard>} />
                <Route path="exams" element={<RoleGuard allowedRoles={['admin', 'secretary']}><Exams /></RoleGuard>} />
                
                {/* Admin Only Routes */}
                <Route path="expenses" element={<RoleGuard allowedRoles={['admin']}><Expenses /></RoleGuard>} />
                <Route path="staff" element={<RoleGuard allowedRoles={['admin']}><Staff /></RoleGuard>} />
                <Route path="settings" element={<RoleGuard allowedRoles={['admin']}><Settings /></RoleGuard>} />

                {/* Instructor Portal Routes */}
                <Route path="instructor/dashboard" element={<RoleGuard allowedRoles={['instructor']}><InstructorDashboard /></RoleGuard>} />
                <Route path="instructor/planning" element={<RoleGuard allowedRoles={['instructor']}><InstructorPlanning /></RoleGuard>} />
                <Route path="instructor/candidates" element={<RoleGuard allowedRoles={['instructor']}><InstructorStudents /></RoleGuard>} />
                <Route path="instructor/reports" element={<RoleGuard allowedRoles={['instructor']}><InstructorReports /></RoleGuard>} />
                <Route path="instructor/profile" element={<RoleGuard allowedRoles={['instructor']}><InstructorProfile /></RoleGuard>} />

                {/* Candidate Portal Routes */}
                <Route path="candidate/dashboard" element={<RoleGuard allowedRoles={['candidate']}><CandidateDashboard /></RoleGuard>} />
                <Route path="candidate/tracking" element={<RoleGuard allowedRoles={['candidate']}><CandidateTracking /></RoleGuard>} />
                <Route path="candidate/sessions" element={<RoleGuard allowedRoles={['candidate']}><CandidateSessions /></RoleGuard>} />
                <Route path="candidate/payments" element={<RoleGuard allowedRoles={['candidate']}><CandidatePayments /></RoleGuard>} />
                <Route path="candidate/documents" element={<RoleGuard allowedRoles={['candidate']}><CandidateDocuments /></RoleGuard>} />
                <Route path="candidate/resources" element={<RoleGuard allowedRoles={['candidate']}><CandidateResources /></RoleGuard>} />
                <Route path="candidate/profile" element={<RoleGuard allowedRoles={['candidate']}><CandidateProfile /></RoleGuard>} />
            </Route>





            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
            <ToastContainer position="top-right" theme="dark" />
        </AuthProvider>
    );
}

export default App;
