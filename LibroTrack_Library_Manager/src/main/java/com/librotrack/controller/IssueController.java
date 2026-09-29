package com.librotrack.controller;

import com.librotrack.dto.IssueRequest;
import com.librotrack.model.IssueRecord;
import com.librotrack.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin
public class IssueController {
    private final LibraryService service;

    public IssueController(LibraryService service) { this.service = service; }

    @GetMapping
    public List<Map<String, Object>> getIssues() {
        return service.getAllIssues().stream().map(this::toView).toList();
    }

    @GetMapping("/active")
    public List<Map<String, Object>> getActiveIssues() {
        return service.getActiveIssues().stream().map(this::toView).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> issueBook(@Valid @RequestBody IssueRequest request) {
        return toView(service.issueBook(request));
    }

    @PutMapping("/{id}/return")
    public Map<String, Object> returnBook(@PathVariable Long id) {
        return toView(service.returnBook(id));
    }

    @GetMapping("/count")
    public Map<String, Long> activeCount() {
        return Map.of("activeIssues", service.getActiveIssueCount());
    }

    private Map<String, Object> toView(IssueRecord i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", i.getId());
        m.put("bookId", i.getBook().getId());
        m.put("bookTitle", i.getBook().getTitle());
        m.put("studentId", i.getStudent().getId());
        m.put("studentName", i.getStudent().getName());
        m.put("registerNumber", i.getStudent().getRegisterNumber());
        m.put("issueDate", i.getIssueDate());
        m.put("dueDate", i.getDueDate());
        m.put("returnDate", i.getReturnDate());
        m.put("fine", service.calculateCurrentFine(i));
        return m;
    }
}
