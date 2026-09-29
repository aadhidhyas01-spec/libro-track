# LibroTrack — Library Book Issue and Return Manager

A Spring Boot + MySQL backend with a simple browser dashboard for the assessment:
**LibroTrack — Library Book Issue and Return Manager**.

## Features
- Add/search books with title, author, ISBN, category and copy count.
- Add students.
- Issue a book to a student for 14 days.
- Reject issuing when all copies are checked out.
- Prevent duplicate active issue of the same book to the same student.
- Return a book and calculate overdue fine automatically.
- View all issue records and active issues.
- Delete books/students when business rules allow.
- REST APIs with validation and global exception handling.
- Simple dashboard served by Spring Boot itself.

## Technologies
- Java 17
- Spring Boot 3.5
- Spring Web
- Spring Data JPA
- MySQL
- Jakarta Validation
- HTML/CSS/JavaScript dashboard

## Database setup
1. Install MySQL and start the MySQL service.
2. Create the database:
   `CREATE DATABASE librotrack;`
3. Open `src/main/resources/application.properties`.
4. Set:
   `spring.datasource.username=root`
   `spring.datasource.password=root`
   to your actual MySQL credentials.

## Run
From the project folder:

```text
mvn clean spring-boot:run
```

If `mvn` is not recognized on Windows, install Maven and add it to PATH, or run with the Maven Wrapper if you add one.

Then open:
`http://localhost:8080/`

## Main REST endpoints
### Books
- GET `/api/books`
- GET `/api/books?search=java`
- POST `/api/books`
- PUT `/api/books/{id}`
- DELETE `/api/books/{id}`

### Students
- GET `/api/students`
- POST `/api/students`
- PUT `/api/students/{id}`
- DELETE `/api/students/{id}`

### Issues
- GET `/api/issues`
- GET `/api/issues/active`
- POST `/api/issues`
- PUT `/api/issues/{id}/return`
- GET `/api/issues/count`

## Sample issue request
POST `/api/issues`

```json
{
  "bookId": 1,
  "studentId": 1
}
```

## Business rules
- Default loan period: 14 days.
- Fine: ₹5 per overdue day.
- A book cannot be issued if no copies are available.
- A student cannot have the same book issued twice at the same time.
- A book with an active issue cannot be deleted.
- A student with an active issue cannot be deleted.

Change the loan period/fine in `application.properties`.

## Assessment mapping
The implementation covers the requested Spring Boot REST API, CRUD operations, layered architecture, JPA entities/repositories, validation, business-rule enforcement, HTTP status codes, and global exception handling.
