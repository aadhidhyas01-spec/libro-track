package com.librotrack.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Student name is required")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "Register number is required")
    @Column(unique = true, nullable = false)
    private String registerNumber;

    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @Pattern(regexp = "^[0-9+()\\- ]{7,20}$", message = "Enter a valid phone number")
    private String phone;

    public Student() {}

    public Student(String name, String registerNumber, String email, String phone) {
        this.name = name;
        this.registerNumber = registerNumber;
        this.email = email;
        this.phone = phone;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getRegisterNumber() { return registerNumber; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
}
