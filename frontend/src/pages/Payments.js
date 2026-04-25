import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Search, Plus, Trash2, Wallet, Banknote, Printer, Phone, MapPin } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [selectedPaymentForPrint, setSelectedPaymentForPrint] = useState(null);
    const [formData, setFormData] = useState({
        candidate_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', notes: ''
    });

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const [res, c] = await Promise.all([
                api.get(`/payments?search=${search}`),
                api.get('/candidates?per_page=100'),
            ]);
            setPayments(res.data.data);
            setCandidates(c.data.data ?? c.data);
        } catch (error) {
            toast.error("Erreur de chargement des paiements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchPayments(), 300);
        return () => clearTimeout(delay);
    }, [search]);

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce paiement ?")) {
            try {
                await api.delete(`/payments/${id}`);
                toast.success('Paiement supprimé');
                fetchPayments();
            } catch (error) {
                toast.error("Erreur de suppression");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/payments', formData);
            toast.success("Paiement enregistré !");
            setShowModal(false);
            setFormData({ candidate_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', notes: '' });
            fetchPayments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur d'enregistrement");
        }
    };

    const handlePrint = (pay) => {
        setSelectedPaymentForPrint(pay);
        setTimeout(() => {
            window.print();
        }, 150);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <div>
                    <h2 className="fw-bold mb-1">Gestion Financière</h2>
                    <p className="text-muted m-0">Suivi des versements et émission de reçus.</p>
                </div>
                <button className="btn btn-primary-custom d-flex align-items-center" onClick={() => setShowModal(true)}>
                    <Plus size={20} className="me-2" /> Nouveau Versement
                </button>
            </div>

            <div className="glass-panel p-4 no-print">
                <div className="row mb-4">
                    <div className="col-md-5">
                        <div className="position-relative">
                            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                            <input type="text" className="form-control py-2 ps-5" placeholder="Rechercher un paiement..."
                                value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Réf Reçu</th>
                                <th>Élève</th>
                                <th>Montant</th>
                                <th>Mode</th>
                                <th>Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : payments.length > 0 ? (
                                payments.map(pay => (
                                    <tr key={pay.id}>
                                        <td className="text-muted small fw-bold"># REC-{String(pay.id).padStart(5, '0')}</td>
                                        <td>
                                            <div className="fw-bold text-dark">{pay.candidate?.user?.name || 'Inconnu'}</div>
                                            <div className="text-muted small">{pay.candidate?.cin}</div>
                                        </td>
                                        <td><span className="fw-bold text-success" style={{fontSize: '1.1rem'}}>{pay.amount} DH</span></td>
                                        <td>
                                            <span className="badge badge-light text-dark border p-2 px-3 fw-bold">
                                                {pay.payment_method?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-muted small">{new Date(pay.payment_date).toLocaleDateString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-dark me-2 border-0" onClick={() => handlePrint(pay)}>
                                                <Printer size={18} className="text-primary"/>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(pay.id)}>
                                                <Trash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Aucun versement enregistré.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel border-0" centered size="lg">
                <Modal.Header closeButton className="border-bottom border-light">
                    <Modal.Title className="fw-bold"><Wallet className="me-2 text-primary" /> Nouveau Versement</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <Form.Label className="small fw-bold text-muted">SÉLECTIONNER L'ÉLÈVE</Form.Label>
                                <Form.Select required value={formData.candidate_id} onChange={e => setFormData({...formData, candidate_id: e.target.value})}>
                                    <option value="">Choisir un candidat...</option>
                                    {candidates.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.user?.name} (Restant: {c.remaining_balance} DH)
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">MONTANT VERSÉ (DH)</Form.Label>
                                <Form.Control required type="number" min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="fw-bold text-success fs-5" />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label className="small fw-bold text-muted">MODE DE PAIEMENT</Form.Label>
                                <Form.Select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                                    <option value="cash">Espèces</option>
                                    <option value="virement">Virement</option>
                                    <option value="cheque">Chèque</option>
                                </Form.Select>
                            </div>
                            <div className="col-12 mb-3">
                                <Form.Label className="small fw-bold text-muted">DATE DU VERSEMENT</Form.Label>
                                <Form.Control required type="date" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} />
                            </div>
                            <div className="col-12 mb-3">
                                <Form.Label className="small fw-bold text-muted">OBSERVATIONS (OPTIONNEL)</Form.Label>
                                <Form.Control as="textarea" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Notes libres..." />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-4 pt-3 border-top gap-2">
                            <Button variant="light" className="px-4 fw-bold" onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button className="btn-primary-custom px-4" type="submit">VALIDER LE PAIEMENT</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* PRINT VIEW */}
            <div className="print-only" style={{ display: 'none' }}>
                {selectedPaymentForPrint && (
                    <div className="receipt-container" style={{ color: '#000', maxWidth: '210mm', margin: '0 auto', padding: '20mm', fontFamily: 'Arial, sans-serif' }}>
                        
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-4" style={{ borderBottom: '3px solid #000', paddingBottom: '15px' }}>
                            <div>
                                <h1 className="fw-bolder mb-0" style={{ fontSize: '2.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    <span style={{color: '#C0392B'}}>JAN</span>OUB
                                </h1>
                                <p className="fw-bold mb-0" style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>AUTO ÉCOLE & SERVICES</p>
                            </div>
                            <div className="text-end" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                <div className="fw-bold mb-1">KLIAA SIDI OUASSEL I, Safi 46050</div>
                                <div>Tél : <span className="fw-bold">06 61 99 54 86</span></div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-5">
                            <h2 className="fw-bolder d-inline-block px-4 py-2" style={{ border: '2px solid #000', borderRadius: '5px', letterSpacing: '2px' }}>REÇU DE PAIEMENT</h2>
                            <p className="mt-2 fw-bold text-muted mb-0" style={{ fontSize: '1.1rem' }}>Réf: REC-{String(selectedPaymentForPrint.id).padStart(5, '0')}</p>
                        </div>

                        {/* Info Boxes */}
                        <div className="d-flex justify-content-between mb-5">
                            <div style={{ width: '48%', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                                <p className="mb-1 text-muted fw-bold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Délivré à l'élève :</p>
                                <h4 className="fw-bold mb-1" style={{ textTransform: 'uppercase' }}>{selectedPaymentForPrint.candidate?.user?.name || '....................................'}</h4>
                                <p className="mb-0 fw-medium" style={{ fontSize: '0.95rem' }}>CIN : {selectedPaymentForPrint.candidate?.cin || '.................'}</p>
                            </div>
                            <div style={{ width: '48%', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                                <p className="mb-1 text-muted fw-bold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date d'encaissement :</p>
                                <h4 className="fw-bold mb-1">
                                    {new Date(selectedPaymentForPrint.payment_date).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    })}
                                </h4>
                                <p className="mb-0 fw-medium" style={{ fontSize: '0.95rem' }}>
                                    Mode de paiement : <span className="fw-bold">{selectedPaymentForPrint.payment_method?.toUpperCase()}</span>
                                </p>
                            </div>
                        </div>

                        {/* Amount Box */}
                        <div className="d-flex justify-content-between align-items-center mb-5" style={{ border: '2px solid #000', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div>
                                <h5 className="m-0 fw-bold" style={{ letterSpacing: '1px' }}>SOMME VERSÉE :</h5>
                            </div>
                            <div className="text-end">
                                <h1 className="m-0 fw-bolder" style={{ fontSize: '3.5rem', color: '#000' }}>
                                    {selectedPaymentForPrint.amount} <small style={{ fontSize: '1.5rem', verticalAlign: 'top' }}>DH</small>
                                </h1>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="row mt-5 pt-4">
                            <div className="col-6 text-center">
                                <p className="fw-bold mb-5" style={{ fontSize: '0.9rem' }}>Signature de l'élève</p>
                                <div style={{ borderBottom: '1px dashed #000', width: '60%', margin: '0 auto', marginTop: '60px' }}></div>
                            </div>
                            <div className="col-6 text-center">
                                <p className="fw-bold mb-5" style={{ fontSize: '0.9rem' }}>Cachet & Signature de la Direction</p>
                                <div style={{ borderBottom: '1px dashed #000', width: '60%', margin: '0 auto', marginTop: '60px' }}></div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-5 pt-5 text-center text-muted" style={{ fontSize: '0.8rem', borderTop: '1px solid #eee' }}>
                            Merci de votre confiance. Ce reçu justifie votre paiement, veuillez le conserver précieusement.
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: A4 portrait; }
                    body { background: white !important; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; width: 100%; height: 100%; }
                    .glass-panel, .navbar, .sidebar { display: none !important; }
                    .receipt-container { padding-top: 15mm !important; }
                }
            `}</style>
        </div>
    );
};

export default Payments;
