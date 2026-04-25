import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CreditCard, FileText, Download, Wallet, CheckCircle } from 'lucide-react';

const FinanceCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="col-md-4 mb-4">
        <div className="bg-white p-4 h-100 border-0 shadow-sm rounded-5 transition-all hover-up position-relative overflow-hidden">
            <div className="position-absolute" style={{ top: '-10px', right: '-10px', opacity: 0.05, color }}>
                <Icon size={80} />
            </div>
            <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-4 me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: `${color}15`, color, width: '42px', height: '42px' }}>
                    <Icon size={22} />
                </div>
                <h6 className="text-muted fw-bold small m-0 uppercase" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>{title}</h6>
            </div>
            <div className="d-flex flex-column">
                <h3 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-1px' }}>{value}</h3>
                <div className="text-muted mt-1 fw-medium" style={{fontSize: '0.7rem'}}>{subtitle}</div>
            </div>
        </div>
    </div>
);

const CandidatePayments = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/candidate/payments').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning border-3" style={{width: '3rem', height: '3rem'}}></div></div>;

    if (!data || !data.summary) return (
        <div className="text-center py-5 bg-white rounded-5 shadow-sm border-0">
            <h6 className="text-muted">Aucune donnée de paiement disponible.</h6>
        </div>
    );

    return (
        <div className="animate-fade-in container-fluid px-0">
            <div className="mb-4">
                <h5 className="fw-bold m-0 border-start border-4 border-warning ps-3 text-dark">Ma Finance <span className="text-muted fw-normal fs-6 ms-2">/ Paiements & Reçus</span></h5>
            </div>

            <div className="row g-2 mb-2">
                <FinanceCard 
                    title="Total Formation" 
                    value={`${Math.round(data.summary.total)} DH`} 
                    subtitle="Prix global convenu"
                    icon={CreditCard} color="#6c757d" />
                
                <FinanceCard 
                    title="Montant Réglé" 
                    value={`${Math.round(data.summary.paid)} DH`} 
                    subtitle="Total des versements"
                    icon={Wallet} color="#27AE60" />

                <FinanceCard 
                    title="Reste à Payer" 
                    value={`${Math.round(data.summary.remaining)} DH`} 
                    subtitle="Reliquat à solder"
                    icon={CheckCircle} color={data.summary.remaining > 0 ? "#dc3545" : "#27AE60"} />
            </div>

            <div className="row mt-2">
                <div className="col-12">
                    <div className="bg-white p-0 rounded-5 shadow-sm border-0 overflow-hidden">
                        <div className="p-4 p-md-5 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold m-0 text-dark d-flex align-items-center">
                                <FileText size={20} className="me-2 text-muted" /> 
                                Historique des versements
                            </h5>
                            <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-muted small" style={{fontSize: '0.65rem'}}>IMPRIMER TOUT</button>
                        </div>
                        <div className="table-responsive px-4 px-md-5 pb-5 mt-4">
                            <table className="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr className="border-bottom-0">
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3" style={{letterSpacing: '1px'}}>Date du versement</th>
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3" style={{letterSpacing: '1px'}}>Désignation</th>
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3" style={{letterSpacing: '1px'}}>Mode</th>
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3 text-end" style={{letterSpacing: '1px'}}>Montant</th>
                                        <th className="border-0 text-muted fw-bold uppercase small pb-3 text-end" style={{letterSpacing: '1px'}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.history.length > 0 ? data.history.map((p, idx) => (
                                        <tr key={p.id} className="border-bottom border-light">
                                            <td className="py-3 text-muted small">{new Date(p.payment_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                            <td className="py-3">
                                                <div className="fw-bold text-dark small">
                                                    {idx === data.history.length - 1 ? 'Inscription & Frais de dossier' : 
                                                     idx === 0 && data.summary.remaining === 0 ? 'Sclode final de formation' : `Virement / Versement #${data.history.length - idx}`}
                                                </div>
                                                <div className="text-muted" style={{fontSize: '0.65rem'}}>ID Paiement: #{p.id.toString().padStart(5, '0')}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className="badge bg-light text-muted rounded-pill px-2 py-1 uppercase" style={{fontSize: '0.6rem'}}>{p.payment_method === 'cash' ? 'Cash' : 'Virement'}</span>
                                            </td>
                                            <td className="py-3 text-end fw-bold text-dark small">{Math.round(p.amount)} DH</td>
                                            <td className="py-3 text-end">
                                                <button className="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold shadow-sm" style={{fontSize: '0.65rem'}}>
                                                    <Download size={12} className="me-1" /> Reçu PDF
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted small">Aucun paiement trouvé.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important; }
                .uppercase { text-transform: uppercase; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                .custom-table tr:hover { background-color: #fafbfc; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CandidatePayments;
