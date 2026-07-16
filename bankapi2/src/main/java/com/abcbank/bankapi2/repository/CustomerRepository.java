package com.abcbank.bankapi2.repository;

import com.abcbank.bankapi2.model.Customer;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CustomerRepository
        extends MongoRepository<Customer, String> {

    Optional<Customer> findByUsernameAndPassword(String username, String password);
}