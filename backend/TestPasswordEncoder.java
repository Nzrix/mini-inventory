import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPasswordEncoder {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$8K1p/H0MIwaYTy5xnF5EveDNvQPdDlFcPJQnWpI7lYH9TJfLJLg7u";
        boolean matches = encoder.matches("password123", hash);
        System.out.println("Password matches: " + matches);
        System.out.println("New hash: " + encoder.encode("password123"));
    }
}
