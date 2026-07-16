package com.abcbank.bankapi2.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.abcbank.bankapi2.model.Customer;
import com.abcbank.bankapi2.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(String id) {
        return customerRepository.findById(id).orElse(null);
    }

    public Customer addCustomer(Customer customer) {
        customer.setId(null);
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(
            String id,
            Customer updatedCustomer) {

        Customer existingCustomer =
                customerRepository.findById(id).orElse(null);

        if (existingCustomer == null) {
            return null;
        }

        existingCustomer.setUsername(
                updatedCustomer.getUsername()
        );

        existingCustomer.setPassword(
                updatedCustomer.getPassword()
        );

        if (updatedCustomer.getCheckingAccount() != null) {
            existingCustomer.setCheckingAccount(
                    updatedCustomer.getCheckingAccount()
            );
        }

        if (updatedCustomer.getSavingsAccount() != null) {
            existingCustomer.setSavingsAccount(
                    updatedCustomer.getSavingsAccount()
            );
        }

        return customerRepository.save(existingCustomer);
    }

    public boolean deleteCustomer(String id) {

        if (!customerRepository.existsById(id)) {
            return false;
        }

        customerRepository.deleteById(id);
        return true;
    }
}