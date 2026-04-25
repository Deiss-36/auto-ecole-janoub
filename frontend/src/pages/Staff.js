import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Search, Plus, Edit2, Trash2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'secretary'
    });

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/staff?search=${search}`);
            setStaff(res.data.data);
        } catch (error) {
            toast.error("Erreur de chargement du personnel");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchStaff(), 300);
        return () => clearTimeout(delay);
    }, [search]);

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce compte membre du personnel ?")) {
            try {
                await api.delete(`/staff/${id}`);
                toast.success('Compte supprimé');
                fetchStaff();
            } catch (error) {
                toast.error(error.response?.data?.message || "Erreur de suppression");
            }
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            password: '', 
            role: user.role
        });
        setEditId(user.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAddModal = () => {
        setFormData({ name: '', email: '', password: '', role: 'secretary' });
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
                await api.put(`/staff/${editId}`, payload);
                toast.success("Personnel mis à jour !");
            } else {
                await api.post('/staff', formData);
                toast.success("Membre du personnel ajouté !");
            }
            setShowModal(false);
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur de sauvegarde");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Équipe Administrative</h2>
                    <p className="text-muted m-0">Gérez les accès Administrateur et Secrétaire.</p>
                </div>
                <button className="btn btn-primary-custom d-flex align-items-center" onClick={openAddModal}>
                    <Plus size={20} className="me-2" /> Nouveau Membre
                </button>
            </div>

            <div className="glass-panel p-4">
                <div className="row mb-4">
                    <div className="col-md-5">
                        <div className="position-relative">
                            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <input type="text" className="form-control py-2 ps-5" placeholder="Rechercher par nom ou email..."
                                value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Personnel</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Date d'ajout</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : staff.length > 0 ? (
                                staff.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle d-flex justify-content-center align-items-center me-3" 
                                                     style={{width: 40, height: 40, background: 'var(--secondary-color)', color: 'var(--primary-color)'}}>
                                                    <span className="fw-bold">{user.name?.charAt(0)}</span>
                                                </div>
                                                <div className="fw-bold text-dark">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="text-muted">{user.email}</td>
                                        <td>
                                            <span className={`badge badge-custom ${user.role === 'admin' ? 'badge-primary-custom' : 'badge-info-custom'}`}>
                                                {user.role === 'admin' ? 'ADMINISTRATEUR' : 'SECRÉTAIRE'}
                                            </span>
                                        </td>
                                        <td className="text-muted small">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-info me-2 border-0" onClick={() => handleEdit(user)}><Edit2 size={16}/></button>
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(user.id)}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">Aucun membre trouvé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel border-0 shadow-lg" centered>
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="fw-bold"><ShieldCheck className="me-2 text-primary" /> {isEditing ? 'Modifier' : 'Nouveau'} Membre</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <Form.Label className="small fw-bold text-muted">NOM COMPLET</Form.Label>
                            <Form.Control required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Ahmed Benali" />
                        </div>
                        <div className="mb-3">
                            <Form.Label className="small fw-bold text-muted">ADRESSE EMAIL</Form.Label>
                            <div className="position-relative">
                                <Mail size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                <Form.Control required type="email" className="ps-5" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="admin@janoub.ma" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <Form.Label className="small fw-bold text-muted">MOT DE PASSE {isEditing && '(optionnel)'}</Form.Label>
                            <div className="position-relative">
                                <Lock size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                <Form.Control required={!isEditing} type="password" className="ps-5" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <Form.Label className="small fw-bold text-muted">RÔLE</Form.Label>
                            <Form.Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="secretary">Secrétaire</option>
                                <option value="admin">Administrateur</option>
                            </Form.Select>
                        </div>
                        <div className="d-flex justify-content-end gap-2 pt-3">
                            <Button variant="light" className="px-4 fw-bold" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button className="btn-primary-custom px-4" type="submit">SAUVEGARDER</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Staff;
