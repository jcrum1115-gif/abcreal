package com.abcbank.bankapi2.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.abcbank.bankapi2.model.Account;
import com.abcbank.bankapi2.model.Customer;
import com.abcbank.bankapi2.model.Transaction;
import com.abcbank.bankapi2.repository.CustomerRepository;

@Service
public class AccountService {

    private final CustomerRepository customerRepository;

    public AccountService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer deposit(
            String customerId,
            String accountType,
            double amount) {

        Customer customer = customerRepository
                .findById(customerId)
                .orElse(null);

        if (customer == null) {
            return null;
        }

        Account account = chooseAccount(customer, accountType);

        account.deposit(amount);

        return customerRepository.save(customer);
    }
    public Customer withdraw(
        String customerId,
        String accountType,
        double amount) {

    Customer customer = customerRepository
            .findById(customerId)
            .orElse(null);

    if (customer == null) {
        return null;
    }

    Account account = chooseAccount(customer, accountType);

    account.withdraw(amount);

    return customerRepository.save(customer);
    }
    private Account chooseAccount(
            Customer customer,
            String accountType) {

        if (accountType == null) {
            throw new IllegalArgumentException(
                    "Account type is required."
            );
        }

        if (accountType.equalsIgnoreCase("CHECKING")) {
            return customer.getCheckingAccount();
        }

        if (accountType.equalsIgnoreCase("SAVINGS")) {
            return customer.getSavingsAccount();
        }

        throw new IllegalArgumentException(
                "Account type must be CHECKING or SAVINGS."
        );
    }
    public Customer transfer(
        String customerId,
        String fromAccountType,
        String toAccountType,
        double amount) {

    Customer customer = customerRepository
            .findById(customerId)
            .orElse(null);

    if (customer == null) {
        return null;
    }

    Account fromAccount =
            chooseAccount(customer, fromAccountType);

    Account toAccount =
            chooseAccount(customer, toAccountType);

    if (fromAccount == toAccount) {
        throw new IllegalArgumentException(
                "Cannot transfer to the same account."
        );
    }

    fromAccount.transferOut(amount);
    toAccount.transferIn(amount);

    return customerRepository.save(customer);
    }   
    public List<Transaction> getTransactionHistory(String customerId) {

    Customer customer = customerRepository
            .findById(customerId)
            .orElse(null);

    if (customer == null) {
        return null;
    }

    List<Transaction> transactions = new ArrayList<>();

    transactions.addAll(
            customer.getCheckingAccount().getTransactionHistory()
    );

    transactions.addAll(
            customer.getSavingsAccount().getTransactionHistory()
    );

    return transactions;
    }
}