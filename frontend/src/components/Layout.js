import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, UserCog, CarFront, 
    CalendarCheck, Wallet, Receipt, LogOut, Menu, X,
    GraduationCap, ShieldCheck, Settings, ClipboardList,
    CheckSquare, CreditCard, Bell, FileText, User, BookOpen, Video, FileDown, ExternalLink
} from 'lucide-react';
import schoolLogo from '../assets/logo.png';




const SidebarLink = ({ to, icon: Icon, children, currentPath }) => {
    const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));
    return (
        <Link 
            to={to} 
            className={`d-flex align-items-center py-2 px-3 mb-1 text-decoration-none transition-all ${
                isActive ? 'active-link' : ''
            }`}
            style={{ 
                fontSize: '0.85rem',
                fontWeight: isActive ? '600' : '400',
                borderLeft: isActive ? '4px solid var(--primary-color)' : '4px solid transparent',
                backgroundColor: isActive ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary-color)' : '#ffffff !important',
            }}
        >
            <Icon size={18} className="me-3" />
            <span>{children}</span>
        </Link>
    );
};

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Track mobile breakpoint properly via resize event
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('fr-FR', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    // Filter menu based on role
    const getMenu = () => {
        if (user?.role === 'candidate') {
            return [
                { path: '/candidate/dashboard', icon: LayoutDashboard, label: t('menu.candidate_home') },
                { path: '/candidate/tracking', icon: CheckSquare, label: t('menu.tracking') },
                { path: '/candidate/sessions', icon: CalendarCheck, label: t('menu.sessions') },
                { path: '/candidate/payments', icon: CreditCard, label: t('menu.payments') },
                { path: '/candidate/documents', icon: FileText, label: t('menu.documents') },
                { path: '/candidate/resources', icon: BookOpen, label: t('menu.resources') },
                { path: '/candidate/profile', icon: User, label: t('menu.profile') },
            ];
        }

        if (user?.role === 'instructor') {
            return [
                { path: '/instructor/dashboard', icon: LayoutDashboard, label: t('menu.candidate_home') },
                { path: '/instructor/planning', icon: CalendarCheck, label: t('menu.planning') },
                { path: '/instructor/candidates', icon: Users, label: t('menu.my_students') },
                { path: '/instructor/reports', icon: ClipboardList, label: t('menu.reports') },
                { path: '/instructor/profile', icon: Settings, label: t('menu.profile') },
            ];
        }

        const base = [
            { path: '/dashboard', icon: LayoutDashboard, label: t('menu.dashboard') },
            { path: '/candidates', icon: Users, label: t('menu.candidates') },
            { path: '/appointments', icon: CalendarCheck, label: t('menu.planning') },
            { path: '/payments', icon: Wallet, label: t('menu.payments') },
            { path: '/exams', icon: GraduationCap, label: t('menu.exams') },
        ];

        if (user?.role === 'admin' || user?.role === 'secretary') {
            base.push({ path: '/instructors', icon: UserCog, label: t('menu.instructors') });
            base.push({ path: '/vehicles', icon: CarFront, label: t('menu.vehicles') });
        }
        
        if (user?.role === 'admin') {
            base.push({ divider: true });
            base.push({ path: '/expenses', icon: Receipt, label: t('menu.expenses') });
            base.push({ path: '/staff', icon: ShieldCheck, label: t('menu.staff') });
            base.push({ path: '/settings', icon: Settings, label: t('menu.settings') });
        }
        return base;
    };

    const getPageTitle = () => {
        const item = getMenu().find(m => location.pathname.startsWith(m.path));
        return item ? item.label : (i18n.language === 'ar' ? 'مدرسة جنوب' : 'Auto École Janoub');
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = () => {
        if (user?.role === 'candidate') return '#FFBF00'; // Amber
        if (user?.role === 'instructor') return 'var(--teal-color)';
        return 'var(--primary-color)';
    };

    return (
        <div className="d-flex min-vh-100" style={{ background: 'var(--bg-body)' }}>
            {/* Desktop Sidebar (Non-fixed for better flex stability) */}
            <div className="d-none d-lg-flex flex-column no-print shadow-lg" 
                 style={{ 
                    width: '240px', 
                    minWidth: '240px',
                    height: '100vh', 
                    position: 'sticky',
                    top: 0,
                    zIndex: 100, 
                    backgroundColor: 'var(--secondary-color)', 
                    border: 'none'
                 }}>
                
                <Link to="/" className="text-decoration-none p-4 mb-3 d-block">
                    <div className="d-flex align-items-center">
                        <div className="me-3 p-1 rounded-3 bg-white shadow-sm d-flex align-items-center justify-content-center" 
                             style={{ 
                                width: '50px', 
                                height: '50px',
                                overflow: 'hidden'
                             }}>
                            <img src={schoolLogo} alt="Logo Janoub" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className="d-flex flex-column">
                            <span style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '900', letterSpacing: '2px', lineHeight: '1' }}>JANOUB</span>
                            <span className="text-white opacity-75 fw-bold" style={{ fontSize: '0.55rem', letterSpacing: '3px', marginTop: '3px' }}>AUTO ÉCOLE</span>
                        </div>
                    </div>
                </Link>

                <div className="d-flex flex-column flex-grow-1 overflow-auto py-2 border-top border-secondary">
                    {getMenu().map((item, idx) => (
                        item.divider ? (
                            <hr key={`div-${idx}`} className="mx-4 my-3 opacity-10 border-white" />
                        ) : (
                            <SidebarLink key={item.path || idx} to={item.path} icon={item.icon} currentPath={location.pathname}>
                                {item.label}
                            </SidebarLink>
                        )
                    ))}
                </div>

                <div className="px-4 py-3 mt-auto">
                    <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm" 
                             style={{
                                width: 36, 
                                height: 36, 
                                background: getAvatarColor(), 
                                color: 'white',
                                fontSize: '0.8rem'
                             }}>
                            <span className="fw-bold">{getInitials(user?.name)}</span>
                        </div>
                        <div className="overflow-hidden">
                            <div className="fw-semibold text-white text-truncate m-0" style={{fontSize: '0.8rem'}}>{user?.name}</div>
                            <div className="text-white opacity-75 small text-truncate" style={{fontSize: '0.65rem'}}>
                                {user?.role === 'candidate' ? 'Candidat · Permis B' : 
                                 user?.role === 'instructor' ? 'Moniteur' : user?.role?.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <button onClick={logout} className="btn btn-link text-danger w-100 d-flex align-items-center p-1 text-decoration-none hover-opacity-75 transition-all">
                        <LogOut size={14} className="me-2" /> <span className="small fw-bold" style={{fontSize: '0.7rem'}}>{t('menu.logout')}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Nav Top */}
            <div className="d-lg-none m-0 p-3 position-fixed top-0 start-0 end-0 d-flex justify-content-between align-items-center no-print shadow-sm" style={{ zIndex: 60, backgroundColor: 'var(--secondary-color)' }}>
                <div className="d-flex align-items-center">
                    <div className="p-1 rounded-2 me-2 bg-white" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
                        <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span className="fw-bold text-white" style={{ letterSpacing: '1px', fontSize: '1rem' }}>JANOUB</span>
                </div>
                <button className="btn btn-link text-white p-0" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Main Wrapper */}
            <div className="d-flex flex-column flex-grow-1 min-vw-0">
                {/* Topbar (Desktop Only) */}
                <div className="no-print d-none d-lg-block w-100" style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
                    <div className="h-100 px-4 d-flex align-items-center justify-content-between">
                        <div>
                            <h5 className="m-0 fw-bold text-dark">{getPageTitle()}</h5>
                        </div>
                        <div className="text-muted small fw-medium">{formattedDate}</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="p-4 p-md-5 flex-grow-1 overflow-auto main-content-print-fix" 
                      style={{ 
                        marginTop: isMobile ? '70px' : '0',
                        transition: 'margin 0.3s ease'
                      }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="d-lg-none position-fixed inset-0 bg-black bg-opacity-50" style={{ zIndex: 70 }} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div 
                        initial={{ x: -200 }} animate={{ x: 0 }}
                        className="h-100 bg-dark shadow-lg" style={{ width: '200px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 mb-3 border-bottom border-secondary">
                            <div className="d-flex align-items-center">
                                <div className="me-2 p-1 rounded-2 bg-white" style={{ width: '40px', height: '40px', overflow: 'hidden' }}>
                                    <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '800' }}>JANOUB</span>
                            </div>
                        </div>
                        <div className="py-2">
                             {getMenu().map((item, idx) => (
                                item.divider ? null : (
                                    <SidebarLink key={item.path} to={item.path} icon={item.icon} currentPath={location.pathname}>
                                        {item.label}
                                    </SidebarLink>
                                )
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Layout;
