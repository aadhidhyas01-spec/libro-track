package com.librotrack.config;

import com.librotrack.model.Book;
import com.librotrack.model.Student;
import com.librotrack.repository.BookRepository;
import com.librotrack.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seed(BookRepository books, StudentRepository students) {
        return args -> {
            if (books.count() == 0) {
                books.save(new Book("Clean Code", "Robert C. Martin", "9780132350884", "Programming", 3));
                books.save(new Book("Database System Concepts", "Silberschatz", "9780073523323", "Database", 2));
                books.save(new Book("Introduction to Algorithms", "Cormen", "9780262046305", "Algorithms", 2));
            }
            if (students.count() == 0) {
                students.save(new Student("Arun Kumar", "23CSE001", "arun@example.com", "9876543210"));
                students.save(new Student("Priya S", "23CSE002", "priya@example.com", "9876501234"));
            }
        };
    }
}
