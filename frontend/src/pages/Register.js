import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Lock, Mail, User, Phone, MapPin, CreditCard, Car, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        cin: '',
        address: '',
        license_type: 'B'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Compte créé avec succès ! Veuillez vous connecter.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex min-vh-100 overflow-hidden bg-white">
            <div className="container-fluid d-flex justify-content-center align-items-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-100" 
                    style={{ maxWidth: '600px' }}
                >
                    <div className="mb-4 text-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 border border-4 border-warning shadow-sm" 
                             style={{ width: 80, height: 80, background: 'var(--primary-color)' }}>
                            <div className="text-dark fw-bold text-center" style={{ lineHeight: 1.1, fontSize: '0.7rem' }}>
                                AUTO ÉCOLE<br/>JANOUB
                            </div>
                        </div>
                        <h3 className="fw-bold text-dark m-0 mb-2">Inscription Candidat</h3>
                        <p className="text-muted small">Créez votre espace personnel pour suivre votre formation</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-light p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle">
                        
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="small fw-bold text-muted mb-2 uppercase">Nom Complet *</label>
                                <div className="position-relative">
                                    <span className="position-absolute top-50 translate-middle-y ms-3">
                                        <User size={18} className="text-muted" />
                                    </span>
                                    <input type="text" name="name" className="form-control ps-5 rounded-3" value={formData.name} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="small fw-bold text-muted mb-2 uppercase">Email *</label>
                                <div className="position-relative">
                                    <span className="position-absolute top-50 translate-middle-y ms-3">
                                        <Mail size={18} className="text-muted" />
                                    </span>
                                    <input type="email" name="email" className="form-control ps-5 rounded-3" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="small fw-bold text-muted mb-2 uppercase">Mot de passe *</label>
                                <div className="position-relative">
                                    <span className="position-absolute top-50 translate-middle-y ms-3">
                                        <Lock size={18} className="text-muted" />
                                    </span>
                                    <input type="password" name="password" className="form-control ps-5 rounded-3" value={formData.password} onChange={handleChange} minLength="8" required />
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="small fw-bold text-muted mb-2 uppercase">Confirmer Mot de passe *</label>
                                <div className="position-relative">
                                    <span className="position-absolute top-50 translate-middle-y ms-3">
                                        <Lock size={18} className="text-muted" />
                                    </span>
                                    <input type="password" name="password_confirmation" className="form-control ps-5 rounded-3" value={formData.password_confirmation} onChange={handleChange} minLength="8" required />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="small fw-bold text-muted mb-2 uppercase">Téléphone</label>
                                <div className="position-relative">
                                    <span className="position-absolute top-50 translate-middle-y ms-3">
                                        <Phone size={18} className="text-muted" />
                                    </span>
                                    <input type="tel" name="phone" className="form-control ps-5 rounded-3" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="small fw-bold text-muted mb-2 uppercase">CIN</label>
                                <div className="position-relative">
                                    <span className="position-absolute top-50 translate-middle-y ms-3">
                                        <CreditCard size={18} className="text-muted" />
                                    </span>
                                    <input type="text" name="cin" className="form-control ps-5 rounded-3" value={formData.cin} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="small fw-bold text-muted mb-2 uppercase">Adresse</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 translate-middle-y ms-3">
                                    <MapPin size={18} className="text-muted" />
                                </span>
                                <input type="text" name="address" className="form-control ps-5 rounded-3" value={formData.address} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="small fw-bold text-muted mb-2 uppercase">Type de Permis *</label>
                            <div className="position-relative">
                                <span className="position-absolute top-50 translate-middle-y ms-3">
                                    <Car size={18} className="text-muted" />
                                </span>
                                <select name="license_type" className="form-select ps-5 rounded-3" value={formData.license_type} onChange={handleChange} required>
                                    <option value="A">Permis A (Moto)</option>
                                    <option value="B">Permis B (Voiture)</option>
                                    <option value="C">Permis C (Camion)</option>
                                    <option value="D">Permis D (Autocar)</option>
                                    <option value="E">Permis E (Remorque)</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary-custom w-100 py-3 fw-bold rounded-4 shadow-sm"
                        >
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'CRÉER MON COMPTE'}
                        </button>

                    </form>
                    
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-muted text-decoration-none small fw-bold d-inline-flex align-items-center">
                            <ArrowLeft size={16} className="me-2" />
                            Retour à la connexion
                        </Link>
                    </div>

                </motion.div>
            </div>
            <style>{`
                .form-control:focus, .form-select:focus {
                    border-color: var(--primary-color) !important;
                    box-shadow: 0 0 0 4px #FFD70015 !important;
                }
                .uppercase { text-transform: uppercase; letter-spacing: 0.8px; font-size: 0.7rem; }
            `}</style>
        </div>
    );
};

export default Register;
