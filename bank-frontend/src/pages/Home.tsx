import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { FC } from 'react';
import {
  getCustomer,
  getTransactions,
  deposit,
  withdraw,
  transfer,
  type Customer,
  type BankAccount,
  type Transaction,
} from '../services/api';
interface HomeProps {
  customerId: string;
}
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const Home: FC<HomeProps> = ({ customerId }) => {
  const [customers, setCustomers]       = useState<(Customer & { __accounts: BankAccount[] })[]>([]);
  const [selectedIdx, setSelectedIdx]   = useState(0);
  const [selectedAccountIdx, setSelectedAccountIdx] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingTx, setLoadingTx]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [action, setAction]             = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [transferToAccountIdx, setTransferToAccountIdx] = useState<number | null>(null);

  // Load customer on mount
  useEffect(() => {
    if (!customerId) return;
    setLoadingCustomers(true);
    getCustomer(customerId)
      .then((customer) => {
        // Flatten nested accounts into a single array
        const withAccounts = [{
          ...customer,
          __accounts: [
            ...(customer.checkingAccount ? [customer.checkingAccount] : []),
            ...(customer.savingsAccount ? [customer.savingsAccount] : []),
            ...(customer.creditAccount ? [customer.creditAccount] : []),
          ],
        }];
        setCustomers(withAccounts);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingCustomers(false));
  }, [customerId]);

  // Load transactions when selected account changes
  useEffect(() => {
    if (customers.length === 0) return;
    if (selectedIdx >= customers.length) return;
    
    setLoadingTx(true);
    const customer = customers[selectedIdx];
    const account = customer.__accounts?.[selectedAccountIdx];
    
    if (account?.transactionHistory) {
      setTransactions(account.transactionHistory);
      setLoadingTx(false);
    } else {
      getTransactions(customer.username)
        .then(setTransactions)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoadingTx(false));
    }
  }, [selectedIdx, selectedAccountIdx, customers]);

    const selected = customers[selectedIdx];
    const selectedAccount = selected?.__accounts[selectedAccountIdx];
    const selectedCustomerId = selected?.id;
    const selectedCustomerUsername = selected?.username;

  // Quick-action handlers
  const handleAction = async (action: 'deposit' | 'withdraw') => {
    if (
    !selected ||
    !selectedAccount ||
    !selectedCustomerId ||
    !selectedCustomerUsername
    ) return;
    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) { setActionStatus('Enter a valid amount.'); return; }
    try {
      const accountType = selectedAccount.accountType.toLowerCase();
      await (action === 'deposit'
        ? deposit(selectedCustomerId, amount, accountType)
        : withdraw(selectedCustomerId, amount, accountType));
      
      setActionAmount('');
      setActionStatus(`${action === 'deposit' ? 'Deposited' : 'Withdrew'} ${fmt(amount)} successfully.`);
      
      // Reload customer to get updated balances
      const updatedCustomer = await getCustomer(selectedCustomerId);
      const updated = [updatedCustomer];
      const withAccounts = updated.map((c) => ({
        ...c,
        __accounts: [
          ...(c.checkingAccount ? [c.checkingAccount] : []),
          ...(c.savingsAccount ? [c.savingsAccount] : []),
          ...(c.creditAccount ? [c.creditAccount] : []),
        ],
      }));
      setCustomers(withAccounts);
    } catch (e: unknown) {
      setActionStatus((e as Error).message);
    }
  };

  const handleTransfer = async () => {
    if (
        !selected ||
        !selectedAccount ||
        !selectedCustomerId ||
        !selectedCustomerUsername ||
        transferToAccountIdx === null
        ) return;
    const toAccount = selected?.__accounts[transferToAccountIdx];
    if (!toAccount) return;
    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) { setActionStatus('Enter a valid amount.'); return; }
    try {
      const fromType = selectedAccount.accountType.toLowerCase();
      const toType = toAccount.accountType.toLowerCase();
      await transfer(
            selectedCustomerId,
            fromType,
            toType,
            amount
            );
      
      setActionAmount('');
      setAction(null);
      setTransferToAccountIdx(null);
      setActionStatus(`Transferred ${fmt(amount)} successfully.`);
      
      // Reload customer to get updated balances
      const updatedCustomer = await getCustomer(selectedCustomerId);
      const updated = [updatedCustomer];
      const withAccounts = updated.map((c) => ({
        ...c,
        __accounts: [
          ...(c.checkingAccount ? [c.checkingAccount] : []),
          ...(c.savingsAccount ? [c.savingsAccount] : []),
          ...(c.creditAccount ? [c.creditAccount] : []),
        ],
      }));
      setCustomers(withAccounts);
    } catch (e: unknown) {
      setActionStatus((e as Error).message);
    }
  };

  if (loadingCustomers) return <main className="dashboard"><p>Loading accounts…</p></main>;
  if (error) return <main className="dashboard"><p style={{ color: 'red' }}>Error: {error}</p></main>;

  return (
    <main className="dashboard">
      <h2 className="greeting">Good morning 👋</h2>

      <section className="accounts">
        <h3>Your Accounts</h3>
        <div className="accounts-grid">
          {selected?.__accounts?.map((acc, idx) => (
            <button
              key={`${selectedIdx}-${idx}`}
              className={`account-card ${acc.accountType.toLowerCase()}${idx === selectedAccountIdx ? ' selected' : ''}`}
              onClick={() => setSelectedAccountIdx(idx)}
            >
              <div className="account-card-header">
                <span className="account-name">{acc.accountType}</span>
                <span className="account-number">{acc.accountNumber}</span>
              </div>
              <div className="account-balance">{fmt(acc.balance)}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="dashboard-bottom">
        <div className="left-panel">
          <section className="quick-actions">
            <h3>Quick Actions</h3>
            {action === 'transfer' ? (
              <>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: '#4a5568' }}>
                    From Account
                  </label>
                  <p style={{ margin: '0', padding: '0.5rem', background: '#f7fafc', borderRadius: '6px', fontSize: '0.9rem' }}>
                    {selectedAccount?.accountType} ({selectedAccount?.accountNumber})
                  </p>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: '#4a5568' }}>
                    To Account
                  </label>
                  <select
                    value={transferToAccountIdx ?? ''}
                    onChange={(e) => setTransferToAccountIdx(e.target.value ? parseInt(e.target.value) : null)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e0',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select destination account</option>
                    {selected?.__accounts?.map((acc, idx) => (
                      idx !== selectedAccountIdx && (
                        <option key={idx} value={idx}>
                          {acc.accountType} ({acc.accountNumber})
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  onFocus={() => setActionStatus(null)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e0',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
                <div className="actions-grid">
                  <button className="action-btn" onClick={handleTransfer}>Confirm</button>
                  <button className="action-btn" onClick={() => { setAction(null); setActionAmount(''); setTransferToAccountIdx(null); setActionStatus(null); }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  onFocus={() => setActionStatus(null)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e0',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
                <div className="actions-grid">
                  <button className="action-btn" onClick={() => handleAction('deposit')}>Deposit</button>
                  <button className="action-btn" onClick={() => handleAction('withdraw')}>Withdraw</button>
                  <button className="action-btn" onClick={() => { setAction('transfer'); setActionAmount(''); setActionStatus(null); }}>Transfer</button>
                  <Link className="action-btn" to="/transactions"> Transactions </Link></div>
              </>
            )}
            {actionStatus && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#4a5568' }}>{actionStatus}</p>
            )}
          </section>

          {selectedAccount && (
            <section className="summary">
              <h3>Selected Account</h3>
              <p className="summary-name">
                {selectedAccount.accountType} <span>{selectedAccount.accountNumber}</span>
              </p>
              <p className="summary-balance">{fmt(selectedAccount.balance)}</p>
            </section>
          )}
        </div>

        <section className="transactions">
          <h3>Recent Transactions</h3>
          {loadingTx ? (
            <p>Loading transactions…</p>
          ) : transactions.length === 0 ? (
            <p style={{ color: '#a0aec0', padding: '1rem 0' }}>No transactions found.</p>
          ) : (
            <ul className="tx-list">
              {transactions.map((tx, idx) => (
                <li key={`${idx}-${tx.timestamp}`} className="tx-item">
  <div className="tx-info">
    <span className="tx-desc">
      {tx.type.replace('_', ' ')}
    </span>

    <span className="tx-date">
      {new Date(tx.timestamp).toLocaleString()}
    </span>

    <span
      style={{
        fontSize: '0.8rem',
        color: '#718096'
      }}
    >
      {tx.accountType}
    </span>
  </div>

  <span
    className={`tx-amount ${
      tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN'
        ? 'positive-amount'
        : 'negative-amount'
    }`}
  >
    {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN'
      ? '+'
      : '-'}
    {fmt(tx.amount)}
  </span>
</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default Home;
