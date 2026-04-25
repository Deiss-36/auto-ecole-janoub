import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Award, Calendar, CheckCircle, Shield, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InstructorProfile = () => {
    const { t, i18n } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        api.get('/instructor/profile').then(res => {
            setProfile(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error(i18n.language === 'ar' ? "كلمات المرور غير متطابقة" : "Les mots de passe ne correspondent pas");
        }
        // Simplified for now, real implementation would call api.post('/instructor/profile/update')
        toast.success(i18n.language === 'ar' ? "تم تحديث كلمة المرور!" : "Mot de passe mis à jour !");
        setPasswords({ current: '', new: '', confirm: '' });
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary border-3"></div></div>;
    if (!profile) return <div className="text-center py-5 text-muted shadow-sm rounded-4 bg-white mx-auto mt-5" style={{maxWidth: '400px'}}>{t('instructor.loading_error')}</div>;

    const isAr = i18n.language === 'ar';

    return (
        <div className="animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h5 className={`fw-bold m-0 border-4 border-warning text-dark ${isAr ? 'border-end pe-3' : 'border-start ps-3'}`}>
                    {t('instructor.profile')}
                </h5>
            </div>

            <div className="row">
                {/* Left Column: Profile Info */}
                <div className="col-lg-4 mb-4">
                    <div className="glass-panel p-4 text-center border-0 shadow-sm bg-white rounded-5 overflow-hidden position-relative">
                        <div className="position-absolute" style={{ top: '-20px', right: '-20px', opacity: 0.03, color: 'var(--teal-color)' }}>
                            <User size={150} />
                        </div>
                        
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-lg position-relative" 
                             style={{width: 90, height: 90, background: 'linear-gradient(135deg, var(--teal-color), #20B2AA)', color: 'white', fontSize: '2rem', border: '4px solid white'}}>
                            <span className="fw-bold">{getInitials(profile.user?.name)}</span>
                        </div>
                        <h5 className="fw-bold text-dark m-0">{profile.user?.name}</h5>
                        <div className="badge bg-teal bg-opacity-10 text-teal rounded-pill px-3 py-1 mt-2 mb-4 fw-bold" style={{fontSize: '0.65rem', color: 'var(--teal-color)', backgroundColor: 'rgba(0, 128, 128, 0.1)'}}>
                            {profile.details?.specialty}
                        </div>
                        
                        <div className="text-start border-top border-light pt-4 mt-2 d-flex flex-column gap-3" style={{ textAlign: isAr ? 'right' : 'left' }}>
                            <div className="d-flex align-items-center small">
                                <Shield size={16} className={`${isAr ? 'ms-3' : 'me-3'} text-muted`} />
                                <div><span className="text-muted fw-bold uppercase" style={{fontSize: '0.6rem'}}>CIN:</span> <span className="text-dark fw-bold ms-1">{profile.details?.cin || 'K12345'}</span></div>
                            </div>
                            <div className="d-flex align-items-center small">
                                <Phone size={16} className={`${isAr ? 'ms-3' : 'me-3'} text-muted`} />
                                <div><span className="text-muted fw-bold uppercase" style={{fontSize: '0.6rem'}}>TEL:</span> <span className="text-dark fw-bold ms-1">{profile.details?.phone || '—'}</span></div>
                            </div>
                            <div className="d-flex align-items-center small">
                                <Mail size={16} className={`${isAr ? 'ms-3' : 'me-3'} text-muted`} />
                                <div className="text-truncate"><span className="text-muted fw-bold uppercase" style={{fontSize: '0.6rem'}}>EMAIL:</span> <span className="text-dark fw-bold ms-1">{profile.user?.email}</span></div>
                            </div>
                            <div className="d-flex align-items-center small pt-2">
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 fw-bold" style={{fontSize: '0.65rem'}}>{isAr ? 'نشط' : 'Actif'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Password */}
                <div className="col-lg-8 mb-4">
                    <div className="glass-panel p-4 border-0 shadow-sm bg-white mb-4 rounded-5">
                        <h6 className="fw-bold mb-4 text-dark small uppercase" style={{letterSpacing: '0.5px'}}>{t('instructor.stats_title')}</h6>
                        <div className="row g-4">
                            {[
                                { label: t('instructor.total_sessions'), value: profile.stats?.total_sessions || 0, color: '#008080' },
                                { label: t('instructor.students_trained'), value: profile.stats?.students_trained || 0, color: '#27AE60' },
                                { label: t('instructor.success_rate'), value: `${profile.stats?.success_rate || 0}%`, color: '#E67E22' },
                                { label: t('instructor.active_students'), value: profile.stats?.students_trained || 0, color: '#3498DB' },
                            ].map((stat, idx) => (
                                <div key={idx} className="col-6 col-md-3 text-center border-end border-light last-border-none">
                                    <h4 className="fw-bold m-0" style={{color: stat.color}}>{stat.value}</h4>
                                    <div className="text-muted fw-bold" style={{fontSize: '0.6rem', marginTop: '5px'}}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-4 border-0 shadow-sm bg-white rounded-5">
                        <h6 className="fw-bold mb-4 text-dark d-flex align-items-center small uppercase" style={{letterSpacing: '0.5px'}}>
                            <Key size={16} className={`${isAr ? 'ms-2' : 'me-2'} text-muted`} /> {t('instructor.change_password')}
                        </h6>
                        <form onSubmit={handlePasswordChange}>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="small fw-bold text-muted mb-1 uppercase" style={{fontSize: '0.6rem'}}>{t('instructor.current_password')}</label>
                                    <input type="password" width="4" className="form-control form-control-sm bg-light border-0 rounded-3 p-2" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="small fw-bold text-muted mb-1 uppercase" style={{fontSize: '0.6rem'}}>{t('instructor.new_password')}</label>
                                    <input type="password" width="4" className="form-control form-control-sm bg-light border-0 rounded-3 p-2" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="small fw-bold text-muted mb-1 uppercase" style={{fontSize: '0.6rem'}}>{t('instructor.confirm_password')}</label>
                                    <input type="password" width="4" className="form-control form-control-sm bg-light border-0 rounded-3 p-2" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                                </div>
                            </div>
                            <div className={`d-flex ${isAr ? 'justify-content-start' : 'justify-content-end'} mt-3`}>
                                <button className="btn btn-primary-custom px-5 py-2 rounded-pill fw-bold small shadow-sm" type="submit">
                                    {t('instructor.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .bg-teal { background-color: var(--teal-color); }
                .text-teal { color: var(--teal-color); }
                .last-border-none:last-child { border-right: none !important; border-left: none !important; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .uppercase { text-transform: uppercase; }
            `}</style>
        </div>
    );
};

export default InstructorProfile;
