const BASE = '/api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BankAccount {
  accountNumber: string;
  balance: number;
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT';
  interestRate?: number;
  transactionHistory?: Transaction[];
}

export interface Customer {
  id?: string;
  username: string;
  password?: string;
  checkingAccount?: BankAccount;
  savingsAccount?: BankAccount;
  creditAccount?: BankAccount;
}

export interface Transaction {
  id?: string;
  type:
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'TRANSFER_OUT'
    | 'TRANSFER_IN'
    | string;
  accountType: 'CHECKING' | 'SAVINGS' | string;
  amount: number;
  balanceAfter: number;
  timestamp: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  const text = await res.text();
  if (!text || text.trim() === '') {
    // Empty response is OK (e.g., deposit/withdraw return 200 with no body)
    console.log(`✓ ${options?.method} ${BASE}${path} - Success (empty response)`);
    return undefined as T;
  }
  try {
    const data = JSON.parse(text) as T;
    console.log(`✓ ${options?.method} ${BASE}${path}`, data);
    return data;
  } catch (e) {
    console.error('Failed to parse JSON:', text, e);
    return undefined as T;
  }
}

// ── Customers ────────────────────────────────────────────────────────────────

export const login = (username: string, password: string) =>
  request<Customer>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getCustomers = () =>
  request<Customer[]>('/customers');

export const getCustomer = (id: string | number) =>
  request<Customer>(`/customers/${id}`);

export const createCustomer = (data: Omit<Customer, 'id'>) =>
  request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) });

export const updateCustomer = (id: string, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCustomer = (id: string) =>
    request<void>(`/customers/${id}`, { method: 'DELETE' });

// ── Accounts ─────────────────────────────────────────────────────────────────

export const getTransactions = (customerId: string) =>
  request<Transaction[]>(`/accounts/${customerId}/transactions`);

export const deposit = (customerId: string, amount: number, accountType: string) =>
  request<Customer>(`/accounts/${customerId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount, accountType }),
  });

export const withdraw = (customerId: string, amount: number, accountType: string) =>
  request<Customer>(`/accounts/${customerId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ amount, accountType }),
  });

export const transfer = (
  customerId: string,
  fromAccountType: string,
  toAccountType: string,
  amount: number
) =>
  request<Customer>(`/accounts/${customerId}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ fromAccount: fromAccountType, toAccount: toAccountType, amount }),
  });
