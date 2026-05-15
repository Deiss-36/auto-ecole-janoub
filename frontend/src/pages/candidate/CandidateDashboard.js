import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CreditCard, Award, User, TrendingUp } from 'lucide-react';


const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="col-12 col-md-6 col-xl-3 mb-4">
        <div className="glass-panel p-4 h-100 border-0 shadow-sm transition-all hover-up position-relative overflow-hidden" style={{ borderRadius: '20px', background: 'white' }}>
            <div className="position-absolute" style={{ top: '-10px', right: '-10px', opacity: 0.05 }}>
                <Icon size={100} />
            </div>
            <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-4 me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: `${color}15`, color, width: '42px', height: '42px' }}>
                    <Icon size={22} />
                </div>
                <h6 className="text-muted fw-bold small m-0 uppercase" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>{title}</h6>
            </div>
            <div className="d-flex align-items-baseline">
                <h2 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-1px' }}>{value}</h2>
                {sub && <span className="ms-2 text-muted fw-medium" style={{fontSize: '0.75rem'}}>{sub}</span>}
            </div>
        </div>
    </div>
);

const CandidateDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/candidate/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning border-3" style={{width: '3rem', height: '3rem'}}></div></div>;
    if (!data) return <div className="text-center py-5 text-muted shadow-sm rounded-4 bg-white mx-auto mt-5" style={{maxWidth: '400px'}}>Erreur de chargement des données.</div>;

    const remainingBal = parseFloat(data.stats.remaining_balance);

    const formatDuration = (start, end) => {
        if (!start || !end) return '';
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diffMins < 0) diffMins += 24 * 60;
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        if (h > 0 && m > 0) return `${h}h${m}`;
        if (h > 0) return `${h}h`;
        return `${m} min`;
    };

    return (
        <div className="animate-fade-in container-fluid px-0">
            {/* Header section */}
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle overflow-hidden shadow-sm me-3 border border-2 border-warning" style={{ width: '60px', height: '60px', background: 'var(--primary-color)' }}>
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold fs-4">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                    <div>
                        <h4 className="fw-bold text-dark m-0">Bonjour, {user?.name.split(' ')[0]} 👋</h4>
                        <p className="text-muted small m-0 fst-italic">Consultez votre progression et vos prochaines séances ici.</p>
                    </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-pill shadow-sm border border-light d-inline-flex align-items-center">
                    <div className="rounded-circle bg-success me-2" style={{ width: '8px', height: '8px' }}></div>
                    <span className="small fw-bold text-dark uppercase" style={{ fontSize: '0.7rem' }}>Formation Active · Permis B</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-4">
                <StatCard title="Séances réalisées" value={data.stats.sessions_done} sub="/ 30" icon={Calendar} color="#FFC107" />
                <StatCard title="Heures de Code" value={`${data.stats.code_hours}h`} sub="/ 20h" icon={Clock} color="#FF9800" />
                <StatCard 
                    title="Solde Restant" 
                    value={`${remainingBal} DH`} 
                    sub={remainingBal === 0 ? "(Réglé)" : "(À payer)"} 
                    icon={CreditCard} 
                    color={remainingBal === 0 ? "#28A745" : "#DC3545"} 
                />
                <StatCard title="Prochain Examen" value={data.stats.next_exam_date} sub="—" icon={Award} color="#007BFF" />
            </div>

            <div className="row">
                {/* Upcoming Schedule */}
                <div className="col-xl-8 mb-4">
                    <div className="bg-white p-4 rounded-5 shadow-sm border-0 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0 text-dark">Mon Planning <span className="badge bg-light text-dark fw-normal rounded-pill ms-2" style={{fontSize: '0.7rem'}}>3 Prochaines</span></h5>
                            <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-muted small" style={{fontSize: '0.65rem'}}>Voir tout</button>
                        </div>
                        
                        <div className="row g-3">
                            {data.next_sessions.length > 0 ? data.next_sessions.map((appt, idx) => (
                                <div key={appt.id} className="col-12">
                                    <div className="d-flex align-items-center p-3 rounded-4 border border-light transition-all hover-shadow bg-light bg-opacity-25">
                                        <div className="bg-warning bg-opacity-10 text-warning rounded-4 p-3 text-center d-flex flex-column justify-content-center me-4" style={{ minWidth: '75px' }}>
                                            <div className="fw-bold leading-none mb-1" style={{ fontSize: '1.1rem' }}>
                                                {appt.start_time?.substring(0, 5)}
                                            </div>
                                            <div className="text-muted fw-bold mb-1" style={{ fontSize: '0.8rem' }}>
                                                à {appt.end_time?.substring(0, 5)}
                                            </div>
                                            <div className="fw-bold uppercase" style={{fontSize: '0.55rem', opacity: 0.7}}>
                                                ({formatDuration(appt.start_time, appt.end_time)})
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className={`badge rounded-pill ${appt.session_type === 'driving' ? 'bg-primary' : 'bg-orange'} bg-opacity-10 ${appt.session_type === 'driving' ? 'text-primary' : 'text-orange'} fw-bold px-2 py-1`} style={{fontSize: '0.6rem'}}>
                                                    {appt.session_type === 'driving' ? 'CONDUITE' : 'CODE'}
                                                </span>
                                                <span className="text-muted small">·</span>
                                                <span className="text-dark fw-bold small">{appt.instructor?.user?.name || 'Moniteur Janoub'}</span>
                                            </div>
                                            <div className="text-muted d-flex align-items-center" style={{fontSize: '0.75rem'}}>
                                                <TrendingUp size={12} className="me-1 text-success" />
                                                Prévu pour le {new Date(appt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <div className="d-none d-md-block ms-3">
                                            {appt.vehicle ? (
                                                <div className="text-end">
                                                    <div className="small fw-bold text-dark">{appt.vehicle.brand}</div>
                                                    <div className="text-muted" style={{fontSize: '0.65rem'}}>{appt.vehicle.plate_number}</div>
                                                </div>
                                            ) : (
                                                <div className="text-muted small">Salle de code</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-5 bg-light rounded-4 border border-dashed col-12">
                                    <Calendar className="text-muted opacity-20 mb-3" size={48} />
                                    <p className="text-muted small">Aucune séance planifiée pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Circle & Status */}
                <div className="col-xl-4 mb-4">
                    <div className="bg-white p-4 rounded-5 shadow-sm border-0 h-100 d-flex flex-column">
                        <h5 className="fw-bold mb-4 text-dark">Progression Globale</h5>
                        
                        <div className="flex-grow-1 d-flex flex-column justify-content-center py-3">
                            <div className="position-relative mx-auto mb-4" style={{ width: '160px', height: '160px' }}>
                                <svg className="w-100 h-100" viewBox="0 0 36 36">
                                    <path className="text-light" style={{stroke: '#f3f3f3', strokeWidth: '3'}} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path 
                                        className="text-warning transition-all" 
                                        style={{ stroke: 'var(--primary-color)', strokeWidth: '3', strokeDasharray: `${data.progress.global}, 100`, strokeLinecap: 'round' }} 
                                        fill="none" 
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    />
                                </svg>
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <h2 className="fw-bold m-0 text-dark">{data.progress.global}%</h2>
                                    <div className="text-muted uppercase fw-bold" style={{fontSize: '0.6rem', letterSpacing: '1px'}}>Terminé</div>
                                </div>
                            </div>
                            
                            <div className="d-flex flex-column gap-3">
                                <div className="p-3 rounded-4 bg-light bg-opacity-50 border border-light">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small fw-bold text-muted uppercase" style={{fontSize: '0.6rem'}}>Conduite</span>
                                        <span className="small fw-bold text-dark">{data.progress.driving}%</span>
                                    </div>
                                    <div className="progress rounded-pill bg-white" style={{height: 4}}>
                                        <div className="progress-bar rounded-pill bg-warning" style={{width: `${data.progress.driving}%`}}></div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-4 bg-light bg-opacity-50 border border-light">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small fw-bold text-muted uppercase" style={{fontSize: '0.6rem'}}>Code</span>
                                        <span className="small fw-bold text-dark">{data.progress.code}%</span>
                                    </div>
                                    <div className="progress rounded-pill bg-white" style={{height: 4}}>
                                        <div className="progress-bar rounded-pill bg-warning" style={{width: `${data.progress.code}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top d-flex align-items-center gap-3">
                            <div className="rounded-4 bg-warning bg-opacity-10 text-warning px-3 py-2 fw-bold small" style={{fontSize: '0.7rem'}}>
                                ÉTAPE : {data.steps.filter(s => s.status === 'completed').length + 1} / 6
                            </div>
                            <div className="text-muted small fw-medium" style={{fontSize: '0.7rem'}}>
                                Prochaine étape : <span className="text-dark fw-bold">{data.steps.find(s => s.status === 'active')?.title || 'Fin de formation'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .bg-orange { background-color: #f39c12; }
                .text-orange { color: #f39c12; }
                .leading-none { line-height: 1; }
                .transition-all { transition: all 0.3s ease; }
                .hover-shadow:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateX(5px); }
                .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important; }
                .uppercase { text-transform: uppercase; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CandidateDashboard;
