import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Search, Plus, Trash2, Edit2, CarFront, Wrench } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        brand: '', model: '', plate_number: '', status: 'active', last_maintenance: new Date().toISOString().split('T')[0]
    });

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/vehicles`);
            setVehicles(res.data.data);
        } catch (error) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Retirer ce véhicule du parc ?")) {
            try {
                await api.delete(`/vehicles/${id}`);
                toast.success('Véhicule supprimé');
                fetchVehicles();
            } catch (error) {
                toast.error("Erreur de suppression");
            }
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (v) => {
        setFormData({
            brand: v.brand,
            model: v.model,
            plate_number: v.plate_number,
            status: v.status,
            last_maintenance: v.last_maintenance || ''
        });
        setEditId(v.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAddModal = () => {
        setFormData({ brand: '', model: '', plate_number: '', status: 'active', last_maintenance: new Date().toISOString().split('T')[0] });
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/vehicles/${editId}`, formData);
                toast.success("Véhicule mis à jour !");
            } else {
                await api.post('/vehicles', formData);
                toast.success("Véhicule ajouté !");
            }
            setShowModal(false);
            fetchVehicles();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur de sauvegarde");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Parc Automobile</h2>
                    <p className="text-muted m-0">Gérez vos véhicules et leurs maintenances.</p>
                </div>
                <button className="btn btn-primary-custom d-flex align-items-center" onClick={openAddModal}>
                    <Plus size={20} className="me-2" /> Ajouter un Véhicule
                </button>
            </div>

            <div className="glass-panel p-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Marque & Modèle</th>
                                <th>Immatriculation</th>
                                <th>Dernier Entretien</th>
                                <th>État</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : vehicles.length > 0 ? (
                                vehicles.map(v => (
                                    <tr key={v.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded text-primary me-3">
                                                    <CarFront size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{v.brand}</div>
                                                    <div className="text-muted small">{v.model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="fw-medium text-warning">{v.plate_number}</td>
                                        <td className="text-muted"><Wrench size={14} className="me-1"/> {v.last_maintenance || 'N/A'}</td>
                                        <td>
                                            <span className={`badge badge-custom ${
                                                v.status === 'active' ? 'badge-success-custom' : 
                                                v.status === 'maintenance' ? 'badge-warning-custom' : 
                                                'badge-danger-custom'
                                            }`}>
                                                {v.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-info me-2 hover-bg-dark border-0" onClick={() => handleEdit(v)}><Edit2 size={16}/></button>
                                            <button className="btn btn-sm btn-outline-danger hover-bg-dark border-0" onClick={() => handleDelete(v.id)}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">Aucun véhicule.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel">
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="text-dark"><CarFront className="me-2 text-primary" /> {isEditing ? 'Modifier' : 'Nouveau'} Véhicule</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Marque (ex: Dacia)</Form.Label>
                                <Form.Control required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Modèle (ex: Logan)</Form.Label>
                                <Form.Control required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                            </div>
                            <div className="col-12 mb-3">
                                <Form.Label className="small text-muted">Matricule</Form.Label>
                                <Form.Control required placeholder="12345-A-1" value={formData.plate_number} onChange={e => setFormData({...formData, plate_number: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">État</Form.Label>
                                <Form.Select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="active">En Service</option>
                                    <option value="maintenance">En Maintenance</option>
                                    <option value="out_of_service">Hors Service</option>
                                </Form.Select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small text-muted">Dernière Maintenance</Form.Label>
                                <Form.Control type="date" value={formData.last_maintenance} onChange={e => setFormData({...formData, last_maintenance: e.target.value})} />
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

export default Vehicles;
