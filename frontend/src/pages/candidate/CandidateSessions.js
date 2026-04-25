import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, Clock, User, Car, Download, ChevronRight, CheckCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CandidateSessions = () => {
    const { t, i18n } = useTranslation();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/candidate/sessions').then(res => {
            setSessions(res.data.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleDownload = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("Mon Planning - Auto École Janoub", 14, 22);
        
        const tableColumn = ["Date & Heure", "Type de Séance", "Moniteur", "Statut"];
        const tableRows = [];

        // Combine upcoming and history, sorted by date
        const allSessions = [...upcoming, ...history].sort((a, b) => new Date(a.date) - new Date(b.date));

        allSessions.forEach(s => {
            const dateStr = new Date(s.date).toLocaleDateString('fr-FR');
            const timeStr = `${s.start_time?.substring(0, 5)} - ${s.end_time?.substring(0, 5)}`;
            const typeStr = s.session_type === 'driving' ? 'CONDUITE' : 'CODE';
            const instructorStr = s.instructor?.user?.name || '--';
            let statusStr = 'PRÉVU';
            if (s.status === 'completed') statusStr = 'TERMINÉ';
            if (s.status === 'cancelled') statusStr = 'ANNULÉ';

            tableRows.push([
                `${dateStr}  (${timeStr})`,
                typeStr,
                instructorStr,
                statusStr
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [243, 156, 18], textColor: [255, 255, 255] } // Match warning color theme
        });
        
        doc.save(`Mon_Planning_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning border-3" style={{width: '3rem', height: '3rem'}}></div></div>;

    const upcoming = sessions.filter(s => new Date(s.date) >= new Date().setHours(0,0,0,0));
    const history = sessions.filter(s => new Date(s.date) < new Date().setHours(0,0,0,0));

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

    const getStatusText = (status) => {
        switch(status) {
            case 'scheduled': return { text: t('status.scheduled'), color: 'primary', icon: Clock };
            case 'completed': return { text: t('status.completed'), color: 'success', icon: CheckCircle };
            case 'cancelled': return { text: t('status.cancelled'), color: 'danger', icon: null };
            default: return { text: status, color: 'secondary', icon: null };
        }
    };

    return (
        <div className="animate-fade-in container-fluid px-0" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h5 className={`fw-bold m-0 border-4 border-warning text-dark ${i18n.language === 'ar' ? 'border-end pe-3' : 'border-start ps-3'}`}>
                    {t('sessions.title')} <span className="text-muted fw-normal fs-6 ms-2">{t('sessions.subtitle')}</span>
                </h5>
                <button onClick={handleDownload} className="btn btn-warning btn-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow hover-scale transition-all fw-bold text-dark">
                    <Download size={18} /> {t('sessions.download')}
                </button>
            </div>

            <div className="row">
                {/* Upcoming Sessions Section */}
                <div className="col-12 mb-5">
                    <div className="bg-white p-4 p-md-5 rounded-5 shadow-sm border-0">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="fw-bold m-0 d-flex align-items-center">
                                <Calendar size={20} className={`${i18n.language === 'ar' ? 'ms-2' : 'me-2'} text-warning`} /> 
                                {t('sessions.upcoming')}
                            </h5>
                            <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill small">
                                {upcoming.length} {t('sessions.planned_count')}
                            </span>
                        </div>

                        <div className="row g-4">
                            {upcoming.length > 0 ? upcoming.map(s => (
                                <div key={s.id} className="col-md-6 col-lg-4">
                                    <div className="p-4 rounded-5 border border-light transition-all hover-up bg-light bg-opacity-50 position-relative overflow-hidden h-100">
                                        <div className="position-absolute" style={{ top: '-15px', right: '-15px', opacity: 0.03 }}>
                                            <Calendar size={120} />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-start mb-4 position-relative">
                                            <div className="bg-white px-3 py-2 rounded-4 shadow-sm text-center" style={{ minWidth: '60px' }}>
                                                <div className="fw-bold text-dark fs-5 leading-none">{new Date(s.date).getDate()}</div>
                                                <div className="text-muted uppercase fw-bold" style={{fontSize: '0.6rem'}}>{new Date(s.date).toLocaleDateString('fr-FR', { month: 'short' })}</div>
                                            </div>
                                            {(() => {
                                                const statusInfo = getStatusText(s.status);
                                                return (
                                                    <span className={`badge bg-${statusInfo.color} bg-opacity-10 text-${statusInfo.color} rounded-pill px-2 py-1 fw-bold`} style={{fontSize: '0.6rem'}}>
                                                        {statusInfo.text}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        
                                        <div className="d-flex flex-column gap-3 position-relative">
                                            <div className="d-flex align-items-center text-dark">
                                                <div className={`bg-warning bg-opacity-20 p-2 rounded-3 text-warning ${i18n.language === 'ar' ? 'ms-3' : 'me-3'}`}>
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold small">{s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)} <span className="text-muted ms-1">({formatDuration(s.start_time, s.end_time)})</span></div>
                                                    <div className="text-muted small" style={{fontSize: '0.65rem'}}>{t('sessions.training_time')}</div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center text-dark">
                                                <div className={`bg-primary bg-opacity-10 p-2 rounded-3 text-primary ${i18n.language === 'ar' ? 'ms-3' : 'me-3'}`}>
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold small">{s.instructor?.user?.name || '--'}</div>
                                                    <div className="text-muted small" style={{fontSize: '0.65rem'}}>{t('sessions.your_instructor')}</div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center text-dark">
                                                <div className={`bg-dark bg-opacity-5 p-2 rounded-3 text-dark ${i18n.language === 'ar' ? 'ms-3' : 'me-3'}`}>
                                                    <Car size={16} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold small">{s.vehicle?.brand} {s.vehicle?.model || '—'}</div>
                                                    <div className="text-info small" style={{fontSize: '0.65rem'}}>{t('sessions.assigned_vehicle')}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-top border-light d-flex justify-content-between align-items-center position-relative">
                                            <span className={`small fw-bold uppercase ${s.session_type === 'driving' ? 'text-primary' : 'text-orange'}`} style={{letterSpacing: '1px', fontSize: '0.6rem'}}>
                                                {s.session_type === 'driving' ? t('sessions.driving_session') : t('sessions.code_session')}
                                            </span>
                                            <ChevronRight size={16} className={`text-muted opacity-50 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-5 col-12 bg-light bg-opacity-50 rounded-5 border border-dashed">
                                    <div className="text-muted opacity-50 mb-2"><Calendar size={48} /></div>
                                    <p className="text-muted m-0 small">{t('sessions.no_upcoming')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="col-12 mb-4">
                    <div className="bg-white p-0 rounded-5 shadow-sm border-0 overflow-hidden">
                        <div className="p-4 p-md-5 border-bottom">
                            <h5 className="fw-bold m-0 text-dark d-flex align-items-center">
                                <FileText size={20} className={`${i18n.language === 'ar' ? 'ms-2' : 'me-2'} text-muted`} /> 
                                {t('sessions.history')}
                            </h5>
                        </div>
                        <div className="table-responsive px-4 px-md-5 pb-5 mt-4">
                            <table className="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr className="border-bottom-0">
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3" style={{letterSpacing: '1px'}}>{t('sessions.date_time')}</th>
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3 text-center" style={{letterSpacing: '1px'}}>{t('sessions.type')}</th>
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3" style={{letterSpacing: '1px'}}>{t('sessions.instructor')}</th>
                                        <th className={`border-0 text-muted fw-bold uppercase small pb-3 ${i18n.language === 'ar' ? 'text-start' : 'text-end'}`} style={{letterSpacing: '1px'}}>{t('sessions.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? history.map(s => (
                                        <tr key={s.id} className="border-bottom border-light">
                                            <td className="py-3">
                                                <div className="fw-bold text-dark small">{new Date(s.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : 'fr-FR')}</div>
                                                <div className="text-muted" style={{fontSize: '0.65rem'}}>
                                                    {s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)} ({formatDuration(s.start_time, s.end_time)})
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`badge rounded-pill px-3 py-2 ${s.session_type === 'driving' ? 'bg-primary' : 'bg-orange'} bg-opacity-10 ${s.session_type === 'driving' ? 'text-primary' : 'text-orange'} fw-bold`} style={{fontSize: '0.55rem'}}>
                                                    {s.session_type === 'driving' ? (i18n.language === 'ar' ? 'تطبيقي' : 'CONDUITE') : (i18n.language === 'ar' ? 'نظري' : 'CODE')}
                                                </span>
                                            </td>
                                            <td className="py-3 text-dark fw-bold small">{s.instructor?.user?.name || '—'}</td>
                                            <td className={`py-3 ${i18n.language === 'ar' ? 'text-start' : 'text-end'}`}>
                                                {(() => {
                                                    const statusInfo = getStatusText(s.status);
                                                    const StatusIcon = statusInfo.icon;
                                                    return (
                                                        <div className={`d-flex align-items-center ${i18n.language === 'ar' ? 'justify-content-start flex-row-reverse' : 'justify-content-end'} gap-2 text-${statusInfo.color}`}>
                                                            <span className="fw-bold" style={{fontSize: '0.65rem'}}>{statusInfo.text}</span>
                                                            {StatusIcon && <StatusIcon size={14} />}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted small">{t('sessions.no_history')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .leading-none { line-height: 1; }
                .text-orange { color: #f39c12; }
                .bg-orange { background-color: #f39c12; }
                .hover-scale:hover { transform: scale(1.02); }
                .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important; border-color: var(--warning-color) !important; }
                .uppercase { text-transform: uppercase; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                .custom-table tr:hover { background-color: #fafbfc; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CandidateSessions;
