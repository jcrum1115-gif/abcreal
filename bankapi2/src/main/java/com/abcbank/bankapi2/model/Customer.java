package com.abcbank.bankapi2.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "customers")
public class Customer extends User {

    private CheckingAccount checkingAccount;
    private SavingsAccount savingsAccount;

    public Customer() {
        super();
    }

    public Customer(
            String username,
            String password,
            CheckingAccount checkingAccount,
            SavingsAccount savingsAccount) {

        super(username, password);
        this.checkingAccount = checkingAccount;
        this.savingsAccount = savingsAccount;
    }

    public CheckingAccount getCheckingAccount() {
        return checkingAccount;
    }

    public void setCheckingAccount(
            CheckingAccount checkingAccount) {
        this.checkingAccount = checkingAccount;
    }

    public SavingsAccount getSavingsAccount() {
        return savingsAccount;
    }

    public void setSavingsAccount(
            SavingsAccount savingsAccount) {
        this.savingsAccount = savingsAccount;
    }
}