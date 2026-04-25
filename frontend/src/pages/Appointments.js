import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, Plus, Trash2, Edit2, Clock, Car, BookOpen, Search, Filter, Users, Download } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLicense, setFilterLicense] = useState('');

    // Select options data
    const [instructors, setInstructors] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    // Session durations in minutes (from settings)
    const [sessionDurations, setSessionDurations] = useState({ driving: 60, code: 90 });

    const [showModal, setShowModal] = useState(false);
    
    // State for viewing candidates list
    const [showCandidatesModal, setShowCandidatesModal] = useState(false);
    const [selectedAptCandidates, setSelectedAptCandidates] = useState([]);

    const openCandidatesModal = (aptCandidates) => {
        setSelectedAptCandidates(aptCandidates);
        setShowCandidatesModal(true);
    };

    const downloadCandidatesPDF = () => {
        if (!selectedAptCandidates || selectedAptCandidates.length === 0) return;
        
        const doc = new jsPDF();
        
        // Add Title
        doc.setFontSize(16);
        doc.text("Liste de Présence - Auto École Janoub", 14, 22);
        
        // Table Columns & Rows
        const tableColumn = ["Nom Complet", "CIN", "Permis", "Signature"];
        const tableRows = [];

        selectedAptCandidates.forEach(c => {
            tableRows.push([
                c.user?.name || '--',
                c.cin || '--',
                `Permis ${c.license_type || '--'}`,
                ""
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
            columnStyles: { 3: { cellWidth: 50 } } // Extra space for signature
        });
        
        doc.save(`Liste_Presence_Seance_${new Date().toISOString().split('T')[0]}.pdf`);
    };
    const [formData, setFormData] = useState({
        instructor_id: '', candidate_ids: [], vehicle_id: '', license_type: 'B', 
        session_type: 'driving',
        date: new Date().toISOString().split('T')[0], start_time: '09:00', end_time: '10:00', status: 'scheduled'
    });

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const params = { per_page: 100 };
            if (searchQuery) params.search = searchQuery;
            if (filterLicense) params.license_type = filterLicense;

            const res = await api.get('/appointments', { params });
            // Handle both {data:[...]} and {data:{data:[...]}} structures
            const aptData = res.data.data ? (Array.isArray(res.data.data) ? res.data.data : res.data.data.data) : [];
            setAppointments(Array.isArray(aptData) ? aptData : []);
            
            const [instRes, candRes, vehRes] = await Promise.all([
                api.get('/instructors?per_page=100'), 
                api.get('/candidates?per_page=100'), 
                api.get('/vehicles?per_page=100')
            ]);
            
            setInstructors(instRes.data.data || []);
            setCandidates(candRes.data.data || []);
            setVehicles(vehRes.data.data || []);

            // Load session durations from settings
            try {
                const settingsRes = await api.get('/settings');
                const settings = settingsRes.data || [];
                const drivingMin = parseInt(settings.find(s => s.key === 'session_duration_driving')?.value) || 60;
                const codeMin    = parseInt(settings.find(s => s.key === 'session_duration_code')?.value)    || 90;
                setSessionDurations({ driving: drivingMin, code: codeMin });
            } catch {}
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Erreur de chargement des rendez-vous");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [searchQuery, filterLicense]);

    const handleDelete = async (id) => {
        if (window.confirm("Annuler ce rendez-vous ?")) {
            try {
                await api.delete(`/appointments/${id}`);
                toast.success('Rendez-vous annulé');
                fetchAppointments();
            } catch (error) {
                toast.error("Erreur d'annulation");
            }
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleEdit = (apt) => {
        setFormData({
            instructor_id: apt.instructor_id || '',
            candidate_ids: apt.candidates ? apt.candidates.map(c => c.id) : [],
            vehicle_id: apt.vehicle_id || '',
            license_type: apt.license_type || 'B',
            session_type: apt.session_type || 'driving',
            date: apt.date || new Date().toISOString().split('T')[0],
            start_time: (apt.start_time || '09:00').substring(0, 5),
            end_time: (apt.end_time || '10:00').substring(0, 5),
            status: apt.status || 'scheduled'
        });
        setEditId(apt.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openAddModal = () => {
        setFormData({
            instructor_id: '', candidate_ids: [], vehicle_id: '', license_type: 'B', 
            session_type: 'driving',
            date: new Date().toISOString().split('T')[0], start_time: '09:00', end_time: '10:00', status: 'scheduled'
        });
        // Auto-select all Permis B active candidates by default
        const defaultSelected = candidates
            .filter(c => c.license_type === 'B' && c.status === 'active')
            .map(c => String(c.id));
        setFormData(prev => ({ ...prev, candidate_ids: defaultSelected }));
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    // When license type changes in the modal — auto-select ALL candidates of that type
    const handleLicenseTypeChange = (newType) => {
        const autoSelected = candidates
            .filter(c => c.license_type === newType && c.status === 'active')
            .map(c => String(c.id));
        setFormData(prev => ({ ...prev, license_type: newType, candidate_ids: autoSelected }));
    };

    // Toggle select all / deselect all for current license type
    const toggleSelectAll = () => {
        const typeIds = candidates
            .filter(c => c.license_type === formData.license_type && c.status === 'active')
            .map(c => String(c.id));
        const allSelected = typeIds.every(id => formData.candidate_ids.includes(id));
        setFormData(prev => ({
            ...prev,
            candidate_ids: allSelected ? [] : typeIds
        }));
    };

    // When start_time changes — auto-compute end_time based on session type duration
    const computeEndTime = (startTime, sessionType) => {
        try {
            const [h, m] = startTime.split(':').map(Number);
            const durationMins = sessionType === 'code'
                ? sessionDurations.code
                : sessionDurations.driving;
            const totalMins = h * 60 + m + durationMins;
            const endH = Math.floor(totalMins / 60) % 24;
            const endM = totalMins % 60;
            return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        } catch { return '10:00'; }
    };

    const handleStartTimeChange = (startTime) => {
        const endTime = computeEndTime(startTime, formData.session_type);
        setFormData(prev => ({ ...prev, start_time: startTime, end_time: endTime }));
    };

    const handleSessionTypeChange = (sessionType) => {
        const endTime = computeEndTime(formData.start_time, sessionType);
        setFormData(prev => ({ ...prev, session_type: sessionType, end_time: endTime }));
    };

    // Toggle a single candidate
    const toggleCandidate = (id) => {
        const sid = String(id);
        setFormData(prev => ({
            ...prev,
            candidate_ids: prev.candidate_ids.includes(sid)
                ? prev.candidate_ids.filter(x => x !== sid)
                : [...prev.candidate_ids, sid]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/appointments/${editId}`, formData);
                toast.success("Rendez-vous mis à jour !");
            } else {
                await api.post('/appointments', formData);
                toast.success("Rendez-vous programmé !");
            }
            setShowModal(false);
            fetchAppointments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Conflit d'horaire ou erreur");
        }
    };

    const formatSafeDate = (dateStr) => {
        try {
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
        } catch (e) { return 'N/A'; }
    };

    const getDayNum = (dateStr) => {
        try {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? '' : d.getDate();
        } catch (e) { return ''; }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Planning Janoub</h2>
                    <p className="text-muted m-0">Gérez l'agenda des séances de Code et de Conduite.</p>
                </div>
                <button className="btn btn-primary-custom d-flex align-items-center" onClick={openAddModal}>
                    <Plus size={20} className="me-2" /> Nouvelle Séance
                </button>
            </div>

            <div className="glass-panel p-4">
                {/* Search & Filter Row */}
                <div className="row mb-4 g-3">
                    <div className="col-md-6 col-lg-4">
                        <div className="position-relative">
                            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <input 
                                type="text" 
                                className="form-control py-2 ps-5 rounded-pill border-light bg-light" 
                                placeholder="Rechercher (Nom, Moniteur, Véhicule...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
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
                                <th>Horaires</th>
                                <th>Élève</th>
                                <th>Type</th>
                                <th>Moniteur / Véhicule</th>
                                <th>Statut</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : appointments.length > 0 ? (
                                appointments.map(apt => (
                                    <tr key={apt.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light p-3 rounded-4 me-3 text-center" style={{ minWidth: '80px', border: '1px solid #eee' }}>
                                                    <div className="fw-bold text-dark small">{formatSafeDate(apt.date)}</div>
                                                    <div className="fw-bolder text-primary fs-5">{getDayNum(apt.date)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-dark fw-bold small"><Clock size={14} className="me-1 text-muted"/>{(apt.start_time || '').substring(0,5)} - {(apt.end_time || '').substring(0,5)}</div>
                                                    <div className="badge badge-primary-custom" style={{fontSize: '0.6rem'}}>PERMIS {apt.license_type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="fw-bold text-dark">
                                            {apt.candidates && apt.candidates.length > 0 ? (
                                                <button 
                                                    className="btn btn-sm btn-light border border-secondary-subtle text-primary fw-bold"
                                                    onClick={() => openCandidatesModal(apt.candidates)}
                                                >
                                                    <Users size={16} className="me-2"/>
                                                    {apt.candidates.length} Élève(s)
                                                </button>
                                            ) : (
                                                <span className="text-muted small">Aucun candidat</span>
                                            )}
                                        </td>
                                        <td>
                                            {apt.session_type === 'code' ? 
                                                <span className="text-info fw-bold small d-flex align-items-center"><BookOpen size={16} className="me-2"/> CODE</span> :
                                                <span className="text-warning fw-bold small d-flex align-items-center"><Car size={16} className="me-2"/> CONDUITE</span>
                                            }
                                        </td>
                                        <td>
                                            <div className="small fw-bold text-dark">{apt.instructor?.user?.name || 'Non attribué'}</div>
                                            <div className="text-muted small">{apt.vehicle?.plate_number || '--'}</div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-custom ${
                                                apt.status === 'scheduled' ? 'badge-info-custom' : 
                                                apt.status === 'completed' ? 'badge-success-custom' : 
                                                'badge-danger-custom'
                                            }`}>
                                                {(apt.status || 'N/A').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-info me-2 border-0" onClick={() => handleEdit(apt)}><Edit2 size={16}/></button>
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(apt.id)}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Aucune séance au planning.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel border-0 shadow-lg" size="lg" centered>
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="fw-bold text-dark"><Calendar className="me-2 text-primary" /> {isEditing ? 'Modifier' : 'Programmer'} Séance</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Label className="small fw-bold text-muted m-0">CATÉGORIE PERMIS</Form.Label>
                                </div>
                                <Form.Select
                                    value={formData.license_type}
                                    onChange={e => handleLicenseTypeChange(e.target.value)}
                                >
                                    <option value="A">Catégorie A — Moto / Scooter</option>
                                    <option value="B">Catégorie B — Voiture légère</option>
                                    <option value="C">Catégorie C — Camion / Poids lourd</option>
                                    <option value="D">Catégorie D — Autocar / Transport</option>
                                    <option value="EC">Catégorie EC — Semi-remorque</option>
                                </Form.Select>
                            </div>

                            {/* Candidates auto-selected by license type */}
                            <div className="col-12 mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Label className="small fw-bold text-muted m-0">
                                        ÉLÈVES PERMIS {formData.license_type}
                                        <span className="badge bg-primary bg-opacity-10 text-primary ms-2 rounded-pill" style={{fontSize:'0.65rem'}}>
                                            {formData.candidate_ids.length} sélectionné{formData.candidate_ids.length > 1 ? 's' : ''}
                                        </span>
                                    </Form.Label>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                        style={{fontSize:'0.7rem'}}
                                        onClick={toggleSelectAll}
                                    >
                                        {candidates.filter(c => c.license_type === formData.license_type && c.status === 'active')
                                                   .every(c => formData.candidate_ids.includes(String(c.id)))
                                            ? 'Désélectionner tout' : 'Sélectionner tout'}
                                    </button>
                                </div>

                                {/* Candidate chips */}
                                <div className="d-flex flex-wrap gap-2 p-3 rounded-4 border border-light bg-light bg-opacity-25" style={{minHeight:'60px'}}>
                                    {candidates.filter(c => c.license_type === formData.license_type && c.status === 'active').length === 0 ? (
                                        <span className="text-muted small fst-italic">Aucun candidat actif pour ce type de permis.</span>
                                    ) : (
                                        candidates
                                            .filter(c => c.license_type === formData.license_type && c.status === 'active')
                                            .map(c => {
                                                const selected = formData.candidate_ids.includes(String(c.id));
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => toggleCandidate(c.id)}
                                                        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${
                                                            selected
                                                                ? 'btn-primary'
                                                                : 'btn-outline-secondary'
                                                        }`}
                                                        style={{fontSize:'0.72rem'}}
                                                    >
                                                        {selected ? '✓ ' : ''}{c.user?.name}
                                                    </button>
                                                );
                                            })
                                    )}
                                </div>
                                <small className="text-muted d-block mt-1" style={{fontSize:'0.68rem'}}>
                                    Cliquez sur un élève pour l'inclure ou l'exclure de cette séance.
                                </small>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">TYPE DE SÉANCE</Form.Label>
                                <Form.Select value={formData.session_type} onChange={e => setFormData({...formData, session_type: e.target.value})}>
                                    <option value="driving">🚗 Séance de Conduite (Pratique)</option>
                                    <option value="code">📖 Séance de Code (Théorique)</option>
                                </Form.Select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">MONITEUR RESPONSABLE</Form.Label>
                                <Form.Select required value={formData.instructor_id} onChange={e => setFormData({...formData, instructor_id: e.target.value})}>
                                    <option value="">Sélectionner un moniteur...</option>
                                    {instructors.map(i => <option key={i.id} value={i.id}>{i.user?.name}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">VÉHICULE ATTRIBUÉ</Form.Label>
                                <Form.Select value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})}>
                                    <option value="">(Optionnel / Code)</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate_number}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">DATE PRÉVUE</Form.Label>
                                <Form.Control required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">HEURE DÉBUT</Form.Label>
                                <Form.Control required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label className="small fw-bold text-muted">HEURE FIN</Form.Label>
                                <Form.Control required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                            </div>
                            {isEditing && (
                                <div className="col-12 mb-3">
                                    <Form.Label className="small fw-bold text-muted">STATUT DE LA SÉANCE</Form.Label>
                                    <Form.Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="scheduled">Planifié</option>
                                        <option value="completed">Terminé / Effectué</option>
                                        <option value="cancelled">Annulé</option>
                                    </Form.Select>
                                </div>
                            )}
                        </div>
                        <div className="d-flex justify-content-end mt-4 pt-4 border-top gap-2">
                            <Button variant="light" className="px-4 fw-bold" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button className="btn-primary-custom px-4" type="submit">SAUVEGARDER AU PLANNING</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Candidates List Modal */}
            <Modal show={showCandidatesModal} onHide={() => setShowCandidatesModal(false)} centered>
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="fw-bold fs-5 d-flex align-items-center w-100">
                        <Users className="me-2 text-primary" size={20} /> Liste des Candidats
                        <button className="btn btn-sm btn-outline-danger ms-auto me-3 d-flex align-items-center fw-bold" onClick={downloadCandidatesPDF}>
                            <Download size={14} className="me-1" /> PDF (Imprimer)
                        </button>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-4">Nom Complet</th>
                                    <th>CIN</th>
                                    <th>Permis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAptCandidates.map(c => (
                                    <tr key={c.id}>
                                        <td className="ps-4 fw-bold">{c.user?.name}</td>
                                        <td>{c.cin || '--'}</td>
                                        <td><span className="badge badge-primary-custom" style={{fontSize: '0.65rem'}}>CLASSE {c.license_type || '--'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Appointments;
