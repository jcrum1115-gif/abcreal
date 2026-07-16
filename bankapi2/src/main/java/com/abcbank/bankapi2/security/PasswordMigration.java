package com.abcbank.bankapi2.security;

import com.abcbank.bankapi2.model.Customer;
import com.abcbank.bankapi2.repository.CustomerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PasswordMigration implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigration(CustomerRepository customerRepository,
                              PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        List<Customer> customers = customerRepository.findAll();
        for (Customer customer : customers) {
            String pwd = customer.getPassword();
            if (pwd != null && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$")) {
                customer.setPassword(passwordEncoder.encode(pwd));
                customerRepository.save(customer);
                System.out.println("[Migration] Hashed password for: " + customer.getUsername());
            }
        }
    }
}
