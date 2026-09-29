# API Testing Examples

Use Postman or Swagger-compatible tools.

## Add book
POST http://localhost:8080/api/books
Content-Type: application/json

{
  "title": "Spring Boot in Action",
  "author": "Craig Walls",
  "isbn": "9781617292545",
  "category": "Programming",
  "totalCopies": 3
}

## Add student
POST http://localhost:8080/api/students
Content-Type: application/json

{
  "name": "Karthik R",
  "registerNumber": "23CSE010",
  "email": "karthik@example.com",
  "phone": "9876543210"
}

## Issue
POST http://localhost:8080/api/issues
Content-Type: application/json

{
  "bookId": 1,
  "studentId": 1
}

## Return
PUT http://localhost:8080/api/issues/1/return

## Search
GET http://localhost:8080/api/books?search=database

## Active issues
GET http://localhost:8080/api/issues/active
