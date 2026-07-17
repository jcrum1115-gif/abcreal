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

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = selected?.username
    ? selected.username.charAt(0).toUpperCase() + selected.username.slice(1)
    : '';

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  if (loadingCustomers) return (
    <main className="dashboard">
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading your accounts…</p>
      </div>
    </main>
  );
  if (error) return <main className="dashboard"><p className="dashboard-error">Error: {error}</p></main>;

  return (
    <main className="dashboard">
      <div className="greeting-block">
        <div>
          <h2 className="greeting">{getGreeting()}{displayName ? `, ${displayName}` : ''} 👋</h2>
          <p className="greeting-sub">{todayLabel}</p>
        </div>
      </div>

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
                <span className="account-name">{acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()}</span>
                <span className="account-number">••{acc.accountNumber?.slice(-4)}</span>
              </div>
              <div className="account-balance">{fmt(acc.balance)}</div>
              <div className="account-card-label">Available balance</div>
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
                <div className="action-field">
                  <label>From Account</label>
                  <p className="action-field-value">
                    {selectedAccount?.accountType} (••{selectedAccount?.accountNumber?.slice(-4)})
                  </p>
                </div>
                <div className="action-field">
                  <label>To Account</label>
                  <select
                    className="action-select"
                    value={transferToAccountIdx ?? ''}
                    onChange={(e) => setTransferToAccountIdx(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">Select destination account</option>
                    {selected?.__accounts?.map((acc, idx) => (
                      idx !== selectedAccountIdx && (
                        <option key={idx} value={idx}>
                          {acc.accountType} (••{acc.accountNumber?.slice(-4)})
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <input
                  className="action-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  onFocus={() => setActionStatus(null)}
                />
                <div className="actions-grid">
                  <button className="action-btn action-btn--confirm" onClick={handleTransfer}>Confirm</button>
                  <button className="action-btn action-btn--cancel" onClick={() => { setAction(null); setActionAmount(''); setTransferToAccountIdx(null); setActionStatus(null); }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <input
                  className="action-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  onFocus={() => setActionStatus(null)}
                />
                <div className="actions-grid">
                  <button className="action-btn action-btn--deposit" onClick={() => handleAction('deposit')}>⬇ Deposit</button>
                  <button className="action-btn action-btn--withdraw" onClick={() => handleAction('withdraw')}>⬆ Withdraw</button>
                  <button className="action-btn action-btn--transfer" onClick={() => { setAction('transfer'); setActionAmount(''); setActionStatus(null); }}>⇄ Transfer</button>
                  <Link className="action-btn action-btn--history" to="/transactions">☰ History</Link>
                </div>
              </>
            )}
            {actionStatus && (
              <p className={`action-status${actionStatus.toLowerCase().includes('error') || actionStatus.toLowerCase().includes('invalid') || actionStatus.toLowerCase().includes('enter') ? ' action-status--error' : ' action-status--ok'}`}>{actionStatus}</p>
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
                    <span className="tx-desc">{tx.type.replaceAll('_', ' ')}</span>
                    <span className="tx-date">{new Date(tx.timestamp).toLocaleString()}</span>
                    <span className="tx-account-tag">{tx.accountType}</span>
                  </div>
                  <span className={`tx-amount ${tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? 'credit' : 'debit'}`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? '+' : '-'}{fmt(tx.amount)}
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
