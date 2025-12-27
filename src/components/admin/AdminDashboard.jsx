import { FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAllTransactions } from '../../services/api';

const TransactionModal = ({ txn, onClose }) => {
    if(!txn) return null;
    const { V1, V2, V3, ...otherVs } = txn.payload; // Destructure a few, keep rest
    
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
               <h2 style={{margin:0}}>Transaction Details</h2>
               <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer'}}><X /></button>
           </div>

           <div className="detail-row"><span className="detail-label">ID:</span> <span>{txn.transaction_id}</span></div>
           <div className="detail-row"><span className="detail-label">Merchant:</span> <span>{txn.merchant_username}</span></div>
           <div className="detail-row"><span className="detail-label">Time:</span> <span>{new Date(txn.timestamp).toLocaleString()}</span></div>
           <div className="detail-row" style={{fontSize:'1.2rem'}}>
               <span className="detail-label">Amount:</span> 
               <strong>${txn.payload.Amount.toFixed(2)}</strong>
           </div>

           <div style={{margin:'20px 0', padding:'15px', background: txn.risk_label === 'high' ? '#fee2e2' : '#f1f5f9', borderRadius:'8px'}}>
               <div className="detail-row"><span className="detail-label">Risk Score:</span> <strong>{(txn.fraud_probability * 100).toFixed(2)}%</strong></div>
               <div className="detail-row"><span className="detail-label">Status:</span> <span className={`status-label status-${txn.risk_label}`}>{txn.risk_label}</span></div>
               <p style={{fontSize:'0.9rem', marginTop:'10px'}}><em>Insight: {txn.explanation}</em></p>
           </div>

           <h4>Technical Vector Payload (V1-V28)</h4>
           <div className="v-grid-modal">
               {/* Show V1-V28. If they don't exist in payload, show N/A */}
               {Array.from({length: 28}, (_, i) => i + 1).map(num => {
                   const key = `V${num}`;
                   const val = txn.payload[key] !== undefined && txn.payload[key] !== null ? Number(txn.payload[key]).toFixed(4) : 'N/A';
                   return <div key={key} className="v-item"><strong>{key}:</strong> <br/>{val}</div>
               })}
           </div>
        </div>
      </div>
    );
}

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, moderate: 0, low: 0 });
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAllTransactions();
    setTransactions(data);
    
    // Calculate Stats
    const counts = data.reduce((acc, curr) => {
        acc[curr.risk_label]++;
        return acc;
    }, { high: 0, moderate: 0, low: 0 });
    setStats({ total: data.length, ...counts });
  };

  // Chart Data prep
  const chartData = [
    { name: 'Low Risk', value: stats.low, color: '#10b981' },
    { name: 'Moderate', value: stats.moderate, color: '#f59e0b' },
    { name: 'High Risk', value: stats.high, color: '#ef4444' },
  ];

  return (
    <div>
      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Transactions</h3><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><h3>Healthy (Low Risk)</h3><div className="stat-value" style={{color:'#10b981'}}>{stats.low}</div></div>
        <div className="stat-card"><h3>Moderate Warnings</h3><div className="stat-value" style={{color:'#f59e0b'}}>{stats.moderate}</div></div>
        <div className="stat-card"><h3>High Risk Blocked</h3><div className="stat-value" style={{color:'#ef4444'}}>{stats.high}</div></div>
      </div>

      {/* CHARTS SECTION */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'30px'}}>
          {/* Pie Chart - Risk Distribution */}
          <div className="table-container" style={{height:'300px'}}>
              <h4 style={{margin:'0 0 20px 0'}}>Risk Distribution %</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                </PieChart>
              </ResponsiveContainer>
          </div>
          {/* Simple Bar Chart Example */}
          <div className="table-container" style={{height:'300px'}}>
               <h4 style={{margin:'0 0 20px 0'}}>Volume by Risk Category</h4>
               <ResponsiveContainer width="100%" height="90%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} >
                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
          </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="table-container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h3 style={{margin:0}}>Recent Transactions</h3>
            <button onClick={loadData} style={{background:'none', border:'1px solid #e2e8f0', padding:'8px 12px', borderRadius:'6px', cursor:'pointer'}}>Refresh</button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map((txn) => ( // Show top 10 recent
              <tr key={txn.transaction_id} onClick={() => setSelectedTxn(txn)}>
                <td style={{fontFamily:'monospace'}}>{txn.transaction_id}</td>
                <td>{new Date(txn.timestamp).toLocaleTimeString()}</td>
                <td>{txn.merchant_username}</td>
                <td><strong>${txn.payload.Amount.toFixed(2)}</strong></td>
                <td>{(txn.fraud_probability * 100).toFixed(1)}%</td>
                <td><span className={`status-label status-${txn.risk_label}`}>{txn.risk_label}</span></td>
                <td><FileText size={16} color="var(--text-light)" /></td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan="7" style={{textAlign:'center'}}>No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
      
      {/* MODAL */}
      <TransactionModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />

    </div>
  );
};

export default AdminDashboard;