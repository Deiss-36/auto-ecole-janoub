import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Search, Plus, Edit2, Trash2, UserCheck, FileText, Camera, Mail, Filter } from 'lucide-react';

import { Modal, Button, Form } from 'react-bootstrap';

const Candidates = () => {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [licensePrices, setLicensePrices] = useState({}); // { A: 2500, B: 3500, ... }

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLicense, setFilterLicense] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', cin: '', phone: '', address: '', 
        license_type: 'B', total_price: '', folder_status: 'incomplete', status: 'active', photo: null
    });

    // Reminder Modal state
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderCandidate, setReminderCandidate] = useState(null);
    const [reminderMessage, setReminderMessage] = useState('');
    const [sendingReminder, setSendingReminder] = useState(false);

    // Load license prices from settings once
    useEffect(() => {
        api.get('/settings').then(res => {
            const prices = {};
            (res.data || []).forEach(s => {
                if (s.category === 'pricing' && s.key.startsWith('price_')) {
                    const type = s.key.replace('price_', ''); // 'A', 'B', etc.
                    prices[type] = parseFloat(s.value) || 0;
                }
            });
            setLicensePrices(prices);
        }).catch(() => {}); // silent fail — prices are optional
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filterLicense) params.append('license_type', filterLicense);

            const res = await api.get(`/candidates?${params.toString()}`);
            setCandidates(res.data.data);
        } catch (error) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchCandidates(), 300);
        return () => clearTimeout(delay);
    }, [search, filterLicense]);

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce candidat ?")) {
            try {
                await api.delete(`/candidates/${id}`);
                toast.success('Candidat supprimé');
                fetchCandidates();
            } catch (error) {
                toast.error("Erreur de suppression");
            }
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (c) => {
        setFormData({
            name: c.user?.name || '',
            email: c.user?.email || '',
            password: '', 
            cin: c.cin,
            phone: c.phone,
            address: c.address || '',
            license_type: c.license_type,
            total_price: c.total_price,
            folder_status: c.folder_status || 'incomplete',
            status: c.status || 'active',
            photo: null
        });
        setEditId(c.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAddModal = () => {
        const defaultType = 'B';
        setFormData({ 
            name: '', email: '', password: '', cin: '', phone: '', address: '', 
            license_type: defaultType,
            total_price: licensePrices[defaultType] || '',
            folder_status: 'incomplete', status: 'active', photo: null 
        });
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    // When license type changes in the form, auto-fill price (only in add mode)
    const handleLicenseChange = (e) => {
        const type = e.target.value;
        setFormData(prev => ({
            ...prev,
            license_type: type,
            // Only auto-fill price when adding a new candidate (not editing)
            ...(!isEditing && licensePrices[type] ? { total_price: licensePrices[type] } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            for (let key in formData) {
                if (key === 'password' && isEditing && !formData.password) continue;
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    payload.append(key, formData[key]);
                }
            }

            if (isEditing) {
                payload.append('_method', 'PUT');
                await api.post(`/candidates/${editId}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Candidat mis à jour !");
            } else {
                await api.post('/candidates', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Candidat ajouté !");
            }
            setShowModal(false);
            fetchCandidates();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur de sauvegarde");
        }
    };

    const openReminderModal = (c) => {
        setReminderCandidate(c);
        setReminderMessage(`Bonjour ${c.user.name},\n\nNous vous contactons concernant votre dossier à l'Auto École Janoub.\n\nCordialement,\nLe Secrétariat.`);
        setShowReminderModal(true);
    };

    const handleSendReminder = async (e) => {
        e.preventDefault();
        if (!reminderMessage.trim()) return;
        setSendingReminder(true);
        try {
            await api.post(`/candidates/${reminderCandidate.id}/reminder`, { message: reminderMessage });
            toast.success("Rappel envoyé avec succès !");
            setShowReminderModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
        } finally {
            setSendingReminder(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Gestion des Élèves</h2>
                    <p className="text-muted m-0">Inscrivez et suivez vos futurs conducteurs.</p>
                </div>
                {['admin','secretary'].includes(user?.role) && (
                    <button className="btn btn-primary-custom d-flex align-items-center" onClick={openAddModal}>
                        <Plus size={20} className="me-2" /> Nouveau Candidat
                    </button>
                )}
            </div>


            <div className="glass-panel p-4">
                <div className="row mb-4 g-3">
                    <div className="col-md-6 col-lg-5">
                        <div className="position-relative">
                            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <input type="text" className="form-control py-2 ps-5 rounded-pill border-light bg-light" placeholder="Rechercher (Nom, CIN...)"
                                value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="position-relative">
                            <Filter className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <select 
                                className="form-select py-2 ps-5 rounded-pill border-light bg-light"
                                value={filterLicense}
                                onChange={(e) => setFilterLicense(e.target.value)}
                            >
                                <option value="">Tous les Permis</option>
                                <option value="A">Permis A (Moto)</option>
                                <option value="B">Permis B (Voiture)</option>
                                <option value="C">Permis C (Camion)</option>
                                <option value="D">Permis D (Autocar)</option>
                                <option value="EC">Permis EC (Semi-remorque)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Élève</th>
                                <th>CIN / Permis</th>
                                <th>Dossier</th>
                                <th>État Financier</th>
                                <th>Statut</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : candidates.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle overflow-hidden me-3 d-flex align-items-center justify-content-center" 
                                                 style={{width: 45, height: 45, border: '2px solid var(--primary-color)'}}>
                                                {c.photo_path ? <img src={c.photo_path} alt="" /> : <Camera size={20} className="text-muted" />}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{c.user.name}</div>
                                                <div className="text-muted small">{c.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-medium">{c.cin}</div>
                                        <div className="badge badge-primary-custom" style={{fontSize: '0.65rem'}}>CLASSE {c.license_type}</div>
                                    </td>
                                    <td>
                                        {c.folder_status === 'complete' ? 
                                            <span className="text-success small fw-bold d-flex align-items-center"><FileText size={14} className="me-1"/> COMPLET</span> :
                                            <span className="text-danger small fw-bold d-flex align-items-center"><FileText size={14} className="me-1"/> INCOMPLET</span>
                                        }
                                    </td>
                                    <td>
                                        <div className="small text-muted mb-1">Reste à payer:</div>
                                        <div className={`fw-bold ${c.remaining_balance > 0 ? 'text-warning' : 'text-success'}`}>
                                            {c.remaining_balance} DH
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-custom ${
                                            c.status === 'active' ? 'badge-success-custom' : 'badge-danger-custom'
                                        }`}>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        {['admin','secretary'].includes(user?.role) && (
                                            <>
                                                <button className="btn btn-sm btn-outline-warning me-2 border-0" onClick={() => openReminderModal(c)} title="Envoyer un rappel"><Mail size={16}/></button>
                                                <button className="btn btn-sm btn-outline-info me-2 border-0" onClick={() => handleEdit(c)} title="Modifier"><Edit2 size={16}/></button>
                                                <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(c.id)} title="Supprimer"><Trash2 size={16}/></button>
                                            </>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel border-0 shadow-lg" size="lg" centered>
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="fw-bold"><UserCheck className="me-2 text-primary" /> {isEditing ? 'Modifier' : 'Nouveau'} Élève</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <Form.Label className="small fw-bold text-muted">PHOTO DE PROFIL</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
                            </div>
                            <div className="col-md-8 mb-3">
                                <Form.Label className="small fw-bold text-muted">NOM COMPLET</Form.Label>
                                <Form.Control required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">CIN</Form.Label>
                                <Form.Control required value={formData.cin} onChange={e => setFormData({...formData, cin: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">EMAIL</Form.Label>
                                <Form.Control required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">MOT DE PASSE {isEditing && '(optionnel)'}</Form.Label>
                                <Form.Control required={!isEditing} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">TÉLÉPHONE</Form.Label>
                                <Form.Control required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">TYPE PERMIS</Form.Label>
                                <Form.Select value={formData.license_type} onChange={handleLicenseChange}>
                                    <option value="A">Permis A (Moto)</option>
                                    <option value="B">Permis B (Voiture)</option>
                                    <option value="C">Permis C (Camion)</option>
                                    <option value="D">Permis D (Autocar)</option>
                                    <option value="EC">Permis EC (Semi-remorque)</option>
                                </Form.Select>
                                {!isEditing && licensePrices[formData.license_type] && (
                                    <small className="text-success fw-bold mt-1 d-block">
                                        ✓ Prix standard : {licensePrices[formData.license_type].toLocaleString()} DH
                                    </small>
                                )}
                            </div>
                            <div className="col-12 mb-3">
                                <Form.Label className="small fw-bold text-muted">ADRESSE</Form.Label>
                                <Form.Control as="textarea" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">PRIX TOTAL (DH)</Form.Label>
                                <Form.Control required type="number" min="0" value={formData.total_price} onChange={e => setFormData({...formData, total_price: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">ÉTAT DOSSIER</Form.Label>
                                <Form.Select value={formData.folder_status} onChange={e => setFormData({...formData, folder_status: e.target.value})}>
                                    <option value="incomplete">Incomplet ❌</option>
                                    <option value="complete">Complet ✅</option>
                                </Form.Select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">STATUT COMPTE</Form.Label>
                                <Form.Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="active">Actif</option>
                                    <option value="completed">Diplômé / Terminé</option>
                                    <option value="suspended">Suspendu</option>
                                </Form.Select>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2 pt-3">
                            <Button variant="light" className="px-4 fw-bold" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button className="btn-primary-custom px-4" type="submit">SAUVEGARDER</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal for Reminder Email */}
            <Modal show={showReminderModal} onHide={() => !sendingReminder && setShowReminderModal(false)} contentClassName="glass-panel border-0 shadow-lg" centered>
                <Modal.Header closeButton={!sendingReminder} className="border-bottom border-light">
                    <Modal.Title className="fw-bold"><Mail className="me-2 text-warning" /> Envoyer un rappel</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {reminderCandidate && (
                        <Form onSubmit={handleSendReminder}>
                            <div className="mb-3">
                                <Form.Label className="small fw-bold text-muted">DESTINATAIRE</Form.Label>
                                <Form.Control disabled value={`${reminderCandidate.user.name} (${reminderCandidate.user.email})`} />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className="small fw-bold text-muted">RESTE À PAYER</Form.Label>
                                    <span className={`fw-bold small ${reminderCandidate.remaining_balance > 0 ? 'text-warning' : 'text-success'}`}>
                                        {reminderCandidate.remaining_balance} DH
                                    </span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <Form.Label className="small fw-bold text-muted">MESSAGE</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={5} 
                                    required 
                                    value={reminderMessage} 
                                    onChange={e => setReminderMessage(e.target.value)} 
                                />
                                <Form.Text className="text-muted" style={{fontSize: '0.7rem'}}>
                                    Ce message sera inclus dans un email formaté aux couleurs de l'auto-école.
                                </Form.Text>
                            </div>
                            <div className="d-flex justify-content-end gap-2 pt-3">
                                <Button variant="light" className="px-4 fw-bold" onClick={() => setShowReminderModal(false)} disabled={sendingReminder}>Annuler</Button>
                                <Button className="btn-primary-custom px-4" type="submit" disabled={sendingReminder}>
                                    {sendingReminder ? <span className="spinner-border spinner-border-sm me-2"></span> : 'ENVOYER L\'EMAIL'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Candidates;
