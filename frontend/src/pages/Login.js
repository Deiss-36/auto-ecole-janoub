import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Lock, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email.trim(), password.trim());
            toast.success('Bienvenue dans votre espace !');
            navigate('/'); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column flex-lg-row min-vh-100 overflow-hidden">
            {/* 🎨 Colonne Gauche — Branding */}
            <div className="col-lg-5 d-none d-lg-flex flex-column text-white p-5 position-relative" 
                 style={{ 
                    backgroundColor: '#1a1a1a',
                    backgroundImage: 'linear-gradient(45deg, #FFD70008 25%, transparent 25%, transparent 50%, #FFD70008 50%, #FFD70008 75%, transparent 75%, transparent)',
                    backgroundSize: '40px 40px'
                 }}>
                
                <div className="mt-auto mb-auto text-center animate-fade-in">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 border border-4 border-warning shadow-lg" 
                         style={{ width: 120, height: 120, background: 'var(--primary-color)' }}>
                        <div className="text-dark fw-bold text-center" style={{ lineHeight: 1.1, fontSize: '0.9rem' }}>
                            AUTO ÉCOLE<br/>JANOUB
                        </div>
                    </div>
                    <h2 className="fw-bold mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '2px' }}>Auto École Janoub</h2>
                    <p className="opacity-50 fs-5 mb-5" style={{ fontFamily: 'Cairo' }}>سيارة تعليم الجنوب</p>

                    <div className="text-start d-inline-block">
                        <div className="d-flex align-items-center mb-4 transition-all hover-translate-x">
                            <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3 border border-warning border-opacity-10"><MapPin size={20} className="text-warning" /></div>
                            <div>
                                <small className="d-block opacity-50 fw-bold uppercase" style={{fontSize: '0.65rem'}}>ADRESSE</small>
                                <span className="fw-bold">Marrakech, Maroc</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center mb-4 transition-all hover-translate-x">
                            <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3 border border-warning border-opacity-10"><Phone size={20} className="text-warning" /></div>
                            <div>
                                <small className="d-block opacity-50 fw-bold uppercase" style={{fontSize: '0.65rem'}}>TÉLÉPHONE</small>
                                <span className="fw-bold">0699 454 621 · 0660 606 536</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center transition-all hover-translate-x">
                            <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3 border border-warning border-opacity-10"><Clock size={20} className="text-warning" /></div>
                            <div>
                                <small className="d-block opacity-50 fw-bold uppercase" style={{fontSize: '0.65rem'}}>HORAIRES</small>
                                <span className="fw-bold">Lun – Sam : 8h – 20h</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto d-flex gap-2 justify-content-center">
                    {['Permis A', 'Permis B', 'Permis C'].map(p => (
                        <span key={p} className="badge border border-warning text-warning bg-warning bg-opacity-10 py-2 px-3 rounded-pill fw-bold shadow-sm" style={{fontSize: '0.7rem'}}>
                            {p}
                        </span>
                    ))}
                </div>
            </div>

            {/* 📝 Colonne Droite — Formulaire */}
            <div className="col-lg-7 d-flex align-items-center justify-content-center bg-white p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-100 py-5" 
                    style={{ maxWidth: '380px' }}
                >
                    <div className="mb-5 text-center">
                        <h3 className="fw-bold text-dark m-0 mb-2" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>Plateforme Janoub</h3>
                        <p className="text-muted small">Accédez à votre espace de gestion sécurisé</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="mb-4">
                            <label className="small fw-bold text-muted mb-2 uppercase" style={{letterSpacing: '0.5px'}}>Email Professionnel</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 translate-middle-y ms-3">
                                    <Mail size={18} className="text-muted" />
                                </span>
                                <input 
                                    type="email" 
                                    className="form-control ps-5 border-light-subtle rounded-4 shadow-sm" 
                                    placeholder="nom@janoub.ma"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ fontSize: '15px', height: '54px' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="small fw-bold text-muted uppercase" style={{letterSpacing: '0.5px'}}>Mot de passe</label>
                                <button type="button" className="btn btn-link p-0 text-decoration-none extra-small text-muted fw-bold hover-primary">
                                    Oublié ?
                                </button>
                            </div>
                            <div className="position-relative">
                                <span className="position-absolute top-50 translate-middle-y ms-3">
                                    <Lock size={18} className="text-muted" />
                                </span>
                                <input 
                                    type="password" 
                                    className="form-control ps-5 border-light-subtle rounded-4 shadow-sm" 
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ fontSize: '15px', height: '54px' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4 d-flex align-items-center">
                            <div className="form-check custom-checkbox">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="remember" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label small text-muted ms-1 pointer" htmlFor="remember">
                                    Se souvenir de moi
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary-custom w-100 py-3 fw-bold rounded-4 shadow-lg transition-all"
                            style={{ height: '56px', fontSize: '1rem' }}
                        >
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'SE CONNECTER'}
                        </button>
                    </form>

                    <div className="text-center pt-3 border-top border-light-subtle">
                        <p className="small text-muted mb-0">Nouveau candidat ?</p>
                        <Link to="/register" className="btn btn-link text-warning fw-bold p-0 text-decoration-none small">
                            Créer mon compte
                        </Link>
                    </div>

                    <div className="mt-5 text-center opacity-50">
                        <p className="text-muted mb-0" style={{fontSize: '11px', letterSpacing: '1px'}}>
                            © 2026 AUTO ÉCOLE JANOUB · SYSTÈME DE GESTION V2.0
                        </p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .form-control:focus {
                    border-color: var(--primary-color) !important;
                    box-shadow: 0 0 0 4px #FFD70015 !important;
                }
                .extra-small { font-size: 12px; }
                .hover-primary:hover { color: var(--primary-color) !important; }
                .uppercase { text-transform: uppercase; letter-spacing: 0.8px; }
                .pointer { cursor: pointer; }
                .btn-primary-custom:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255, 215, 0, 0.2) !important; }
                .hover-translate-x:hover { transform: translateX(5px); }
                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .custom-checkbox .form-check-input:checked {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                }
                .custom-checkbox .form-check-input:focus {
                    box-shadow: 0 0 0 4px #FFD70015;
                    border-color: var(--primary-color);
                }
            `}</style>
        </div>
    );
};

export default Login;
