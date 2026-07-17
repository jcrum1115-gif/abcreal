const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://abcbank-4fcf.onrender.com";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  token: string;
  customerId: string;
  username: string;
}

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
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  const text = await res.text();
  if (!text || text.trim() === '') {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

// ── Customers ────────────────────────────────────────────────────────────────

export const login = (username: string, password: string) =>
  request<TokenResponse>('/auth/login', {
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
