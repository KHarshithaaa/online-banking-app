import { useState } from 'react';

const API_BASE = "http://localhost:8081/api";

export default function App() {
  const [account, setAccount] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [amount, setAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (authMode === 'register') {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Registration failed");
        alert("Account Created Successfully! Please Login.");
        setAuthMode('login');
      } else {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        if (!res.ok) throw new Error("Invalid credentials");
        const data = await res.json();
        setAccount(data);
        fetchHistory(data.accountNumber);
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const refreshBalance = async () => {
    if (!account) return;
    const res = await fetch(`${API_BASE}/accounts/${account.accountNumber}/balance`);
    const data = await res.json();
    setAccount(data);
  };

  const fetchHistory = async (accNum) => {
    const res = await fetch(`${API_BASE}/transactions/history/${accNum}`);
    const data = await res.json();
    setHistory(data);
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return;
    await fetch(`${API_BASE}/transactions/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountNumber: account.accountNumber, amount: Number(amount) })
    });
    setAmount('');
    refreshBalance();
    fetchHistory(account.accountNumber);
  };

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) return;
    await fetch(`${API_BASE}/transactions/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountNumber: account.accountNumber, amount: Number(amount) })
    });
    setAmount('');
    refreshBalance();
    fetchHistory(account.accountNumber);
  };

  const handleTransfer = async () => {
    if (!amount || !transferTo) return;
    await fetch(`${API_BASE}/transactions/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAccount: account.accountNumber,
        toAccount: transferTo,
        amount: Number(amount)
      })
    });
    setAmount('');
    setTransferTo('');
    refreshBalance();
    fetchHistory(account.accountNumber);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 800, margin: '20px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', color: '#1e3a8a' }}>Online Banking System</h1>

      {!account ? (
        <div style={{ border: '1px solid #ccc', padding: 25, borderRadius: 8, maxWidth: 360, margin: 'auto' }}>
          <h2>{authMode === 'login' ? 'Login' : 'Open New Account'}</h2>
          {message && <p style={{ color: 'red' }}>{message}</p>}
          <form onSubmit={handleAuth}>
            {authMode === 'register' && (
              <div style={{ marginBottom: 10 }}>
                <label>Full Name</label>
                <input
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}
            <div style={{ marginBottom: 10 }}>
              <label>Email</label>
              <input
                style={{ width: '100%', padding: 8, marginTop: 4 }}
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Password</label>
              <input
                style={{ width: '100%', padding: 8, marginTop: 4 }}
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <button style={{ width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}>
              {authMode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </form>
          <p style={{ marginTop: 15, textAlign: 'center', cursor: 'pointer', color: '#2563eb' }}
             onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setMessage(''); }}>
            {authMode === 'login' ? "Don't have an account? Register" : "Already registered? Login"}
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: 10 }}>
            <div>
              <h2>Welcome, {account.user?.name || "Customer"}!</h2>
              <p>Account Number: <b>{account.accountNumber}</b></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ color: '#059669' }}>Balance: ${account.balance}</h2>
              <button onClick={() => setAccount(null)} style={{ padding: '5px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4 }}>Logout</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
            <div style={{ border: '1px solid #e5e7eb', padding: 15, borderRadius: 8 }}>
              <h3>Deposit / Withdraw</h3>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '90%', padding: 8, marginBottom: 10 }}
              />
              <div>
                <button onClick={handleDeposit} style={{ padding: '8px 15px', marginRight: 10, background: '#059669', color: '#fff', border: 'none', borderRadius: 4 }}>Deposit</button>
                <button onClick={handleWithdraw} style={{ padding: '8px 15px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 4 }}>Withdraw</button>
              </div>
            </div>

            <div style={{ border: '1px solid #e5e7eb', padding: 15, borderRadius: 8 }}>
              <h3>Fund Transfer</h3>
              <input
                type="text"
                placeholder="Recipient Account Number"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                style={{ width: '90%', padding: 8, marginBottom: 10 }}
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '90%', padding: 8, marginBottom: 10 }}
              />
              <button onClick={handleTransfer} style={{ padding: '8px 15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}>Send Money</button>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <h3>Transaction History</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: 10 }}>Type</th>
                  <th style={{ padding: 10 }}>Amount</th>
                  <th style={{ padding: 10 }}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: 10, textAlign: 'center' }}>No transactions recorded yet</td></tr>
                ) : (
                  history.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: 10, fontWeight: 'bold' }}>{tx.transactionType}</td>
                      <td style={{ padding: 10, color: tx.transactionType === 'DEPOSIT' ? '#059669' : '#dc2626' }}>${tx.amount}</td>
                      <td style={{ padding: 10 }}>{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}