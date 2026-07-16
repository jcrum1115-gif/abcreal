package com.abcbank.bankapi2.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
public class WithdrawRequest {
    
    @NotBlank(message = "Account type is required.")
    private String accountType;

    @Positive(message = "Amount must be greater than zero.")
    private double amount;

    public WithdrawRequest() {
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}