package com.abcbank.bankapi2.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
public class TransferRequest {
    @NotBlank(message = "From account is required.")
    private String fromAccount;
    
    @NotBlank(message = "To account is required.")
    private String toAccount;
    @Positive(message = "Amount must be greater than zero.")
    private double amount;

    public TransferRequest() {
    }

    public String getFromAccount() {
        return fromAccount;
    }

    public void setFromAccount(String fromAccount) {
        this.fromAccount = fromAccount;
    }

    public String getToAccount() {
        return toAccount;
    }

    public void setToAccount(String toAccount) {
        this.toAccount = toAccount;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}