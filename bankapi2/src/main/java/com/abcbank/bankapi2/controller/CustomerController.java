package com.abcbank.bankapi2.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.abcbank.bankapi2.model.Customer;
import com.abcbank.bankapi2.service.CustomerService;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(
            CustomerService customerService) {

        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                customerService.getAllCustomers()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable String id) {

        Customer customer =
                customerService.getCustomerById(id);

        if (customer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(customer);
    }

    @PostMapping
    public ResponseEntity<Customer> addCustomer(
            @RequestBody Customer customer) {

        System.out.println("Username received: " + customer.getUsername());
        System.out.println("Password received: " + customer.getPassword());
        System.out.println("Checking received: " + customer.getCheckingAccount());
        System.out.println("Savings received: " + customer.getSavingsAccount());

        Customer savedCustomer =
                customerService.addCustomer(customer);

        URI location = URI.create(
                "/customers/" + savedCustomer.getId()
        );

        return ResponseEntity
                .created(location)
                .body(savedCustomer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable String id,
            @RequestBody Customer customer) {

        Customer updatedCustomer =
                customerService.updateCustomer(id, customer);

        if (updatedCustomer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable String id) {

        boolean deleted =
                customerService.deleteCustomer(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}