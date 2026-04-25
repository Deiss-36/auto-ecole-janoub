import React, { useState } from 'react';
import { Video, FileText, ExternalLink, Download, Play, BookOpen, GraduationCap, ChevronRight, Search, Filter, Star, Info, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ResourceCard = ({ icon: Icon, title, description, action, onAction, color, tag, duration }) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    
    return (
        <div className="glass-panel h-100 transition-all hover-up bg-white border-0 shadow-sm rounded-5 overflow-hidden d-flex flex-column">
            <div className={`p-4 bg-${color} bg-opacity-10 d-flex justify-content-between align-items-start`}>
                <div className={`p-3 rounded-4 bg-white shadow-sm text-${color}`}>
                    <Icon size={24} />
                </div>
                {tag && (
                    <span className="badge bg-white text-dark rounded-pill px-3 py-1 fw-bold shadow-sm" style={{fontSize: '0.65rem'}}>
                        {tag}
                    </span>
                )}
            </div>
            <div className="p-4 flex-grow-1 d-flex flex-column">
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>{title}</h6>
                <p className="text-muted small mb-4 flex-grow-1" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>{description}</p>
                
                <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light">
                    {duration && <span className="text-muted small fw-medium" style={{fontSize: '0.7rem'}}><Star size={12} className="me-1 text-warning" /> {duration}</span>}
                    <button 
                        onClick={onAction}
                        className={`btn btn-${color} btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 border-0`}
                        style={{ fontSize: '0.75rem', padding: '8px 20px' }}
                    >
                        {action} {isAr ? <ChevronRight size={14} className="rotate-180" /> : <ChevronRight size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CandidateResources = () => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const isAr = i18n.language === 'ar';

    const videoList = [
        { id: 1, title: isAr ? 'شرح علامات التشوير الطرقي' : 'Les Panneaux de Signalisation', desc: isAr ? 'شرح مفصل لجميع أنواع العلامات: الخطر، المنع، الإجبار والإرشاد.' : 'Explications détaillées de tous les signaux: danger, interdiction, obligation et indication.', color: 'danger', icon: Video, tag: 'CODE', duration: '15 min', url: 'https://www.youtube.com/results?search_query=panneaux+signalisation+maroc' },
        { id: 2, title: isAr ? 'قواعد الأسبقية في الملتقيات' : 'Priorités aux Intersections', desc: isAr ? 'متى يجب إعطاء الأسبقية؟ شرح قاعدة اليمين واليسار والمدارات.' : 'Quand céder le passage ? Règles de la main droite, stops et ronds-points.', color: 'danger', icon: Video, tag: 'CODE', duration: '12 min', url: 'https://www.youtube.com/results?search_query=priorités+intersections+maroc' },
        { id: 3, title: isAr ? 'كيفية ركن السيارة (الكرينو)' : 'Maîtriser le Créneau', desc: isAr ? 'خطوات عملية وبسيطة لضبط ركن السيارة في الامتحان التطبيقي.' : 'Étapes pratiques pour réussir votre stationnement le jour de l\'examen.', color: 'danger', icon: Video, tag: 'CONDUITE', duration: '10 min', url: 'https://www.youtube.com/results?search_query=creneau+maroc+permis' }
    ];

    const docList = [
        { id: 1, title: isAr ? 'دليل قانون السير المغربي 2026' : 'Code de la Route Maroc 2026', desc: isAr ? 'المرجع الشامل لكل القواعد الجديدة والغرامات والمخالفات.' : 'Le guide officiel complet incluant les nouvelles amendes et infractions.', color: 'primary', icon: FileText, tag: 'PDF', duration: '4.5 MB' },
        { id: 2, title: isAr ? 'ملخص ميكانيك السيارة' : 'Mécanique de base (Examen)', desc: isAr ? 'الأسئلة الشائعة حول المحرك، العجلات، والزيوت التي تطرح في الامتحان.' : 'Les questions fréquentes sur le moteur, les pneus et les voyants.', color: 'primary', icon: FileText, tag: 'PDF', duration: '2.1 MB' },
        { id: 3, title: isAr ? 'المسافات: الوقوف، الأمان ورد الفعل' : 'Calcul des Distances', desc: isAr ? 'طريقة سهلة لحساب مسافات الأمان والتوقف حسب السرعة.' : 'Méthodes simples pour calculer les distances selon la vitesse.', color: 'primary', icon: FileText, tag: 'PDF', duration: '1.8 MB' }
    ];

    const examList = [
        { id: 1, title: isAr ? 'سلسلة الامتحان التجريبي رقم 1' : 'Série Examen Blanc #1', desc: isAr ? '40 سؤالاً في 40 دقيقة. نفس ظروف الامتحان الحقيقي.' : '40 questions en 40 minutes. Conditions réelles d\'examen.', color: 'success', icon: GraduationCap, tag: 'EXAM', duration: '40 min' },
        { id: 2, title: isAr ? 'اختبار علامات المنع والارشاد' : 'Test Signaux Spécifique', desc: isAr ? 'اختبار مركز على فهم العلامات الطرقية الصعبة.' : 'Test concentré sur la compréhension des signaux complexes.', color: 'success', icon: GraduationCap, tag: 'EXAM', duration: '20 min' }
    ];

    const filteredVideos = videoList.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDocs = docList.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Premium Header */}
            <div className="mb-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4 mb-4">
                    <div>
                        <h2 className="fw-bold text-dark mb-2">{t('resources.title')}</h2>
                        <p className="text-muted m-0">{t('resources.subtitle')}</p>
                    </div>
                    
                    <div className="d-flex gap-2">
                        <div className="position-relative shadow-sm rounded-pill overflow-hidden border border-light" style={{ width: '250px' }}>
                            <Search size={16} className={`position-absolute top-50 translate-middle-y text-muted ${isAr ? 'end-0 me-3' : 'start-0 ms-3'}`} />
                            <input 
                                type="text" 
                                className={`form-control form-control-sm border-0 bg-white py-2 ${isAr ? 'pe-5' : 'ps-5'}`}
                                placeholder={isAr ? "بحث..." : "Rechercher..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontSize: '0.8rem' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-2 rounded-pill shadow-sm d-inline-flex gap-2 border border-light">
                    {[
                        { id: 'all', label: isAr ? 'الكل' : 'Tout', icon: Activity },
                        { id: 'videos', label: t('resources.videos'), icon: Video },
                        { id: 'docs', label: t('resources.documents'), icon: FileText },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn btn-sm rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${activeTab === tab.id ? 'btn-warning text-dark shadow-sm' : 'btn-white text-muted border-0'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            {(activeTab === 'all' || activeTab === 'videos') && filteredVideos.length > 0 && (
                <div className="mb-5 pb-2">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h5 className="fw-bold m-0 d-flex align-items-center gap-3">
                            <span className="p-2 bg-danger bg-opacity-10 text-danger rounded-3"><Video size={20} /></span>
                            {t('resources.videos')}
                        </h5>
                    </div>
                    <div className="row g-4">
                        {filteredVideos.map(v => (
                            <div key={v.id} className="col-md-6 col-lg-4">
                                <ResourceCard 
                                    {...v} 
                                    action={t('resources.watch')} 
                                    onAction={() => window.open(v.url, '_blank')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(activeTab === 'all' || activeTab === 'docs') && filteredDocs.length > 0 && (
                <div className="mb-5 pb-2">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h5 className="fw-bold m-0 d-flex align-items-center gap-3">
                            <span className="p-2 bg-primary bg-opacity-10 text-primary rounded-3"><FileText size={20} /></span>
                            {t('resources.documents')}
                        </h5>
                    </div>
                    <div className="row g-4">
                        {filteredDocs.map(d => (
                            <div key={d.id} className="col-md-6 col-lg-4">
                                <ResourceCard 
                                    {...d} 
                                    action={t('resources.download')} 
                                    onAction={() => alert(isAr ? 'بدء التحميل...' : 'Le téléchargement du PDF va commencer...')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(activeTab === 'all') && (
                <div className="mb-5">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h5 className="fw-bold m-0 d-flex align-items-center gap-3">
                            <span className="p-2 bg-success bg-opacity-10 text-success rounded-3"><GraduationCap size={20} /></span>
                            {t('resources.exams')}
                        </h5>
                    </div>
                    <div className="row g-4">
                        {examList.map(e => (
                            <div key={e.id} className="col-md-6 col-lg-4">
                                <ResourceCard 
                                    {...e} 
                                    action={t('resources.start')} 
                                    onAction={() => alert(isAr ? 'جاري فتح صفحة الامتحان...' : 'Démarrage de l\'examen blanc...')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Section */}
            <div className="bg-warning bg-opacity-10 p-4 rounded-5 border border-warning border-opacity-25 mt-5">
                <div className="d-flex align-items-center gap-3 text-warning mb-2">
                    <Info size={20} />
                    <h6 className="fw-bold m-0">{isAr ? 'نصيحة للمراجعة' : 'Conseil de révision'}</h6>
                </div>
                <p className="text-muted small m-0 ps-4 ms-2">
                    {isAr 
                        ? 'ننصحك بمشاهدة الفيديوهات أولاً لفهم القواعد بشكل مرئي، ثم تحميل ملفات الـ PDF للمراجعة المركزة قبل البدء في الامتحانات التجريبية.'
                        : 'Nous vous conseillons de regarder les vidéos d\'abord pour comprendre les règles visuellement, puis de télécharger les PDF pour une révision concentrée avant de commencer les examens blancs.'}
                </p>
            </div>

            <style jsx="true">{`
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
                .rotate-180 { transform: rotate(180deg); }
                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .uppercase { text-transform: uppercase; }
                .btn-white { background: white; }
            `}</style>
        </div>
    );
};

export default CandidateResources;
