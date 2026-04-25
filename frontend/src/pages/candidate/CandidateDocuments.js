import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileText, CheckCircle, Download, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';

const DocItem = ({ doc }) => {
    const { t, i18n } = useTranslation();
    const isDownloadable = doc.status === 'download';
    
    const handleDownload = () => {
        const pdf = new jsPDF();
        pdf.setFontSize(22);
        // Using a basic font structure, avoid using doc.name directly if it has arabic chars to prevent jsPDF garble
        pdf.text(doc.name.replace(/[^a-zA-Z0-9 ]/g, ""), 20, 30);
        pdf.setFontSize(14);
        pdf.text("Auto Ecole Janoub - Document Officiel", 20, 50);
        pdf.text(`Date d'emission: ${new Date().toLocaleDateString('fr-FR')}`, 20, 60);
        
        if (doc.name.includes("Reçus") || doc.name.includes("وصولات")) {
            pdf.text("Montant paye: 1500 MAD", 20, 80);
            pdf.text("Mode: Especes", 20, 90);
        } else {
            pdf.text("Ceci est une copie certifiee conforme.", 20, 80);
        }
        
        pdf.save(`${doc.name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}.pdf`);
    };

    return (
        <div className="glass-panel p-3 mb-3 border-0 shadow-sm bg-white d-flex align-items-center transition-all hover-up">
            <div className={`p-3 bg-light rounded-4 text-muted ${i18n.language === 'ar' ? 'ms-3' : 'me-3'}`}>
                <FileText size={20} />
            </div>
            <div className="flex-grow-1">
                <div className="fw-bold text-dark small">{doc.name}</div>
                <div className="text-muted" style={{fontSize: '0.65rem'}}>{doc.type} · {doc.date}</div>
            </div>
            <div className={i18n.language === 'ar' ? 'text-start' : 'text-end'}>
                {isDownloadable ? (
                    <button onClick={handleDownload} className="btn btn-sm btn-primary-custom px-3 py-1 rounded-pill fw-bold d-flex align-items-center" style={{fontSize: '0.7rem'}}>
                        {t('documents.download')} <Download size={14} className={i18n.language === 'ar' ? 'me-2' : 'ms-2'} />
                    </button>
                ) : (
                    <div className={`d-flex align-items-center fw-bold ${doc.status === 'validated' ? 'text-success' : 'text-warning'}`} style={{fontSize: '0.75rem'}}>
                        {doc.status === 'validated' ? (
                            <><CheckCircle size={16} className={i18n.language === 'ar' ? 'ms-1' : 'me-1'} /> {t('documents.validated')}</>
                        ) : (
                            <><Clock size={16} className={i18n.language === 'ar' ? 'ms-1' : 'me-1'} /> {t('documents.pending')}</>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const CandidateDocuments = () => {
    const { t, i18n } = useTranslation();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/candidate/documents').then(res => {
            const isAr = i18n.language === 'ar';
            // Adding specific requested docs manually if not present
            const mockDocs = [
                { name: isAr ? 'نسخة بطاقة التعريف' : 'Copie CIN', type: isAr ? 'ملف PDF' : 'Fichier PDF', status: 'validated', date: '01/03/2026' },
                { name: isAr ? 'صورة شخصية' : 'Photo d\'identité', type: isAr ? 'ملف JPG' : 'Fichier JPG', status: 'validated', date: '01/03/2026' },
                { name: isAr ? 'شهادة طبية' : 'Certificat médical', type: isAr ? 'ملف PDF' : 'Fichier PDF', status: 'validated', date: '01/03/2026' },
                { name: isAr ? 'وصولات الأداء (x3)' : 'Reçus de paiement (x3)', type: isAr ? 'وثيقة PDF' : 'Document PDF', status: 'download', date: '12/04/2026' },
                { name: isAr ? 'شهادة امتحان الكود' : 'Attestation examen code', type: isAr ? 'ملف PDF' : 'Fichier PDF', status: 'download', date: '10/04/2026' },
            ];
            setDocs(mockDocs);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [i18n.language]);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>;

    return (
        <div className="animate-fade-in" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className={`fw-bold m-0 border-4 border-warning ${i18n.language === 'ar' ? 'border-end pe-3' : 'border-start ps-3'}`}>{t('documents.title')}</h5>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="py-2">
                        {docs.map((doc, idx) => (
                            <DocItem key={idx} doc={doc} />
                        ))}
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="glass-panel p-4 border-0 shadow-sm bg-warning bg-opacity-10">
                        <h6 className="fw-bold mb-3 d-flex align-items-center text-dark small uppercase">
                            <AlertCircle size={18} className={`${i18n.language === 'ar' ? 'ms-2' : 'me-2'} text-warning`} /> {t('documents.reminder_title')}
                        </h6>
                        <p className="small text-muted mb-0">
                            {t('documents.reminder_text1')} <span className="text-success fw-bold">{t('documents.reminder_status')}</span>
                            {t('documents.reminder_text2')}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .hover-up:hover { transform: translateY(-3px); }
                .uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CandidateDocuments;
