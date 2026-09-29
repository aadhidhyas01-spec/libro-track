package com.librotrack.service;

import com.librotrack.dto.IssueRequest;
import com.librotrack.model.Book;
import com.librotrack.model.IssueRecord;
import com.librotrack.model.Student;
import com.librotrack.repository.BookRepository;
import com.librotrack.repository.IssueRecordRepository;
import com.librotrack.repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LibraryService {
    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;
    private final IssueRecordRepository issueRepository;

    @Value("${librotrack.loan-days:14}")
    private long loanDays;

    @Value("${librotrack.fine-per-day:5.0}")
    private double finePerDay;

    public LibraryService(BookRepository bookRepository,
                          StudentRepository studentRepository,
                          IssueRecordRepository issueRepository) {
        this.bookRepository = bookRepository;
        this.studentRepository = studentRepository;
        this.issueRepository = issueRepository;
    }

    public List<Book> getBooks(String search) {
        if (search == null || search.isBlank()) return bookRepository.findAll();
        return bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                search, search, search);
    }

    public Book addBook(Book book) {
        book.setAvailableCopies(book.getTotalCopies());
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book incoming) {
        Book book = getBook(id);
        int issuedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (incoming.getTotalCopies() < issuedCopies) {
            throw new IllegalArgumentException("Total copies cannot be less than currently issued copies.");
        }
        book.setTitle(incoming.getTitle());
        book.setAuthor(incoming.getAuthor());
        book.setIsbn(incoming.getIsbn());
        book.setCategory(incoming.getCategory());
        book.setTotalCopies(incoming.getTotalCopies());
        book.setAvailableCopies(incoming.getTotalCopies() - issuedCopies);
        return bookRepository.save(book);
    }

    public Book getBook(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + id));
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBook(id);
        if (issueRepository.findByReturnDateIsNull().stream()
                .anyMatch(i -> i.getBook().getId().equals(id))) {
            throw new IllegalArgumentException("Cannot delete a book that is currently issued.");
        }
        issueRepository.findAll().stream()
                .filter(i -> i.getBook().getId().equals(id))
                .forEach(issueRepository::delete);
        bookRepository.delete(book);
    }

    public List<Student> getStudents() {
        return studentRepository.findAll();
    }

    public Student addStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student incoming) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        student.setName(incoming.getName());
        student.setRegisterNumber(incoming.getRegisterNumber());
        student.setEmail(incoming.getEmail());
        student.setPhone(incoming.getPhone());
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        if (!issueRepository.findByStudentIdAndReturnDateIsNull(id).isEmpty()) {
            throw new IllegalArgumentException("Cannot delete a student with an active issued book.");
        }
        issueRepository.findAll().stream()
                .filter(i -> i.getStudent().getId().equals(id))
                .forEach(issueRepository::delete);
        studentRepository.delete(student);
    }

    @Transactional
    public IssueRecord issueBook(IssueRequest request) {
        Book book = getBook(request.getBookId());
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + request.getStudentId()));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("A book cannot be issued if all copies are already checked out.");
        }

        List<IssueRecord> active = issueRepository.findByStudentIdAndReturnDateIsNull(student.getId());
        if (active.stream().anyMatch(i -> i.getBook().getId().equals(book.getId()))) {
            throw new IllegalStateException("This student already has this book issued.");
        }

        IssueRecord record = new IssueRecord();
        LocalDate today = LocalDate.now();
        record.setBook(book);
        record.setStudent(student);
        record.setIssueDate(today);
        record.setDueDate(today.plusDays(loanDays));
        record.setFine(0);

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        return issueRepository.save(record);
    }

    @Transactional
    public IssueRecord returnBook(Long issueId) {
        IssueRecord record = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue record not found: " + issueId));

        if (record.getReturnDate() != null) {
            throw new IllegalStateException("This book has already been returned.");
        }

        LocalDate returnDate = LocalDate.now();
        long lateDays = Math.max(0, ChronoUnit.DAYS.between(record.getDueDate(), returnDate));
        record.setReturnDate(returnDate);
        record.setFine(lateDays * finePerDay);

        Book book = record.getBook();
        book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
        bookRepository.save(book);
        return issueRepository.save(record);
    }

    public List<IssueRecord> getAllIssues() {
        return issueRepository.findAll();
    }

    public List<IssueRecord> getActiveIssues() {
        return issueRepository.findByReturnDateIsNull();
    }

    public long getActiveIssueCount() {
        return issueRepository.countByReturnDateIsNull();
    }

    public double calculateCurrentFine(IssueRecord record) {
        if (record.getReturnDate() != null) return record.getFine();
        long lateDays = Math.max(0, ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now()));
        return lateDays * finePerDay;
    }
}
