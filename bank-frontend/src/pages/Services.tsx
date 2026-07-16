import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
} from '../services/api';

interface CustomerForm {
  username: string;
  password: string;
  checkingBalance: string;
  savingsBalance: string;
}

const emptyForm: CustomerForm = {
  username: '',
  password: '',
  checkingBalance: '0',
  savingsBalance: '0',
};

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

function Services() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingCustomerId, setEditingCustomerId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const updateFormField = (
    field: keyof CustomerForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCustomerId(null);
    setStatus(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const checkingBalance = Number(form.checkingBalance);
    const savingsBalance = Number(form.savingsBalance);

    if (!form.username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!editingCustomerId && !form.password.trim()) {
      setError('Password is required for a new customer.');
      return;
    }

    if (
      Number.isNaN(checkingBalance) ||
      checkingBalance < 0 ||
      Number.isNaN(savingsBalance) ||
      savingsBalance < 0
    ) {
      setError('Account balances cannot be negative.');
      return;
    }

    const existingCustomer = customers.find(
      (customer) => customer.id === editingCustomerId
    );

    const customerData: Customer = {
      username: form.username.trim(),

      /*
       * During editing, enter a password if your backend requires
       * one to be included in the PUT request.
       */
      password:
        form.password.trim() ||
        existingCustomer?.password ||
        undefined,

      checkingAccount: {
        accountNumber:
          existingCustomer?.checkingAccount?.accountNumber ||
          `CHK-${Date.now()}`,
        balance: checkingBalance,
        accountType: 'CHECKING',
        transactionHistory:
          existingCustomer?.checkingAccount?.transactionHistory || [],
      },

      savingsAccount: {
        accountNumber:
          existingCustomer?.savingsAccount?.accountNumber ||
          `SAV-${Date.now()}`,
        balance: savingsBalance,
        accountType: 'SAVINGS',
        transactionHistory:
          existingCustomer?.savingsAccount?.transactionHistory || [],
      },
    };

    try {
      setSaving(true);
      setError(null);
      setStatus(null);

      if (editingCustomerId) {
        await updateCustomer(
          editingCustomerId,
          customerData
        );

        setStatus('Customer updated successfully.');
      } else {
        await createCustomer(customerData);
        setStatus('Customer created successfully.');
      }

      setForm(emptyForm);
      setEditingCustomerId(null);

      await loadCustomers();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    if (!customer.id) {
      return;
    }

    setEditingCustomerId(customer.id);

    setForm({
      username: customer.username,
      password: '',
      checkingBalance: String(
        customer.checkingAccount?.balance ?? 0
      ),
      savingsBalance: String(
        customer.savingsAccount?.balance ?? 0
      ),
    });

    setError(null);
    setStatus('Editing customer.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (customer: Customer) => {
    if (!customer.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete customer "${customer.username}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setStatus(null);

      await deleteCustomer(customer.id);

      setStatus('Customer deleted successfully.');

      if (editingCustomerId === customer.id) {
        resetForm();
      }

      await loadCustomers();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <main className="customer-services-page">
      <section className="customer-form-section">
        <div className="services-heading">
          <div>
            <h1>Customer Services</h1>
            <p>
              Create, view, update, and delete bank customers.
            </p>
          </div>

          {editingCustomerId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          className="customer-form"
          onSubmit={handleSubmit}
        >
          <label>
            Username
            <input
              type="text"
              value={form.username}
              onChange={(event) =>
                updateFormField(
                  'username',
                  event.target.value
                )
              }
              placeholder="Enter username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                updateFormField(
                  'password',
                  event.target.value
                )
              }
              placeholder={
                editingCustomerId
                  ? 'Enter a new password'
                  : 'Enter password'
              }
            />
          </label>

          <label>
            Checking Balance
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.checkingBalance}
              onChange={(event) =>
                updateFormField(
                  'checkingBalance',
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Savings Balance
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.savingsBalance}
              onChange={(event) =>
                updateFormField(
                  'savingsBalance',
                  event.target.value
                )
              }
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : editingCustomerId
                ? 'Update Customer'
                : 'Create Customer'}
          </button>
        </form>

        {status && (
          <p className="service-status">{status}</p>
        )}

        {error && (
          <p className="service-error">{error}</p>
        )}
      </section>

      <section className="customer-list-section">
        <div className="services-heading">
          <div>
            <h2>Customers</h2>
            <p>{customers.length} customer(s) found</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadCustomers}
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <p>Loading customers…</p>
        ) : customers.length === 0 ? (
          <p>No customers have been created.</p>
        ) : (
          <div className="customer-grid">
            {customers.map((customer) => (
              <article
                className="customer-card"
                key={customer.id}
              >
                <div className="customer-card-header">
                  <div>
                    <h3>{customer.username}</h3>
                    <p className="customer-id">
                      ID: {customer.id}
                    </p>
                  </div>
                </div>

                <div className="customer-balances">
                  <div>
                    <span>Checking</span>
                    <strong>
                      {formatMoney(
                        customer.checkingAccount?.balance
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Savings</span>
                    <strong>
                      {formatMoney(
                        customer.savingsAccount?.balance
                      )}
                    </strong>
                  </div>
                </div>

                <div className="customer-card-actions">
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => handleEdit(customer)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(customer)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Services;