import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CheckCircle2, Circle, TrendingUp, Info, Award, Clock } from 'lucide-react';

const StepItem = ({ step, isLast, isFirst }) => {
    const isCompleted = step.status === 'completed';
    const isActive = step.status === 'active';

    return (
        <div className="d-flex mb-0 position-relative">
            {!isLast && (
                <div className="position-absolute border-start" 
                     style={{ left: '20px', top: '40px', bottom: '0', width: '2px', zIndex: 0, borderColor: isCompleted ? 'var(--primary-color)' : '#eee', borderStyle: isCompleted ? 'solid' : 'dashed' }}></div>
            )}
            <div className="me-4 position-relative d-flex flex-column align-items-center" style={{ zIndex: 1, width: '40px' }}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all ${isCompleted ? 'bg-success text-white' : isActive ? 'bg-warning text-white scale-110' : 'bg-white text-muted border border-light'}`} 
                     style={{ width: 40, height: 40, border: isCompleted ? 'none' : isActive ? '4px solid #FFF5CC' : '1px solid #eee' }}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <span className="fw-bold" style={{fontSize: '0.9rem'}}>{step.id}</span>}
                </div>
            </div>
            <div className={`flex-grow-1 pb-5 ${isActive ? 'mt-n1' : ''}`}>
                <div className="glass-panel p-3 border-0 shadow-sm rounded-4 transition-all hover-shadow" style={{ background: isActive ? '#FFFDF5' : 'white', border: isActive ? '1px solid #FFEDCC' : '1px solid #F8F9FA' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className={`fw-bold m-0 ${isCompleted ? 'text-dark' : isActive ? 'text-dark' : 'text-muted'}`}>
                            {step.title}
                        </h6>
                        {step.date && <span className="badge bg-light text-muted fw-normal rounded-pill" style={{fontSize: '0.65rem'}}>{step.date}</span>}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className={`small fw-bold ${isCompleted ? 'text-success' : isActive ? 'text-warning' : 'text-muted opacity-50'} uppercase`} style={{fontSize: '0.6rem'}}>
                            {isCompleted ? 'Étape validée' : isActive ? 'En cours de formation' : 'Étape à venir'}
                        </span>
                        {step.progress && <span className="text-muted small">·</span>}
                        {step.progress && <span className="text-dark fw-bold small" style={{fontSize: '0.7rem'}}>{step.progress}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CandidateTracking = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/candidate/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning border-3" style={{width: '3rem', height: '3rem'}}></div></div>;
    if (!data) return <div className="text-center py-5 text-muted">Impossible de charger votre suivi.</div>;

    const candidate = data.candidate;

    return (
        <div className="animate-fade-in container-fluid px-0">
            <div className="mb-4">
                <h5 className="fw-bold m-0 border-start border-4 border-warning ps-3 text-dark">Mon Parcours <span className="text-muted fw-normal fs-6 ms-2">/ Suivi de formation</span></h5>
            </div>

            <div className="row">
                {/* Timeline */}
                <div className="col-lg-6 mb-4">
                    <div className="bg-white p-4 p-md-5 rounded-5 shadow-sm border-0 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-5">
                            <h5 className="fw-bold m-0 d-flex align-items-center">
                                <TrendingUp size={20} className="me-2 text-warning" /> 
                                Étapes de votre réussite
                            </h5>
                            <div className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill small">
                                {Math.round(data.progress.global)}% complété
                            </div>
                        </div>
                        
                        <div className="ms-md-2">
                            {data.steps.map((step, idx) => (
                                <StepItem 
                                    key={step.id} 
                                    step={step} 
                                    isLast={idx === data.steps.length - 1} 
                                    isFirst={idx === 0}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details & Info */}
                <div className="col-lg-6 mb-4">
                    <div className="d-flex flex-column gap-4 h-100">
                        {/* Status Card */}
                        <div className="bg-white p-4 rounded-5 shadow-sm border-0">
                            <h6 className="fw-bold mb-4 text-muted uppercase small" style={{letterSpacing: '1px'}}>Informations Dossier</h6>
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="p-3 rounded-4 bg-light bg-opacity-50">
                                        <div className="text-muted small uppercase fw-bold mb-1" style={{fontSize: '0.6rem'}}>Permis visé</div>
                                        <div className="fw-bold text-dark">Catégorie {candidate.license_type}</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 rounded-4 bg-light bg-opacity-50">
                                        <div className="text-muted small uppercase fw-bold mb-1" style={{fontSize: '0.6rem'}}>Statut Dossier</div>
                                        <div className="badge bg-success bg-opacity-10 text-success rounded-pill px-2">Complet</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 rounded-4 bg-light bg-opacity-50">
                                        <div className="text-muted small uppercase fw-bold mb-1" style={{fontSize: '0.6rem'}}>Date d'inscription</div>
                                        <div className="fw-bold text-dark">{new Date(candidate.registration_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 rounded-4 bg-light bg-opacity-50">
                                        <div className="text-muted small uppercase fw-bold mb-1" style={{fontSize: '0.6rem'}}>ID Candidat</div>
                                        <div className="fw-bold text-dark">#{candidate.id.toString().padStart(4, '0')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Exam Results Card */}
                        <div className="bg-white p-4 rounded-5 shadow-sm border-0 flex-grow-1">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h6 className="fw-bold m-0 text-muted uppercase small" style={{letterSpacing: '1px'}}>Résultats Examens</h6>
                                <Award className="text-warning opacity-50" size={20} />
                            </div>

                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center justify-content-between p-3 rounded-4 border border-light transition-all hover-shadow">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 me-3">
                                            <Info size={16} />
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark small">Examen Théorique (Code)</div>
                                            <div className="text-muted" style={{fontSize: '0.65rem'}}>Passé le 10/04/2026 · Tentative #1</div>
                                        </div>
                                    </div>
                                    <div className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">ADMIS</div>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 rounded-4 border border-light transition-all hover-shadow bg-light bg-opacity-25">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-warning bg-opacity-10 text-warning p-2 me-3">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark small">Examen Pratique (Conduite)</div>
                                            <div className="text-muted" style={{fontSize: '0.65rem'}}>Prévu pour le {data.stats.next_exam_date || 'prochainement'}</div>
                                        </div>
                                    </div>
                                    <div className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3">EN ATTENTE</div>
                                </div>
                            </div>

                            <div className="mt-5 p-4 rounded-4" style={{ background: 'linear-gradient(45deg, #FFD70008, #FFD70015)', border: '1px dashed #FFD70040' }}>
                                <div className="d-flex gap-3">
                                    <div className="text-warning mt-1"><Info size={20} /></div>
                                    <div>
                                        <h6 className="fw-bold text-dark small mb-1">Dernière Mise à Jour</h6>
                                        <p className="text-muted small m-0 fst-italic" style={{lineHeight: '1.4'}}>
                                            Votre dossier est à jour. N'oubliez pas d'apporter votre CIN originale le jour de l'examen pratique.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .scale-110 { transform: scale(1.15); box-shadow: 0 0 15px rgba(255, 193, 7, 0.3) !important; }
                .hover-shadow:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-2px); }
                .uppercase { text-transform: uppercase; }
                .mt-n1 { margin-top: -5px; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CandidateTracking;
