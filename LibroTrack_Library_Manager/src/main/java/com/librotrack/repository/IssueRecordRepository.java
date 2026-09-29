package com.librotrack.repository;

import com.librotrack.model.IssueRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueRecordRepository extends JpaRepository<IssueRecord, Long> {
    List<IssueRecord> findByStudentIdAndReturnDateIsNull(Long studentId);
    List<IssueRecord> findByReturnDateIsNull();
    long countByReturnDateIsNull();
}
