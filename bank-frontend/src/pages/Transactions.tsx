import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getTransactions,
  type Transaction,
} from '../services/api';

interface TransactionsProps {
  username: string;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const formatDate = (timestamp?: string) => {
  if (!timestamp) {
    return 'Date unavailable';
  }

  return new Date(timestamp).toLocaleString();
};

function Transactions({ username }: TransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    setLoading(true);
    setError(null);

    getTransactions(username)
      .then(setTransactions)
      .catch((error: Error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <main className="transactions-page">
      <div className="transactions-page-header">
        <div>
          <h2>Transaction History</h2>
          <p>View deposits, withdrawals, and transfers from all accounts.</p>
        </div>

        <Link className="back-button" to="/">
          Back to dashboard
        </Link>
      </div>

      {loading && <p>Loading transactions…</p>}

      {error && (
        <p className="transaction-error">
          Error: {error}
        </p>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p>No transactions found.</p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={`${transaction.timestamp}-${index}`}>
                  <td>{formatDate(transaction.timestamp)}</td>

                  <td>
                    {transaction.type.replaceAll('_', ' ')}
                  </td>

                  <td>{transaction.accountType}</td>

                  <td
                    className={
                      transaction.type === 'DEPOSIT' ||
                      transaction.type === 'TRANSFER_IN'
                        ? 'positive-amount'
                        : 'negative-amount'
                    }
                  >
                    {transaction.type === 'DEPOSIT' ||
                    transaction.type === 'TRANSFER_IN'
                      ? '+'
                      : '-'}
                    {formatMoney(Math.abs(transaction.amount))}
                  </td>

                  <td>{formatMoney(transaction.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Transactions;