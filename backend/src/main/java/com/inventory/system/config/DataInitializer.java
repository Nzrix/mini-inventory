package com.inventory.system.config;

import com.inventory.system.model.User;
import com.inventory.system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@org.springframework.context.annotation.Profile("!test")
public class DataInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Bean
    public CommandLineRunner initializePasswords(UserRepository userRepository, 
                                                  PasswordEncoder passwordEncoder) {
        return args -> {
            String rawPassword = "password123";
            String encodedPassword = passwordEncoder.encode(rawPassword);
            
            logger.info("Updating user passwords with properly encoded values");
            
            userRepository.findByUsername("admin").ifPresent(user -> {
                user.setPassword(encodedPassword);
                userRepository.save(user);
                logger.info("Updated admin password");
            });
            
            userRepository.findByUsername("staff").ifPresent(user -> {
                user.setPassword(encodedPassword);
                userRepository.save(user);
                logger.info("Updated staff password");
            });
            
            logger.info("Password initialization complete");
        };
    }
}
