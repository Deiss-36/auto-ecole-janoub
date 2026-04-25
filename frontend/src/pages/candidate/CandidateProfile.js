import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Calendar, Shield, MapPin, Key, Award, CheckCircle } from 'lucide-react';

const CandidateProfile = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        api.get('/candidate/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error("Les mots de passe ne correspondent pas");
        }
        toast.success("Mot de passe mis à jour !");
        setPasswords({ current: '', new: '', confirm: '' });
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>;
    if (!data) return <div className="text-muted text-center py-5">Erreur de chargement du profil.</div>;

    const { user, candidate } = data;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h5 className="fw-bold m-0 border-start border-4 border-warning ps-3">Mon profil</h5>
            </div>

            <div className="row">
                {/* Left Column: Profile Card */}
                <div className="col-lg-4 mb-4">
                    <div className="glass-panel p-4 text-center border-0 shadow-sm bg-white">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-lg" 
                             style={{width: 100, height: 100, background: '#FFBF00', color: 'white', fontSize: '2rem'}}>
                            <span className="fw-bold">{user?.name ? (user.name.split(' ').map(n => n[0]).join('').substring(0, 2)).toUpperCase() : 'KA'}</span>
                        </div>
                        <h5 className="fw-bold text-dark m-0">{user?.name}</h5>
                        <div className="text-muted small mb-4">Candidat · Permis {candidate.license_type}</div>
                        
                        <div className="text-start border-top border-light pt-4 mt-2 d-flex flex-column gap-3">
                            <div className="d-flex align-items-center small">
                                <Shield size={16} className="text-muted me-3" />
                                <div><span className="text-muted fw-bold">CIN:</span> <span className="text-dark fw-bold ms-1">{candidate.cin}</span></div>
                            </div>
                            <div className="d-flex align-items-center small">
                                <Calendar size={16} className="text-muted me-3" />
                                <div><span className="text-muted fw-bold">NAISSANCE:</span> <span className="text-dark fw-bold ms-1">12/05/2004</span></div>
                            </div>
                            <div className="d-flex align-items-center small">
                                <Phone size={16} className="text-muted me-3" />
                                <div><span className="text-muted fw-bold">TEL:</span> <span className="text-dark fw-bold ms-1">{candidate.phone}</span></div>
                            </div>
                            <div className="d-flex align-items-center small">
                                <Mail size={16} className="text-muted me-3" />
                                <div className="text-truncate" title={user?.email}><span className="text-muted fw-bold">EMAIL:</span> <span className="text-dark fw-bold ms-1">{user?.email}</span></div>
                            </div>
                            <div className="d-flex align-items-center small border-top pt-3 mt-1">
                                <CheckCircle size={16} className="text-success me-3" />
                                <div><span className="text-muted fw-bold">DOSSIER:</span> <span className="text-success fw-bold ms-1">COMPLET</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Training Info & Security */}
                <div className="col-lg-8">
                    <div className="glass-panel p-4 border-0 shadow-sm bg-white mb-4">
                        <h6 className="fw-bold mb-4 text-dark small uppercase" style={{letterSpacing: '0.5px'}}>Résumé formation</h6>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="small text-muted mb-1">Permis</div>
                                <div className="fw-bold text-dark mb-3">Permis {candidate.license_type}</div>
                                <div className="small text-muted mb-1">Moniteur</div>
                                <div className="fw-bold text-dark mb-3">{data.next_sessions[0]?.instructor?.user?.name || 'Assignation...'}</div>
                                <div className="small text-muted mb-1">Séances effectuées</div>
                                <div className="fw-bold text-dark">{data.stats.sessions_done} / 30</div>
                            </div>
                            <div className="col-md-6 border-start-md border-light">
                                <div className="small text-muted mb-1">Heures code</div>
                                <div className="fw-bold text-dark mb-3">{data.stats.code_hours}h / 20h</div>
                                <div className="small text-muted mb-1">Résultat examen code</div>
                                <div className="fw-bold text-success mb-3">Admis (10/04/2026)</div>
                                <div className="small text-muted mb-1">Prochain examen</div>
                                <div className="fw-bold text-dark">Conduite — 22/04/2026</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-4 border-0 shadow-sm bg-white">
                        <h6 className="fw-bold mb-4 text-dark d-flex align-items-center small uppercase" style={{letterSpacing: '0.5px'}}>
                            <Key size={16} className="me-2 text-muted" /> Changer le mot de passe
                        </h6>
                        <form onSubmit={handlePasswordChange}>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="small fw-bold text-muted mb-1">ACTUEL</label>
                                    <input type="password" width="4" className="form-control form-control-sm bg-light border-0" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="small fw-bold text-muted mb-1">NOUVEAU</label>
                                    <input type="password" width="4" className="form-control form-control-sm bg-light border-0" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="small fw-bold text-muted mb-1">CONFIRMER</label>
                                    <input type="password" width="4" className="form-control form-control-sm bg-light border-0" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end mt-3">
                                <button className="btn btn-warning px-4 fw-bold small rounded-pill py-2 shadow-sm text-white" type="submit">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .border-start-md { border-left: 1px solid #efefef; }
                @media (max-width: 768px) { .border-start-md { border-left: none; border-top: 1px solid #efefef; padding-top: 20px; } }
                .uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CandidateProfile;
