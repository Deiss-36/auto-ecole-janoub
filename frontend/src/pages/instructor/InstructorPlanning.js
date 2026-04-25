import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Calendar, Clock, User, CheckCircle, FileText, Users } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const InstructorPlanning = () => {
    const { t, i18n } = useTranslation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedApt, setSelectedApt] = useState(null);
    const [formData, setFormData] = useState({ status: 'completed', notes: '', driving_level: 'intermediate' });

    const fetchPlanning = async () => {
        setLoading(true);
        try {
            const res = await api.get('/instructor/planning');
            setAppointments(res.data.data);
        } catch (error) {
            toast.error(i18n.language === 'ar' ? "خطأ في تحميل الجدول" : "Erreur de chargement du planning");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanning();
    }, []);

    const groupAppointmentsByDate = (apts) => {
        const groups = {};
        apts.forEach(apt => {
            const dateStr = apt.date;
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(apt);
        });
        return groups;
    };

    const formatDateHeader = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
    };

    const handleOpenValidation = (apt) => {
        setSelectedApt(apt);
        setFormData({ 
            status: 'completed', 
            notes: apt.notes || '', 
            driving_level: apt.driving_level || 'intermediate' 
        });
        setShowModal(true);
    };

    const handleSaveStatus = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/instructor/appointment/${selectedApt.id}`, formData);
            toast.success(i18n.language === 'ar' ? "تم تأكيد الحصة بنجاح!" : "Séance validée avec succès !");
            setShowModal(false);
            fetchPlanning();
        } catch (error) {
            toast.error(i18n.language === 'ar' ? "خطأ في التأكيد" : "Erreur lors de la validation");
        }
    };

    const grouped = groupAppointmentsByDate(appointments);
    const sortedDates = Object.keys(grouped).sort((a,b) => new Date(a) - new Date(b));

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const isAr = i18n.language === 'ar';

    return (
        <div className="animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className={`fw-bold m-0 border-4 border-warning text-dark ${isAr ? 'border-end pe-3' : 'border-start ps-3'}`}>
                    {isAr ? 'جدول حصصي' : 'Mon Planning'}
                </h5>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary border-3"></div></div>
            ) : sortedDates.length > 0 ? (
                sortedDates.map(date => (
                    <div key={date} className="mb-5">
                        <div className="text-muted fw-bold small mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>
                            {formatDateHeader(date)}
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {grouped[date].map(apt => (
                                <div key={apt.id} className="glass-panel p-3 border-0 shadow-sm d-flex align-items-center bg-white rounded-4 transition-all hover-up">
                                    <div className={`fw-bold text-dark small ${isAr ? 'ms-4' : 'me-4'}`} style={{ width: '50px' }}>
                                        {apt.start_time.substring(0, 5)}
                                    </div>
                                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${isAr ? 'ms-3' : 'me-3'}`} 
                                         style={{width: 36, height: 36, background: 'var(--teal-color)', color: 'white', fontSize: '0.75rem'}}>
                                        <span className="fw-bold">{getInitials(apt.candidates?.[0]?.user?.name)}</span>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="fw-bold text-dark small text-truncate">
                                            {apt.candidates?.[0]?.user?.name || '—'}
                                            {apt.candidates?.length > 1 && <span className="ms-1 text-muted">(+{apt.candidates.length - 1})</span>}
                                        </div>
                                        <div className="text-muted small d-flex align-items-center gap-2" style={{fontSize: '0.7rem'}}>
                                            <span className={`badge rounded-pill ${apt.session_type === 'driving' ? 'bg-primary' : 'bg-warning'} bg-opacity-10 ${apt.session_type === 'driving' ? 'text-primary' : 'text-warning'} fw-bold px-2`} style={{fontSize: '0.55rem'}}>
                                                {apt.session_type?.toUpperCase()}
                                            </span>
                                            · {apt.license_type} · {apt.vehicle?.plate_number || 'Salle 1'}
                                        </div>
                                    </div>
                                    <div className="me-4 ms-4 d-none d-md-block text-center" style={{ width: '100px' }}>
                                        <span className={`badge rounded-pill small px-3 py-1 ${
                                            apt.status === 'completed' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'
                                        }`} style={{fontSize: '0.65rem'}}>
                                            {apt.status === 'completed' ? (isAr ? 'تمت' : 'Fait') : (isAr ? 'مبرمجة' : 'Prévu')}
                                        </span>
                                    </div>
                                    <div className={`${isAr ? 'text-start' : 'text-end'}`} style={{ width: '100px' }}>
                                        {apt.status === 'scheduled' ? (
                                            <button className="btn btn-sm btn-primary-custom px-3 py-2 rounded-pill fw-bold" style={{fontSize: '0.7rem'}} onClick={() => handleOpenValidation(apt)}>
                                                {isAr ? 'تأكيد' : 'Valider'}
                                            </button>
                                        ) : (
                                            <div className="text-success small fw-bold d-flex align-items-center justify-content-center">
                                                <CheckCircle size={14} className={isAr ? 'ms-1' : 'me-1'} /> {isAr ? 'تقرير' : 'Rapport'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="glass-panel p-5 text-center text-muted rounded-5">
                    <Calendar size={48} className="opacity-10 mb-3" />
                    <p>{isAr ? 'لا يوجد حصص في الجدول حالياً.' : 'Aucune séance au planning pour le moment.'}</p>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg rounded-5 overflow-hidden">
                <Modal.Header closeButton className="border-0 pb-0 bg-light p-4">
                    <Modal.Title className="fw-bold small uppercase text-dark" style={{letterSpacing: '1px'}}>
                        {isAr ? 'تأكيد الحصة' : 'VALIDER LA SÉANCE'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 bg-white">
                    <Form onSubmit={handleSaveStatus}>
                        <div className="mb-4">
                            <Form.Label className="small fw-bold text-muted uppercase" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>
                                {isAr ? 'المستوى المحقق' : 'NIVEAU ATTEINT'}
                            </Form.Label>
                            <Form.Select value={formData.driving_level} onChange={e => setFormData({...formData, driving_level: e.target.value})} className="form-select-sm rounded-3 border-light bg-light p-2">
                                <option value="beginner">{isAr ? 'مبتدئ' : 'Débutant'}</option>
                                <option value="intermediate">{isAr ? 'متوسط' : 'Intermédiaire'}</option>
                                <option value="advanced">{isAr ? 'متقدم' : 'Avancé'}</option>
                                <option value="ready">{isAr ? 'جاهز للامتحان' : 'Prêt pour examen'}</option>
                            </Form.Select>
                        </div>
                        <div className="mb-4">
                            <Form.Label className="small fw-bold text-muted uppercase" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>
                                {isAr ? 'ملاحظات (اختياري)' : 'OBSERVATIONS (NOTES)'}
                            </Form.Label>
                            <Form.Control as="textarea" rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder={isAr ? "نقاط القوة، الصعوبات..." : "Points forts, difficultés..."} className="small rounded-3 border-light bg-light" />
                        </div>
                        <div className="d-flex gap-3 pt-2">
                            <Button variant="light" className="flex-grow-1 fw-bold small rounded-pill py-2" onClick={() => setShowModal(false)}>
                                {isAr ? 'إلغاء' : 'Annuler'}
                            </Button>
                            <Button className="btn-primary-custom flex-grow-1 fw-bold small rounded-pill py-2" type="submit">
                                {isAr ? 'حفظ' : 'Enregistrer'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <style jsx="true">{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .hover-up:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.05) !important; }
                .uppercase { text-transform: uppercase; }
            `}</style>
        </div>
    );
};

export default InstructorPlanning;
