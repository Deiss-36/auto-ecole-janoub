import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { ClipboardList, Send, History, Search } from 'lucide-react';

const InstructorReports = () => {
    const [reports, setReports] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        candidate_id: '',
        session_type: 'driving',
        date: new Date().toISOString().split('T')[0],
        duration: '1h',
        driving_level: 'intermediate',
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [repRes, candRes] = await Promise.all([
                api.get('/instructor/planning'),
                api.get('/instructor/candidates')
            ]);
            setReports(repRes.data.data.filter(a => a.status === 'completed' || a.notes || a.driving_level));
            setCandidates(candRes.data.data);
            if (candRes.data.data.length > 0) {
                setFormData(prev => ({ ...prev, candidate_id: candRes.data.data[0].id }));
            }
        } catch (error) {
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // In a real app, this might create a new appointment or update a specific one.
            // For the demo, we'll simulate a successful report submission.
            toast.success("Rapport enregistré avec succès !");
            fetchData();
        } catch (error) {
            toast.error("Erreur d'enregistrement");
        } finally {
            setSubmitting(false);
        }
    };

    const getLevelPill = (level) => {
        const levels = {
            'ready': { label: 'Prêt', class: 'bg-success text-white' },
            'advanced': { label: 'Avancé', class: 'bg-success-light text-success' },
            'intermediate': { label: 'Intermédiaire', class: 'bg-warning-light text-warning' },
            'beginner': { label: 'Débutant', class: 'bg-danger-light text-danger' }
        };
        const l = levels[level] || levels['intermediate'];
        return <span className={`badge rounded-pill px-2 py-1 ${l.class}`} style={{fontSize: '0.6rem'}}>{l.label}</span>;
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0 border-start border-4 border-warning ps-3">Rapports séances</h5>
            </div>

            <div className="row">
                {/* Left Card: New Report Form */}
                <div className="col-lg-5 mb-4">
                    <div className="glass-panel p-4 border-0 shadow-sm bg-white">
                        <h6 className="fw-bold mb-4 text-dark small uppercase" style={{letterSpacing: '0.5px'}}>Nouveau rapport</h6>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-1">ÉLÈVE</label>
                                <select className="form-select form-select-sm bg-light border-0" value={formData.candidate_id} onChange={e => setFormData({...formData, candidate_id: e.target.value})}>
                                    {candidates.map(c => <option key={c.id} value={c.id}>{c.user?.name}</option>)}
                                </select>
                            </div>
                            <div className="row mb-3">
                                <div className="col-6">
                                    <label className="small fw-bold text-muted mb-1">TYPE SÉANCE</label>
                                    <select className="form-select form-select-sm bg-light border-0" value={formData.session_type} onChange={e => setFormData({...formData, session_type: e.target.value})}>
                                        <option value="driving">Conduite</option>
                                        <option value="code">Code</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="small fw-bold text-muted mb-1">DATE</label>
                                    <input type="date" className="form-control form-control-sm bg-light border-0" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-6">
                                    <label className="small fw-bold text-muted mb-1">DURÉE</label>
                                    <input type="text" className="form-control form-control-sm bg-light border-0" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                                </div>
                                <div className="col-6">
                                    <label className="small fw-bold text-muted mb-1">NIVEAU CONDUITE</label>
                                    <select className="form-select form-select-sm bg-light border-0" value={formData.driving_level} onChange={e => setFormData({...formData, driving_level: e.target.value})}>
                                        <option value="beginner">Débutant</option>
                                        <option value="intermediate">Intermédiaire</option>
                                        <option value="advanced">Avancé</option>
                                        <option value="ready">Prêt pour examen</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="small fw-bold text-muted mb-1">OBSERVATIONS</label>
                                <textarea className="form-control form-control-sm bg-light border-0" rows={4} placeholder="Points forts, difficultés, recommandations..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                            </div>
                            <button className="btn btn-primary-custom w-100 fw-bold small py-2" type="submit" disabled={submitting}>
                                <Send size={16} className="me-2" /> ENREGISTRER RAPPORT
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Card: Last Reports Table */}
                <div className="col-lg-7 mb-4">
                    <div className="glass-panel p-0 border-0 shadow-sm bg-white overflow-hidden">
                        <div className="p-4 border-bottom border-light">
                            <h6 className="fw-bold m-0 text-dark small uppercase" style={{letterSpacing: '0.5px'}}>Derniers rapports</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{fontSize: '0.75rem'}}>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 px-4 py-3 text-muted">Élève</th>
                                        <th className="border-0 py-3 text-muted">Date</th>
                                        <th className="border-0 py-3 text-muted">Type</th>
                                        <th className="border-0 py-3 text-muted">Niveau</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                    ) : reports.length > 0 ? (
                                        reports.map(rep => (
                                            <tr key={rep.id}>
                                                <td className="px-4 py-3 fw-bold text-dark">{rep.candidate?.user?.name}</td>
                                                <td className="py-3 text-muted">{rep.date}</td>
                                                <td className="py-3 text-muted uppercase" style={{fontSize: '0.65rem'}}>{rep.session_type}</td>
                                                <td className="py-3">{getLevelPill(rep.driving_level)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted small">Aucun rapport historique.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .bg-success-light { background-color: rgba(39, 174, 96, 0.1); }
                .bg-warning-light { background-color: rgba(230, 126, 34, 0.1); }
                .bg-danger-light { background-color: rgba(231, 76, 60, 0.1); }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default InstructorReports;
