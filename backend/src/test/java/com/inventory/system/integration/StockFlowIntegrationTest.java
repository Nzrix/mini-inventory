package com.inventory.system.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.system.dto.LoginRequest;
import com.inventory.system.dto.StockTransactionDTO;
import com.inventory.system.model.Category;
import com.inventory.system.model.Product;
import com.inventory.system.model.Role;
import com.inventory.system.model.StockTransaction;
import com.inventory.system.model.User;
import com.inventory.system.repository.CategoryRepository;
import com.inventory.system.repository.ProductRepository;
import com.inventory.system.repository.StockTransactionRepository;
import com.inventory.system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StockFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long productId;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        stockTransactionRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("password123"));
        admin.setFullName("Administrator");
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        Category category = new Category();
        category.setName("Test Category");
        category.setDescription("For integration tests");
        category = categoryRepository.save(category);

        Product product = new Product();
        product.setSku("TEST-001");
        product.setName("Test Product");
        product.setDescription("Integration test product");
        product.setUnit("piece");
        product.setCostPrice(new BigDecimal("10.00"));
        product.setSellingPrice(new BigDecimal("20.00"));
        product.setMinimumStock(5);
        product.setCategory(category);
        product = productRepository.save(product);
        productId = product.getId();

        adminToken = loginAndGetToken("admin", "password123");
    }

    @Test
    void stockInIncreasesBalance() throws Exception {
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(productId);
        dto.setType(StockTransaction.TransactionType.IN);
        dto.setQuantity(50);
        dto.setReason("Initial stock");

        mockMvc.perform(post("/api/stock-transactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.balanceAfter", is(50)))
                .andExpect(jsonPath("$.type", is("IN")));
    }

    @Test
    void stockOutDecreasesBalance() throws Exception {
        createStock(StockTransaction.TransactionType.IN, 40, "Seed stock");

        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(productId);
        dto.setType(StockTransaction.TransactionType.OUT);
        dto.setQuantity(15);
        dto.setReason("Sale");

        mockMvc.perform(post("/api/stock-transactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.balanceAfter", is(25)))
                .andExpect(jsonPath("$.type", is("OUT")));
    }

    @Test
    void negativeStockOutReturns400() throws Exception {
        createStock(StockTransaction.TransactionType.IN, 5, "Small stock");

        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(productId);
        dto.setType(StockTransaction.TransactionType.OUT);
        dto.setQuantity(100);
        dto.setReason("Too much");

        mockMvc.perform(post("/api/stock-transactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    private void createStock(StockTransaction.TransactionType type, int quantity, String reason) throws Exception {
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setProductId(productId);
        dto.setType(type);
        dto.setQuantity(quantity);
        dto.setReason(reason);

        mockMvc.perform(post("/api/stock-transactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername(username);
        request.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }
}
