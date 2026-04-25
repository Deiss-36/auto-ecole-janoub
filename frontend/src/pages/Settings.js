import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
    Settings as SettingsIcon, Save, MapPin, Phone, Mail, Building,
    Languages, Globe, DollarSign, Clock, Users, BookOpen, Car,
    FileText, Shield, Gavel, ChevronRight, Smartphone, Hash
} from 'lucide-react';

// ─── Reusable Field Components ──────────────────────────────────────────────

const FieldInput = ({ label, icon: Icon, value, onChange, type = 'text', placeholder = '', hint }) => (
    <div>
        <label className="small fw-bold text-muted mb-1 d-block text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '1px' }}>
            {label}
        </label>
        <div className="position-relative">
            {Icon && (
                <span className="position-absolute top-50 translate-middle-y ms-3" style={{ opacity: 0.35, zIndex: 1 }}>
                    <Icon size={16} />
                </span>
            )}
            <input
                type={type}
                className="form-control rounded-4 border-light bg-light bg-opacity-25"
                style={{ paddingLeft: Icon ? '2.4rem' : '0.75rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
        {hint && <small className="text-muted" style={{ fontSize: '0.65rem' }}>{hint}</small>}
    </div>
);

const NumericField = ({ label, value, onChange, suffix = '', min = 0, hint }) => (
    <div>
        <label className="small fw-bold text-muted mb-1 d-block text-uppercase" style={{ fontSize: '0.62rem', letterSpacing: '1px' }}>
            {label}
        </label>
        <div className="input-group">
            <input
                type="number"
                min={min}
                className="form-control fw-bold rounded-start-4 border-light bg-light bg-opacity-25"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            />
            {suffix && <span className="input-group-text border-light bg-white text-muted fw-bold rounded-end-4" style={{ fontSize: '0.72rem' }}>{suffix}</span>}
        </div>
        {hint && <small className="text-muted" style={{ fontSize: '0.65rem' }}>{hint}</small>}
    </div>
);

const SectionCard = ({ icon: Icon, iconColor, title, subtitle, children, accent }) => (
    <div className="bg-white rounded-5 shadow-sm border-0 mb-4 overflow-hidden">
        {/* Card header strip */}
        <div className="px-4 px-md-5 pt-4 pb-3 border-bottom border-light d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-4 p-2" style={{ background: `${iconColor}15`, color: iconColor, width: 42, height: 42 }}>
                <Icon size={20} />
            </div>
            <div>
                <h6 className="fw-bold m-0 text-dark">{title}</h6>
                {subtitle && <p className="text-muted m-0" style={{ fontSize: '0.7rem' }}>{subtitle}</p>}
            </div>
        </div>
        <div className="p-4 p-md-5">
            {children}
        </div>
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const Settings = () => {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/settings')
            .then(res => setSettings(res.data))
            .catch(() => toast.error("Erreur de chargement des paramètres"))
            .finally(() => setLoading(false));
    }, []);

    const get = (key) => settings.find(s => s.key === key)?.value ?? '';
    const set = (key, value) => setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/settings/update', { settings });
            toast.success("✅ Paramètres enregistrés avec succès !");
        } catch {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-warning border-3" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-muted mt-3 small">Chargement des paramètres...</p>
        </div>
    );

    const licenseInfo = {
        price_A:  { label: 'Permis A', sub: 'Moto / Scooter',          color: '#fd7e14', badge: 'A' },
        price_B:  { label: 'Permis B', sub: 'Voiture légère',           color: '#0d6efd', badge: 'B' },
        price_C:  { label: 'Permis C', sub: 'Poids lourd / Camion',     color: '#dc3545', badge: 'C' },
        price_D:  { label: 'Permis D', sub: 'Autocar / Transport',      color: '#6f42c1', badge: 'D' },
        price_EC: { label: 'Permis EC',sub: 'Semi-remorque',            color: '#198754', badge: 'EC' },
    };

    const pricingSettings = settings.filter(s => s.category === 'pricing');
    const langValue = get('system_language');

    return (
        <div className="animate-fade-in container-fluid px-0">

            {/* ── Page Header ── */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold mb-1 text-dark">{t('settings.title')}</h2>
                    <p className="text-muted m-0 small">{t('settings.subtitle')}</p>
                </div>
                <button className="btn btn-warning px-4 py-2 rounded-pill d-flex align-items-center shadow fw-bold" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <Save size={16} className="me-2" />}
                    {t('settings.save')}
                </button>
            </div>

            <div className="row g-4">

                {/* ══════════════ LEFT COLUMN ══════════════ */}
                <div className="col-xl-7">

                    {/* 1. Informations Générales */}
                    <SectionCard icon={Building} iconColor="#f59e0b" title="Informations de l'École" subtitle="Coordonnées affichées sur les reçus et documents">
                        <div className="row g-3">
                            <div className="col-12">
                                <FieldInput label="Nom de l'établissement" icon={Building} value={get('school_name')} onChange={v => set('school_name', v)} placeholder="Auto École Janoub" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="Téléphone principal" icon={Phone} value={get('school_phone')} onChange={v => set('school_phone', v)} type="tel" placeholder="06 XX XX XX XX" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="Téléphone secondaire" icon={Phone} value={get('school_phone2')} onChange={v => set('school_phone2', v)} type="tel" placeholder="(optionnel)" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="Email de contact" icon={Mail} value={get('school_email')} onChange={v => set('school_email', v)} type="email" placeholder="contact@ecole.ma" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="WhatsApp" icon={Smartphone} value={get('school_whatsapp')} onChange={v => set('school_whatsapp', v)} type="tel" placeholder="06 XX XX XX XX" />
                            </div>
                            <div className="col-md-8">
                                <FieldInput label="Adresse complète" icon={MapPin} value={get('school_address')} onChange={v => set('school_address', v)} placeholder="Rue, Quartier..." />
                            </div>
                            <div className="col-md-4">
                                <FieldInput label="Ville" icon={MapPin} value={get('school_city')} onChange={v => set('school_city', v)} placeholder="Safi" />
                            </div>
                            <div className="col-12">
                                <FieldInput label="Site Web" icon={Globe} value={get('school_website')} onChange={v => set('school_website', v)} placeholder="https://www.mon-ecole.ma" hint="Affiché dans le pied de page des documents imprimés." />
                            </div>
                        </div>
                    </SectionCard>

                    {/* 2. Identifiants Légaux */}
                    <SectionCard icon={Gavel} iconColor="#6f42c1" title="Identifiants Légaux" subtitle="Numéros officiels pour facturation et documents réglementaires">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <FieldInput label="ICE (Identifiant Commun)" icon={Hash} value={get('legal_ice')} onChange={v => set('legal_ice', v)} placeholder="000000000000000" hint="15 chiffres — identifiant fiscal commun" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="Identifiant Fiscal (IF)" icon={Hash} value={get('legal_if')} onChange={v => set('legal_if', v)} placeholder="Ex: 12345678" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="N° Patente" icon={FileText} value={get('legal_patente')} onChange={v => set('legal_patente', v)} placeholder="Ex: 12345678" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="Registre de Commerce (RC)" icon={FileText} value={get('legal_rc')} onChange={v => set('legal_rc', v)} placeholder="Ex: 12345" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="Nom du Directeur" icon={Shield} value={get('legal_director')} onChange={v => set('legal_director', v)} placeholder="Prénom Nom" />
                            </div>
                            <div className="col-md-6">
                                <FieldInput label="CIN du Directeur" icon={Shield} value={get('legal_cin_director')} onChange={v => set('legal_cin_director', v)} placeholder="Ex: AB123456" />
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-4 bg-primary bg-opacity-5 border border-primary border-opacity-10">
                            <p className="small mb-0 text-dark" style={{ lineHeight: '1.6' }}>
                                <Shield size={13} className="me-1 text-primary" />
                                <strong>Confidentialité :</strong> Ces informations sont utilisées uniquement sur les documents officiels générés par le système (reçus, attestations).
                            </p>
                        </div>
                    </SectionCard>

                    {/* 3. Configuration des Séances */}
                    <SectionCard icon={Clock} iconColor="#0d6efd" title="Configuration des Séances" subtitle="Durées, capacités et seuils requis pour les examens">
                        <div className="row g-3">
                            {/* Durées */}
                            <div className="col-12 mb-1">
                                <p className="text-muted fw-bold small mb-0 d-flex align-items-center" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                    <Clock size={13} className="me-2 text-primary" /> DURÉES DES SÉANCES
                                </p>
                            </div>
                            <div className="col-md-6">
                                <NumericField label="Durée séance conduite" value={get('session_duration_driving')} onChange={v => set('session_duration_driving', v)} suffix="min" hint="Durée standard d'une leçon de conduite" />
                            </div>
                            <div className="col-md-6">
                                <NumericField label="Durée séance code" value={get('session_duration_code')} onChange={v => set('session_duration_code', v)} suffix="min" hint="Durée standard d'une séance théorique" />
                            </div>

                            {/* Capacité */}
                            <div className="col-12 mt-2 mb-1">
                                <p className="text-muted fw-bold small mb-0 d-flex align-items-center" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                    <Users size={13} className="me-2 text-success" /> CAPACITÉ
                                </p>
                            </div>
                            <div className="col-md-6">
                                <NumericField label="Max candidats / groupe" value={get('session_max_candidates')} onChange={v => set('session_max_candidates', v)} suffix="élèves" hint="Nombre maximum par séance de groupe" />
                            </div>

                            {/* Prix séances */}
                            <div className="col-12 mt-2 mb-1">
                                <p className="text-muted fw-bold small mb-0 d-flex align-items-center" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                    <DollarSign size={13} className="me-2 text-warning" /> PRIX DES SÉANCES
                                </p>
                            </div>
                            <div className="col-md-6">
                                <NumericField label="Prix séance conduite" value={get('session_price_driving')} onChange={v => set('session_price_driving', v)} suffix="DH" />
                            </div>
                            <div className="col-md-6">
                                <NumericField label="Prix séance code" value={get('session_price_code')} onChange={v => set('session_price_code', v)} suffix="DH" />
                            </div>

                            {/* Seuils examen */}
                            <div className="col-12 mt-2 mb-1">
                                <p className="text-muted fw-bold small mb-0 d-flex align-items-center" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                    <BookOpen size={13} className="me-2 text-danger" /> SEUILS AVANT EXAMEN
                                </p>
                            </div>
                            <div className="col-md-4">
                                <NumericField label="Séances conduite requises" value={get('required_sessions_driving')} onChange={v => set('required_sessions_driving', v)} suffix="séances" hint="Avant de passer l'examen pratique" />
                            </div>
                            <div className="col-md-4">
                                <NumericField label="Séances code requises" value={get('required_sessions_code')} onChange={v => set('required_sessions_code', v)} suffix="séances" hint="Avant de passer l'examen théorique" />
                            </div>

                            {/* Frais examen */}
                            <div className="col-12 mt-2 mb-1">
                                <p className="text-muted fw-bold small mb-0 d-flex align-items-center" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                    <Car size={13} className="me-2 text-info" /> FRAIS D'EXAMEN
                                </p>
                            </div>
                            <div className="col-md-6">
                                <NumericField label="Frais examen théorique (code)" value={get('exam_fee_code')} onChange={v => set('exam_fee_code', v)} suffix="DH" />
                            </div>
                            <div className="col-md-6">
                                <NumericField label="Frais examen pratique (conduite)" value={get('exam_fee_driving')} onChange={v => set('exam_fee_driving', v)} suffix="DH" />
                            </div>
                        </div>
                    </SectionCard>

                    {/* 4. Langue */}
                    <SectionCard icon={Languages} iconColor="#0ea5e9" title="Préférences & Langue" subtitle="Langue par défaut pour tous les utilisateurs du système">
                        <div className="row g-3">
                            {[
                                { code: 'fr', label: 'Français', flag: '🇫🇷', desc: 'Interface entière en français' },
                                { code: 'ar', label: 'العربية',  flag: '🇲🇦', desc: 'الواجهة باللغة العربية' },
                            ].map(lang => (
                                <div className="col-sm-6" key={lang.code}>
                                    <div
                                        onClick={() => {
                                            set('system_language', lang.code);
                                            i18n.changeLanguage(lang.code);
                                        }}
                                        className={`p-3 rounded-4 d-flex align-items-center gap-3 transition-all ${langValue === lang.code ? 'border border-primary bg-primary bg-opacity-5 shadow-sm' : 'border border-light bg-light bg-opacity-25 opacity-65'}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="fs-3">{lang.flag}</span>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark small">{lang.label}</div>
                                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>{lang.desc}</div>
                                        </div>
                                        {langValue === lang.code && <div className="rounded-circle bg-primary flex-shrink-0" style={{ width: 10, height: 10 }}></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                </div>

                {/* ══════════════ RIGHT COLUMN ══════════════ */}
                <div className="col-xl-5">

                    {/* 5. Tarification par permis */}
                    <SectionCard icon={DollarSign} iconColor="#198754" title="Tarification par Permis" subtitle="Prix global appliqué à l'inscription selon le type de permis">
                        <div className="d-flex flex-column gap-3">
                            {pricingSettings.map(s => {
                                const info = licenseInfo[s.key] || {};
                                return (
                                    <div key={s.key} className="d-flex align-items-center gap-3 p-3 rounded-4 border border-light bg-light bg-opacity-25 transition-all hover-up-sm">
                                        <div className="d-flex align-items-center justify-content-center rounded-3 fw-bolder text-white flex-shrink-0"
                                             style={{ width: 46, height: 46, background: info.color || '#6c757d', fontSize: '0.95rem' }}>
                                            {info.badge || s.key.replace('price_', '')}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark small">{info.label || s.label}</div>
                                            <div className="text-muted" style={{ fontSize: '0.67rem' }}>{info.sub}</div>
                                        </div>
                                        <div className="input-group" style={{ maxWidth: '130px' }}>
                                            <input type="number" min="0"
                                                className="form-control form-control-sm fw-bold text-center border-light bg-white"
                                                style={{ borderRadius: '8px 0 0 8px' }}
                                                value={s.value || ''}
                                                onChange={e => set(s.key, e.target.value)}
                                            />
                                            <span className="input-group-text border-light bg-white text-muted fw-bold" style={{ fontSize: '0.7rem', borderRadius: '0 8px 8px 0' }}>DH</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 p-3 rounded-4 bg-success bg-opacity-5 border border-success border-opacity-15">
                            <p className="small mb-0 text-dark" style={{ lineHeight: '1.6' }}>
                                <ChevronRight size={13} className="me-1 text-success" />
                                Ces montants sont pré-remplis automatiquement lors de l'inscription d'un candidat. Ajustable individuellement.
                            </p>
                        </div>
                    </SectionCard>

                    {/* 6. Version / About */}
                    <div className="bg-white rounded-5 shadow-sm border-0 p-4 p-md-5 text-center">
                        <div className="d-flex align-items-center justify-content-center mb-4">
                            <div className="rounded-4 bg-dark d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                                <span className="fw-bolder text-white" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>JB</span>
                            </div>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Auto École Janoub</h6>
                        <p className="text-muted small mb-0">Système de gestion numérique</p>
                        <div className="my-3 border-top border-light"></div>
                        <div className="d-flex justify-content-center gap-4 text-muted small">
                            <div className="text-center">
                                <div className="fw-bold text-dark">v2.0.26</div>
                                <div style={{ fontSize: '0.65rem' }}>VERSION</div>
                            </div>
                            <div className="text-center">
                                <div className="fw-bold text-dark">2026</div>
                                <div style={{ fontSize: '0.65rem' }}>ANNÉE</div>
                            </div>
                            <div className="text-center">
                                <div className="fw-bold text-dark">Laravel 11</div>
                                <div style={{ fontSize: '0.65rem' }}>BACKEND</div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-4 bg-light border border-light text-start">
                            <div className="d-flex justify-content-between small mb-2">
                                <span className="text-muted">Base de données</span>
                                <span className="fw-bold text-success d-flex align-items-center gap-1">
                                    <span className="rounded-circle bg-success d-inline-block" style={{ width: 7, height: 7 }}></span> Connectée
                                </span>
                            </div>
                            <div className="d-flex justify-content-between small mb-2">
                                <span className="text-muted">API Backend</span>
                                <span className="fw-bold text-success d-flex align-items-center gap-1">
                                    <span className="rounded-circle bg-success d-inline-block" style={{ width: 7, height: 7 }}></span> Opérationnel
                                </span>
                            </div>
                            <div className="d-flex justify-content-between small">
                                <span className="text-muted">Serveur</span>
                                <span className="fw-bold text-primary">localhost:8000</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                .hover-up-sm:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important; }
                .opacity-65 { opacity: 0.65; }
                .transition-all { transition: all 0.2s ease; }
                .animate-fade-in { animation: fadeIn 0.45s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Settings;
