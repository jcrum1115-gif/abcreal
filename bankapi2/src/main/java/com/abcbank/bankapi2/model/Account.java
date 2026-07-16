package com.abcbank.bankapi2.model;

import java.util.ArrayList;
import java.util.List;

public abstract class Account {

    private String accountNumber;
    private double balance;
    private String accountType;
    private List<Transaction> transactionHistory;

    public Account() {
        this.transactionHistory = new ArrayList<>();
    }

    public Account(String accountNumber,
                   double balance,
                   String accountType) {

        this.accountNumber = accountNumber;
        this.balance = balance;
        this.accountType = accountType;
        this.transactionHistory = new ArrayList<>();
    }

    // ------------------------
    // Getters
    // ------------------------

    public String getAccountNumber() {
        return accountNumber;
    }

    public double getBalance() {
        return balance;
    }

    public String getAccountType() {
        return accountType;
    }

    public List<Transaction> getTransactionHistory() {
        return transactionHistory;
    }

    // ------------------------
    // Setters
    // ------------------------

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public void setTransactionHistory(List<Transaction> transactionHistory) {
        if (transactionHistory == null) {
            this.transactionHistory = new ArrayList<>();
        } else {
            this.transactionHistory = transactionHistory;
        }
    }

    // ------------------------
    // Banking Methods
    // ------------------------

    public void deposit(double amount) {

        if (amount <= 0) {
            throw new IllegalArgumentException(
                    "Deposit amount must be greater than zero."
            );
        }

        balance += amount;

        transactionHistory.add(
                new Transaction(
                        "DEPOSIT",
                        accountType,
                        amount,
                        balance
                )
        );
    }

    public void withdraw(double amount) {

        if (amount <= 0) {
            throw new IllegalArgumentException(
                    "Withdrawal amount must be greater than zero."
            );
        }

        if (amount > balance) {
            throw new IllegalArgumentException(
                    "Insufficient funds."
            );
        }

        balance -= amount;

        transactionHistory.add(
                new Transaction(
                        "WITHDRAWAL",
                        accountType,
                        amount,
                        balance
                )
        );
    }
    public void transferOut(double amount) {

    if (amount <= 0) {
        throw new IllegalArgumentException(
                "Transfer amount must be greater than zero."
        );
    }

    if (amount > balance) {
        throw new IllegalArgumentException(
                "Insufficient funds."
        );
    }

    balance -= amount;

    transactionHistory.add(
            new Transaction(
                    "TRANSFER_OUT",
                    accountType,
                    amount,
                    balance
            )
    );
    }

    public void transferIn(double amount) {

    if (amount <= 0) {
        throw new IllegalArgumentException(
                "Transfer amount must be greater than zero."
        );
    }

    balance += amount;

    transactionHistory.add(
            new Transaction(
                    "TRANSFER_IN",
                    accountType,
                    amount,
                    balance
            )
    );
    }
    public abstract double getInterestRate();
}