package com.abcbank.bankapi2.model;

import java.time.LocalDateTime;

public class Transaction {

    private String type;
    private String accountType;
    private double amount;
    private double balanceAfter;
    private LocalDateTime timestamp;

    public Transaction() {
    }

    public Transaction(String type,
                       String accountType,
                       double amount,
                       double balanceAfter) {

        this.type = type;
        this.accountType = accountType;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.timestamp = LocalDateTime.now();
    }

    public String getType() {
        return type;
    }

    public String getAccountType() {
        return accountType;
    }

    public double getAmount() {
        return amount;
    }

    public double getBalanceAfter() {
        return balanceAfter;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}