import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Search, Plus, Edit2, Trash2, UserCog, UserCheck, UserX } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';

const Instructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', specialty: '', salary: '', is_active: true
    });

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/instructors?search=${search}`);
            setInstructors(res.data.data);
        } catch (error) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchInstructors(), 300);
        return () => clearTimeout(delay);
    }, [search]);

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce moniteur ?")) {
            try {
                await api.delete(`/instructors/${id}`);
                toast.success('Moniteur supprimé');
                fetchInstructors();
            } catch (error) {
                toast.error("Erreur de suppression");
            }
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (inst) => {
        setFormData({
            name: inst.user?.name || '',
            email: inst.user?.email || '',
            password: '', 
            phone: inst.phone,
            specialty: inst.specialty,
            salary: inst.salary,
            is_active: inst.is_active
        });
        setEditId(inst.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAddModal = () => {
        setFormData({ name: '', email: '', password: '', phone: '', specialty: '', salary: '', is_active: true });
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await api.put(`/instructors/${editId}`, payload);
                toast.success("Moniteur mis à jour !");
            } else {
                await api.post('/instructors', formData);
                toast.success("Moniteur ajouté !");
            }
            setShowModal(false);
            fetchInstructors();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur de sauvegarde");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Équipe des Moniteurs</h2>
                    <p className="text-muted m-0">Gérez vos instructeurs et leurs accès.</p>
                </div>
                <button className="btn btn-primary-custom d-flex align-items-center" onClick={openAddModal}>
                    <Plus size={20} className="me-2" /> Nouveau Moniteur
                </button>
            </div>

            <div className="glass-panel p-4">
                <div className="row mb-4">
                    <div className="col-md-5">
                        <div className="position-relative">
                            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <input type="text" className="form-control py-2 ps-5" placeholder="Rechercher..."
                                value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Moniteur</th>
                                <th>Téléphone</th>
                                <th>Spécialité</th>
                                <th>Salaire</th>
                                <th>Statut</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : instructors.length > 0 ? (
                                instructors.map(inst => (
                                    <tr key={inst.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center me-3" style={{width: 40, height: 40}}>
                                                    <span className="text-primary fw-bold">{inst.user?.name?.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{inst.user?.name}</div>
                                                    <div className="text-muted small">{inst.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted small">{inst.phone}</td>
                                        <td><span className="badge badge-info-custom badge-custom">{inst.specialty || 'Général'}</span></td>
                                        <td>{inst.salary} DH</td>
                                        <td>
                                            {inst.is_active ? 
                                                <span className="badge badge-success-custom badge-custom">Actif</span> : 
                                                <span className="badge badge-danger-custom badge-custom">Inactif</span>
                                            }
                                        </td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-info me-2 border-0" onClick={() => handleEdit(inst)}><Edit2 size={16}/></button>
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(inst.id)}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">Aucun moniteur.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel">
                <Modal.Header closeButton>
                    <Modal.Title><UserCog className="me-2 text-primary" /> {isEditing ? 'Modifier' : 'Nouveau'} Moniteur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <Form.Label className="small text-muted">Nom complet</Form.Label>
                                <Form.Control required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Email de connexion</Form.Label>
                                <Form.Control required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Mot de passe {isEditing && '(laisser vide pour ne pas modifier)'}</Form.Label>
                                <Form.Control required={!isEditing} type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Téléphone</Form.Label>
                                <Form.Control required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Spécialité (ex: Conduite B)</Form.Label>
                                <Form.Control value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Salaire mensuel (DH)</Form.Label>
                                <Form.Control required type="number" min="0" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-3 border-top border-light border-opacity-10 pt-3">
                            <Button variant="outline-secondary" className="me-2" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button variant="primary" className="btn-primary-custom border-0" type="submit">Sauvegarder</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Instructors;
