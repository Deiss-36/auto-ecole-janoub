import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, Clock, TrendingUp, Car, ChevronRight, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="col-12 col-sm-6 col-lg-3 mb-4">
        <div className="glass-panel p-4 h-100 border-0 shadow-sm transition-all hover-up position-relative overflow-hidden" style={{ borderRadius: '25px', background: 'white' }}>
            <div className="position-absolute" style={{ top: '-10px', right: '-10px', opacity: 0.05 }}>
                <Icon size={100} />
            </div>
            <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-4 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ backgroundColor: `${color}15`, color, width: '42px', height: '42px' }}>
                    <Icon size={22} />
                </div>
                <h6 className="text-muted fw-bold small m-0 uppercase" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>{title}</h6>
            </div>
            <div className="d-flex align-items-baseline">
                <h2 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-1px' }}>{value}</h2>
            </div>
        </div>
    </div>
);

const InstructorHome = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/instructor/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-teal border-3" style={{width: '3rem', height: '3rem', color: 'var(--teal-color)'}}></div></div>;
    if (!data) return <div className="text-center py-5 text-muted shadow-sm rounded-4 bg-white mx-auto mt-5" style={{maxWidth: '400px'}}>{t('instructor.loading_error')}</div>;

    const isAr = i18n.language === 'ar';

    return (
        <div className="animate-fade-in container-fluid px-0" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Header section */}
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle overflow-hidden shadow-lg me-3 border border-4 border-white" style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, var(--teal-color), #20B2AA)' }}>
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold fs-3">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                    <div>
                        <h4 className="fw-bold text-dark m-0">{t('instructor_dashboard.welcome')}, {user?.name.split(' ')[0]} 👨‍🏫</h4>
                        <p className="text-muted small m-0 fst-italic">{t('instructor_dashboard.subtitle')}</p>
                    </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-pill shadow-sm border border-light d-inline-flex align-items-center">
                    <div className="rounded-circle bg-success me-2 ms-2" style={{ width: '8px', height: '8px' }}></div>
                    <span className="small fw-bold text-dark uppercase" style={{ fontSize: '0.7rem' }}>{t('instructor_dashboard.active_duty')} · {new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-4">
                <StatCard title={t('instructor.active_students')} value={data.stats.total_students} icon={Users} color="#008080" />
                <StatCard title={t('instructor_dashboard.total_day')} value={data.stats.today_sessions} icon={Calendar} color="#FF9800" />
                <StatCard title={t('instructor.hours_month')} value={`${data.stats.hours_this_month}h`} icon={Clock} color="#27AE60" />
                <StatCard title={t('instructor.success_rate')} value={`${data.stats.success_rate}%`} icon={TrendingUp} color="#1A73E8" />
            </div>

            <div className="row">
                {/* Planning Today */}
                <div className="col-xl-7 mb-4">
                    <div className="bg-white p-4 rounded-5 shadow-sm border-0 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0 text-dark">{t('instructor_dashboard.planning_today')}</h5>
                            <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-muted small" style={{fontSize: '0.65rem'}}>{t('instructor_dashboard.see_calendar')}</button>
                        </div>
                        
                        <div className="d-flex flex-column gap-3">
                            {data.today_planning.length > 0 ? data.today_planning.map((appt) => (
                                <div key={appt.id} className="d-flex align-items-center p-3 rounded-4 border border-light transition-all hover-shadow bg-light bg-opacity-25">
                                    <div className="bg-teal bg-opacity-10 text-teal rounded-4 p-2 text-center d-flex flex-column justify-content-center me-3 ms-3" style={{ minWidth: '65px', color: 'var(--teal-color)', backgroundColor: 'rgba(0, 128, 128, 0.1)' }}>
                                        <div className="fw-bold leading-none fs-6">{appt.start_time.substring(0, 5)}</div>
                                        <div className="fw-bold uppercase" style={{fontSize: '0.5rem', opacity: 0.7}}>1H</div>
                                    </div>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 ms-3 shadow-sm border border-white" 
                                         style={{width: 42, height: 42, background: 'var(--teal-color)', color: 'white', fontSize: '0.8rem'}}>
                                        <span className="fw-bold">{getInitials(appt.candidates?.[0]?.user?.name)}</span>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="fw-bold text-dark small text-truncate">
                                            {appt.candidates?.[0]?.user?.name || '—'}
                                            {appt.candidates?.length > 1 && <span className="ms-1 text-muted small">(+{appt.candidates.length - 1})</span>}
                                        </div>
                                        <div className="text-muted d-flex align-items-center gap-1" style={{fontSize: '0.7rem'}}>
                                            <span className={`badge rounded-pill ${appt.session_type === 'driving' ? 'bg-primary' : 'bg-orange'} bg-opacity-10 ${appt.session_type === 'driving' ? 'text-primary' : 'text-orange'} fw-bold px-2 py-0`} style={{fontSize: '0.55rem'}}>
                                                {appt.session_type?.toUpperCase()}
                                            </span>
                                            · {appt.license_type} · {appt.vehicle?.brand || 'Salle'}
                                        </div>
                                    </div>
                                    <div className="ms-auto me-2">
                                        {appt.status === 'completed' ? (
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold" style={{fontSize: '0.65rem'}}>TERMINÉ</span>
                                        ) : (
                                            <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 fw-bold" style={{fontSize: '0.65rem'}}>À VENIR</span>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                    <Calendar className="text-muted opacity-20 mb-3" size={48} />
                                    <p className="text-muted small">{t('instructor_dashboard.no_sessions')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="col-xl-5 mb-4">
                    <div className="bg-white p-4 rounded-5 shadow-sm border-0 h-100">
                        <h5 className="fw-bold mb-4 text-dark">{t('instructor_dashboard.activity_feed')}</h5>
                        <div className={`d-flex flex-column gap-4 border-${isAr ? 'end' : 'start'} border-light-subtle ${isAr ? 'me-2 pe-4' : 'ms-2 ps-4'} py-2 position-relative`}>
                            {data.recent_activity.map((act, idx) => (
                                <div key={idx} className="position-relative">
                                    <div className={`position-absolute rounded-circle bg-${act.color} shadow-sm`} 
                                         style={{ width: 12, height: 12, [isAr ? 'right' : 'left']: '-30px', top: '4px', border: '3px solid white' }}></div>
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <h6 className="fw-bold text-dark small m-0">{act.title}</h6>
                                        <span className="text-muted" style={{fontSize: '0.65rem'}}>{act.time}</span>
                                    </div>
                                    <p className="text-muted small m-0 fst-italic">{act.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 p-3 rounded-4 bg-light border border-light">
                             <div className="d-flex align-items-center justify-content-between">
                                <span className="small fw-bold text-dark uppercase" style={{fontSize: '0.65rem'}}>{t('instructor_dashboard.total_day')}</span>
                                <span className="fw-bold text-dark">{data.stats.today_sessions} {t('instructor_dashboard.hours_worked')}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .bg-teal { background-color: var(--teal-color); }
                .text-teal { color: var(--teal-color); }
                .bg-orange { background-color: #f39c12; }
                .text-orange { color: #f39c12; }
                .leading-none { line-height: 1; }
                .transition-all { transition: all 0.3s ease; }
                .hover-shadow:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateX(${isAr ? '-5px' : '5px'}); }
                .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important; }
                .uppercase { text-transform: uppercase; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default InstructorHome;
