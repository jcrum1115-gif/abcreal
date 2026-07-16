package com.abcbank.bankapi2.model;

public class SavingsAccount extends Account {

    public SavingsAccount() {
        super();
    }

    public SavingsAccount(
            String accountNumber,
            double balance) {

        super(accountNumber, balance, "SAVINGS");
    }

    @Override
    public double getInterestRate() {
        return 0.04;
    }
}