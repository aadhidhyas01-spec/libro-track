package com.librotrack.controller;

import com.librotrack.model.Book;
import com.librotrack.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin
public class BookController {
    private final LibraryService service;

    public BookController(LibraryService service) { this.service = service; }

    @GetMapping
    public List<Book> getBooks(@RequestParam(required = false) String search) {
        return service.getBooks(search);
    }

    @GetMapping("/{id}")
    public Book getBook(@PathVariable Long id) { return service.getBook(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book addBook(@Valid @RequestBody Book book) { return service.addBook(book); }

    @PutMapping("/{id}")
    public Book updateBook(@PathVariable Long id, @Valid @RequestBody Book book) {
        return service.updateBook(id, book);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBook(@PathVariable Long id) { service.deleteBook(id); }
}
