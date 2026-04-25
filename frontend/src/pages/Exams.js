import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Search, Plus, Edit2, Trash2, GraduationCap, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState({ type: '', result: '', candidate_id: '' });
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        candidate_id: '', type: 'code', date: new Date().toISOString().split('T')[0], result: 'pending', attempt_number: 1, notes: ''
    });

    const fetchExams = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(searchParams).toString();
            const res = await api.get(`/exams?${query}`);
            setExams(res.data.data);
        } catch (error) {
            toast.error("Erreur de chargement des examens");
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async () => {
        try {
            const res = await api.get('/candidates?per_page=100');
            setCandidates(res.data.data);
        } catch (error) {}
    };

    useEffect(() => {
        fetchExams();
        fetchCandidates();
    }, [searchParams]);

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cet examen ?")) {
            try {
                await api.delete(`/exams/${id}`);
                toast.success('Examen supprimé');
                fetchExams();
            } catch (error) {
                toast.error("Erreur de suppression");
            }
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (exam) => {
        setFormData({
            candidate_id: exam.candidate_id,
            type: exam.type,
            date: exam.date,
            result: exam.result,
            attempt_number: exam.attempt_number,
            notes: exam.notes || ''
        });
        setEditId(exam.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAddModal = () => {
        setFormData({ candidate_id: '', type: 'code', date: new Date().toISOString().split('T')[0], result: 'pending', attempt_number: 1, notes: '' });
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/exams/${editId}`, formData);
                toast.success("Examen mis à jour !");
            } else {
                await api.post('/exams', formData);
                toast.success("Examen enregistré !");
            }
            setShowModal(false);
            fetchExams();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur de sauvegarde");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'passed': return <span className="badge badge-success-custom badge-custom"><CheckCircle size={14} className="me-1"/> ADMIS</span>;
            case 'failed': return <span className="badge badge-danger-custom badge-custom"><XCircle size={14} className="me-1"/> RÉPROUVÉ</span>;
            default: return <span className="badge badge-warning-custom badge-custom"><Clock size={14} className="me-1"/> EN ATTENTE</span>;
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Examens & Résultats</h2>
                    <p className="text-muted m-0">Suivez les performances des élèves aux épreuves.</p>
                </div>
                <button className="btn btn-accent-custom d-flex align-items-center" onClick={openAddModal}>
                    <Plus size={20} className="me-2" /> Porter à l'Examen
                </button>
            </div>

            <div className="glass-panel p-4 mb-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="small text-muted fw-bold mb-1">TYPE</label>
                        <select className="form-select" value={searchParams.type} onChange={e => setSearchParams({...searchParams, type: e.target.value})}>
                            <option value="">Tous les types</option>
                            <option value="code">Code de la route</option>
                            <option value="driving">Conduite</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="small text-muted fw-bold mb-1">RÉSULTAT</label>
                        <select className="form-select" value={searchParams.result} onChange={e => setSearchParams({...searchParams, result: e.target.value})}>
                            <option value="">Tous les résultats</option>
                            <option value="pending">En attente</option>
                            <option value="passed">Admis (Passed)</option>
                            <option value="failed">Réprové (Failed)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Candidat</th>
                                <th>Type d'Examen</th>
                                <th>Date</th>
                                <th>Tentative</th>
                                <th>Résultat</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : exams.length > 0 ? (
                                exams.map(exam => (
                                    <tr key={exam.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light rounded p-2 me-3">
                                                    <User size={18} className="text-secondary" />
                                                </div>
                                                <div className="fw-bold text-dark">{exam.candidate?.user?.name}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-medium text-capitalize">
                                                {exam.type === 'code' ? 'Code (Théorique)' : 'Conduite (Pratique)'}
                                            </span>
                                        </td>
                                        <td className="text-muted"><Calendar size={14} className="me-1"/> {exam.date}</td>
                                        <td><span className="badge bg-light text-dark">{exam.attempt_number}ère fois</span></td>
                                        <td>{getStatusBadge(exam.result)}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-info me-2 border-0" onClick={() => handleEdit(exam)}><Edit2 size={16}/></button>
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(exam.id)}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-4 text-muted">Aucun examen enregistré.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel border-0 shadow-lg" centered size="lg">
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="fw-bold"><GraduationCap className="me-2 text-primary" /> {isEditing ? 'Évaluer' : 'Programmer'} Examen</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">BILAN POUR L'ÉLÈVE</Form.Label>
                                <Form.Select required value={formData.candidate_id} onChange={e => setFormData({...formData, candidate_id: e.target.value})} disabled={isEditing}>
                                    <option value="">Sélectionner un candidat...</option>
                                    {candidates.map(c => (
                                        <option key={c.id} value={c.id}>{c.user.name} ({c.cin})</option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">TYPE D'ÉPREUVE</Form.Label>
                                <Form.Select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="code">Code de la route</option>
                                    <option value="driving">Conduite pratique</option>
                                </Form.Select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">DATE</Form.Label>
                                <Form.Control required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">TENTATIVE N°</Form.Label>
                                <Form.Control type="number" min="1" value={formData.attempt_number} onChange={e => setFormData({...formData, attempt_number: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">DÉCISION / RÉSULTAT</Form.Label>
                                <Form.Select value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})}>
                                    <option value="pending">Prévu / En attente</option>
                                    <option value="passed">Admis (Passed)</option>
                                    <option value="failed">Refusé (Failed)</option>
                                </Form.Select>
                            </div>
                            <div className="col-12 mb-3">
                                <Form.Label className="small fw-bold text-muted">NOTES DE L'EXAMINATEUR</Form.Label>
                                <Form.Control as="textarea" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Observations, fautes éliminatoires..." />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2 pt-3">
                            <Button variant="light" className="px-4 fw-bold" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button className="btn-accent-custom px-4" type="submit">VALIDER LE DOSSIER</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Exams;
