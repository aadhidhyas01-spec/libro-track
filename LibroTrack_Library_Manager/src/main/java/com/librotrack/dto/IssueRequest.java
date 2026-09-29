package com.librotrack.dto;

import jakarta.validation.constraints.NotNull;

public class IssueRequest {
    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    public Long getBookId() { return bookId; }
    public Long getStudentId() { return studentId; }

    public void setBookId(Long bookId) { this.bookId = bookId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
}
