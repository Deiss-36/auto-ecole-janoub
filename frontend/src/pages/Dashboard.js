import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, CalendarCheck, TrendingUp, Wallet, Clock, CheckCircle, Car } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
    <div className="col-12 col-sm-6 col-lg-3 mb-4">
        <div className="glass-panel p-4 h-100 border-0 shadow-sm transition-all hover-up position-relative overflow-hidden" 
             style={{ borderRadius: '20px', background: 'white', animation: `fadeInUp 0.5s ease forwards ${delay}s`, opacity: 0 }}>
            <div className="position-absolute" style={{ top: '-10px', right: '-10px', opacity: 0.05 }}>
                <Icon size={100} />
            </div>
            <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-4 me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: `${color}15`, color, width: '42px', height: '42px' }}>
                    <Icon size={22} />
                </div>
                <h6 className="text-muted fw-bold small m-0 uppercase" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>{title}</h6>
            </div>
            <div className="d-flex flex-column">
                <h2 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-1px' }}>{value}</h2>
                <div className="text-muted mt-1 fw-medium" style={{fontSize: '0.7rem'}}>{subtitle}</div>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary border-3" style={{width: '3rem', height: '3rem'}}></div></div>;
    if (!data) return <div className="text-center py-5 text-muted shadow-sm rounded-4 bg-white mx-auto mt-5" style={{maxWidth: '400px'}}>Aucune donnée disponible.</div>;

    return (
        <div className="animate-fade-in container-fluid px-0">
            {/* Header section */}
            <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                    <h2 className="fw-bold text-dark m-0">Espace Administration ⚡</h2>
                    <p className="text-muted m-0">Gérez votre auto-école avec précision et efficacité.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-pill shadow-sm border border-light d-inline-flex align-items-center">
                    <div className="rounded-circle bg-success me-2 pulse" style={{ width: '8px', height: '8px' }}></div>
                    <span className="small fw-bold text-dark uppercase" style={{ fontSize: '0.7rem' }}>Système Janoub v2.0 · Opérationnel</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-4">
                <StatCard 
                    title="Élèves Actifs" 
                    value={data.candidates.active} 
                    subtitle={`+${data.candidates.new_this_month} inscriptions ce mois`}
                    icon={Users} color="#0d6efd" delay={0.1} />
                
                <StatCard 
                    title="Revenu du Mois" 
                    value={`${data.revenue.total_month} DH`} 
                    subtitle="Recettes totales encaissées"
                    icon={Wallet} color="#198754" delay={0.2} />

                <StatCard 
                    title="Reste à Encaisser" 
                    value={`${data.revenue.outstanding} DH`} 
                    subtitle="Créances à recouvrer"
                    icon={TrendingUp} color="#dc3545" delay={0.3} />

                <StatCard 
                    title="Séances Aujourd'hui" 
                    value={data.appointments.today} 
                    subtitle="Surcharge du planning"
                    icon={CalendarCheck} color="#ff9800" delay={0.4} />
            </div>

            <div className="row mt-2">
                {/* Recent Payments Tile */}
                <div className="col-xl-7 mb-4">
                    <div className="bg-white p-4 rounded-5 shadow-sm border-0 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light">
                            <h5 className="fw-bold m-0 text-dark">Derniers Paiements</h5>
                            <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-muted small" style={{fontSize: '0.65rem'}}>Exporter</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light bg-opacity-50">
                                    <tr>
                                        <th className="border-0 small fw-bold text-muted uppercase" style={{fontSize: '0.6rem'}}>CANDIDAT</th>
                                        <th className="border-0 small fw-bold text-muted uppercase text-end" style={{fontSize: '0.6rem'}}>MONTANT</th>
                                        <th className="border-0 small fw-bold text-muted uppercase text-end" style={{fontSize: '0.6rem'}}>DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recent_payments.slice(0, 6).map((pay) => (
                                        <tr key={pay.id}>
                                            <td className="py-3">
                                                <div className="fw-bold text-dark small">{pay.candidate?.user?.name || '---'}</div>
                                            </td>
                                            <td className="text-end py-3">
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold" style={{fontSize: '0.7rem'}}>
                                                    +{pay.amount} DH
                                                </span>
                                            </td>
                                            <td className="text-end text-muted py-3" style={{fontSize: '0.7rem'}}>{pay.payment_date}</td>
                                        </tr>
                                    ))}
                                    {data.recent_payments.length === 0 && (
                                        <tr><td colSpan="3" className="text-center text-muted py-5 small">Aucun paiement enregistré.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Upcoming Schedule */}
                <div className="col-xl-5 mb-4">
                    <div className="bg-white p-4 rounded-5 shadow-sm border-0 h-100">
                        <h5 className="fw-bold mb-4 text-dark d-flex align-items-center">
                            <Clock size={20} className="me-2 text-primary" /> Planning du Jour
                        </h5>
                        <div className="d-flex flex-column gap-3">
                            {data.upcoming_appointments.map((appt, i) => (
                                <div key={appt.id} className="d-flex align-items-center p-3 rounded-4 border border-light transition-all hover-shadow bg-light bg-opacity-25">
                                    <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center me-3 border border-light" style={{ width: 40, height: 40 }}>
                                        <Car size={18} className="text-dark opacity-50" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="m-0 fw-bold text-dark small">
                                            {appt.candidates && appt.candidates.length > 0
                                                ? appt.candidates.slice(0, 2).map(c => c.user?.name).join(', ')
                                                : '—'}
                                        </h6>
                                        <p className="text-muted m-0" style={{fontSize: '0.65rem'}}>Moniteur: {appt.instructor?.user?.name}</p>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-primary leading-none mb-1">{appt.start_time.substring(0, 5)}</div>
                                        <div className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 uppercase" style={{fontSize: '0.55rem'}}>{appt.license_type}</div>
                                    </div>
                                </div>
                            ))}
                            {data.upcoming_appointments.length === 0 && (
                                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                    <CalendarCheck className="text-muted opacity-20 mb-3" size={48} />
                                    <p className="text-muted small">Aucune leçon aujourd'hui.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-3 border-top text-center">
                            <button className="btn btn-link text-decoration-none small fw-bold text-muted" style={{fontSize: '0.7rem'}}>VOIR TOUT LE PLANNING</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx="true">{`
                .pulse { animation: pulse-animation 2s infinite; }
                @keyframes pulse-animation { 
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .hover-shadow:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateX(5px); }
                .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important; }
                .leading-none { line-height: 1; }
                .uppercase { text-transform: uppercase; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
