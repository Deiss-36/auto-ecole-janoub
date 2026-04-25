import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Search, Plus, Trash2, Edit2, ReceiptText } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        category: '', amount: '', date: new Date().toISOString().split('T')[0], description: ''
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/expenses`);
            setExpenses(res.data.data);
        } catch (error) {
            toast.error("Erreur de chargement des charges");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette charge / dépense ?")) {
            try {
                await api.delete(`/expenses/${id}`);
                toast.success('Dépense supprimée');
                fetchExpenses();
            } catch (error) {
                toast.error("Erreur de suppression");
            }
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (exp) => {
        setFormData({
            category: exp.category,
            amount: exp.amount,
            date: exp.date,
            description: exp.description || ''
        });
        setEditId(exp.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAddModal = () => {
        setFormData({ category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/expenses/${editId}`, formData);
                toast.success("Dépense mise à jour !");
            } else {
                await api.post('/expenses', formData);
                toast.success("Dépense enregistrée !");
            }
            setShowModal(false);
            fetchExpenses();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur de sauvegarde");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark">Charges & Dépenses</h2>
                    <p className="text-muted m-0">Gardez une trace absolue de vos frais.</p>
                </div>
                <button className="btn btn-danger text-white d-flex align-items-center rounded-3 shadow-sm" onClick={openAddModal}>
                    <Plus size={20} className="me-2" /> Nouvelle Dépense
                </button>
            </div>

            <div className="glass-panel p-4 border border-danger border-opacity-10 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Catégorie</th>
                                <th>Montant</th>
                                <th>Description</th>
                                <th>Responsable</th>
                                <th>Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border text-danger"></div></td></tr>
                            ) : expenses.length > 0 ? (
                                expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td className="fw-medium text-dark">
                                            <span className="badge badge-danger-custom badge-custom">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="fw-bold text-danger">-{exp.amount} DH</td>
                                        <td className="text-muted small">{exp.description || '--'}</td>
                                        <td className="text-info small">{exp.user?.name}</td>
                                        <td className="text-muted">{exp.date}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-info me-2 hover-bg-dark border-0" onClick={() => handleEdit(exp)}><Edit2 size={16}/></button>
                                            <button className="btn btn-sm btn-outline-danger hover-bg-dark border-0" onClick={() => handleDelete(exp.id)}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-4 text-muted">Aucune charge déclarée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel">
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="text-dark"><ReceiptText className="me-2 text-danger" /> {isEditing ? 'Modifier' : 'Ajouter'} une Dépense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Catégorie</Form.Label>
                                <Form.Control required placeholder="Loyer, Carburant, etc.." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Montant (DH)</Form.Label>
                                <Form.Control required type="number" min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                            </div>
                            <div className="col-12 mb-3">
                                <Form.Label className="small text-muted">Description & Raison</Form.Label>
                                <Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="col-12 mb-3">
                                <Form.Label className="small text-muted">Date</Form.Label>
                                <Form.Control required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-3 border-top border-light border-opacity-10 pt-3">
                            <Button variant="outline-secondary" className="me-2" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button variant="danger" type="submit">Déduire de la caisse</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Expenses;
