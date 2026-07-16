package com.abcbank.bankapi2.model;

public class CheckingAccount extends Account {

    public CheckingAccount() {
        super();
    }

    public CheckingAccount(
            String accountNumber,
            double balance) {

        super(accountNumber, balance, "CHECKING");
    }

    @Override
    public double getInterestRate() {
        return 0.01;
    }
}