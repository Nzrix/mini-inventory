package com.inventory.system.config;

import com.inventory.system.model.Role;
import com.inventory.system.model.User;
import com.inventory.system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEMO_PASSWORD = "password123";

    @Bean
    public CommandLineRunner ensureDemoUsers(UserRepository userRepository,
                                             PasswordEncoder passwordEncoder) {
        return args -> {
            ensureUser(userRepository, passwordEncoder, "admin", "Administrator", Role.ADMIN);
            ensureUser(userRepository, passwordEncoder, "staff", "Staff User", Role.STAFF);
        };
    }

    private void ensureUser(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            String username,
                            String fullName,
                            Role role) {
        userRepository.findByUsername(username).ifPresentOrElse(user -> {
            // Only re-encode when the stored hash does not match the demo password
            if (!passwordEncoder.matches(DEMO_PASSWORD, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
                userRepository.save(user);
                logger.info("Updated demo password for user '{}'", username);
            }
        }, () -> {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            user.setFullName(fullName);
            user.setRole(role);
            user.setActive(true);
            userRepository.save(user);
            logger.info("Created demo user '{}'", username);
        });
    }
}
