package com.abcbank.bankapi2.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;

import com.abcbank.bankapi2.model.CheckingAccount;
import com.abcbank.bankapi2.model.Customer;
import com.abcbank.bankapi2.model.SavingsAccount;
import com.abcbank.bankapi2.repository.CustomerRepository;

public class AccountServiceTest {

    private CustomerRepository customerRepository;
    private AccountService accountService;
    private Customer customer;

    @BeforeEach
    void setUp() {

        customerRepository =
                Mockito.mock(CustomerRepository.class);

        accountService =
                new AccountService(customerRepository);

        customer = new Customer();

        customer.setId("customer-1");
        customer.setUsername("jocelyn");
        customer.setPassword("jocelyn123");

        customer.setCheckingAccount(
                new CheckingAccount("CHK-TEST-1", 1000.00)
        );

        customer.setSavingsAccount(
                new SavingsAccount("SAV-TEST-1", 500.00)
        );

        when(customerRepository.findById("customer-1"))
                .thenReturn(Optional.of(customer));

        when(customerRepository.save(any(Customer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
          }

    @Test
    void depositShouldIncreaseCheckingBalance() {

        Customer updatedCustomer = accountService.deposit(
                "customer-1",
                "CHECKING",
                250.00
        );

        assertEquals(
                1250.00,
                updatedCustomer.getCheckingAccount().getBalance()
        );
    }
    @Test
        void withdrawShouldDecreaseCheckingBalance() {

    Customer updatedCustomer = accountService.withdraw(
            "customer-1",
            "CHECKING",
            200.00
    );

    assertEquals(
            800.00,
            updatedCustomer.getCheckingAccount().getBalance()
    );
        }
        @Test
        void transferShouldMoveMoneyBetweenAccounts() {

        Customer updatedCustomer = accountService.transfer(
                "customer-1",
                "CHECKING",
                "SAVINGS",
                300.00
        );

        assertEquals(
                700.00,
                updatedCustomer.getCheckingAccount().getBalance()
        );

        assertEquals(
                800.00,
                updatedCustomer.getSavingsAccount().getBalance()
        );
        }
        @Test
void withdrawShouldThrowExceptionForInsufficientFunds() {

    assertThrows(
            IllegalArgumentException.class,
            () -> accountService.withdraw(
                    "customer-1",
                    "CHECKING",
                    5000.00
            )
    );
        }
        @Test
        void depositShouldRejectNegativeAmount() {

        assertThrows(
            IllegalArgumentException.class,
            () -> accountService.deposit(
                    "customer-1",
                    "CHECKING",
                    -100.00
            )
    );
}
@Test
void depositShouldReturnNullWhenCustomerDoesNotExist() {

    when(customerRepository.findById("bad-id"))
            .thenReturn(Optional.empty());

    Customer customer = accountService.deposit(
            "bad-id",
            "CHECKING",
            100.00
    );

    assertEquals(null, customer);
}

}