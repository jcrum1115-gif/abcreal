package com.abcbank.bankapi2.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.abcbank.bankapi2.dto.DepositRequest;
import com.abcbank.bankapi2.dto.TransferRequest;
import com.abcbank.bankapi2.dto.WithdrawRequest;
import com.abcbank.bankapi2.model.Customer;
import com.abcbank.bankapi2.model.Transaction;
import com.abcbank.bankapi2.service.AccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/{customerId}/deposit")
    public ResponseEntity<?> deposit(
            @PathVariable String customerId,
            @Valid @RequestBody DepositRequest request) {

        Customer updatedCustomer =
        accountService.deposit(
                customerId,
                request.getAccountType(),
                request.getAmount()
        );

        return ResponseEntity.ok(updatedCustomer);
    }
    @PostMapping("/{customerId}/withdraw")
public ResponseEntity<?> withdraw(
        @PathVariable String customerId,
        @RequestBody WithdrawRequest request) {

    try {
        Customer updatedCustomer = accountService.withdraw(
                customerId,
                request.getAccountType(),
                request.getAmount()
        );

        if (updatedCustomer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedCustomer);

    } catch (IllegalArgumentException exception) {
        return ResponseEntity
                .badRequest()
                .body(exception.getMessage());
    }
    }
    @PostMapping("/{customerId}/transfer")
    public ResponseEntity<?> transfer(
        @PathVariable String customerId,
        @RequestBody TransferRequest request) {

    try {
        Customer updatedCustomer = accountService.transfer(
                customerId,
                request.getFromAccount(),
                request.getToAccount(),
                request.getAmount()
        );

        if (updatedCustomer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedCustomer);

    } catch (IllegalArgumentException exception) {
        return ResponseEntity
                .badRequest()
                .body(exception.getMessage());
    }
    }@GetMapping("/{customerId}/transactions")
    public ResponseEntity<List<Transaction>> getTransactionHistory(
        @PathVariable String customerId) {

    List<Transaction> transactions =
            accountService.getTransactionHistory(customerId);

    if (transactions == null) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(transactions);
    }
    
}