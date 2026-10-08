package com.sece.leaderboard.dto;

import java.util.ArrayList;
import java.util.List;

public class UploadResponseDto {
    private boolean success;
    private String message;
    private int totalRowsParsed;
    private int studentsInserted;
    private int studentsUpdated;
    private int platformRecordsUpdated;
    private String detectedType;
    private List<String> failedRows = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    public UploadResponseDto() {}

    public UploadResponseDto(boolean success, String message, int totalRowsParsed, int studentsInserted, int studentsUpdated, int platformRecordsUpdated, String detectedType, List<String> failedRows, List<String> warnings) {
        this.success = success;
        this.message = message;
        this.totalRowsParsed = totalRowsParsed;
        this.studentsInserted = studentsInserted;
        this.studentsUpdated = studentsUpdated;
        this.platformRecordsUpdated = platformRecordsUpdated;
        this.detectedType = detectedType;
        this.failedRows = failedRows != null ? failedRows : new ArrayList<>();
        this.warnings = warnings != null ? warnings : new ArrayList<>();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTotalRowsParsed() {
        return totalRowsParsed;
    }

    public void setTotalRowsParsed(int totalRowsParsed) {
        this.totalRowsParsed = totalRowsParsed;
    }

    // Alias for backwards compatibility with existing UI
    public int getTotalRowsProcessed() {
        return totalRowsParsed;
    }

    public void setTotalRowsProcessed(int totalRowsProcessed) {
        this.totalRowsParsed = totalRowsProcessed;
    }

    public int getStudentsInserted() {
        return studentsInserted;
    }

    public void setStudentsInserted(int studentsInserted) {
        this.studentsInserted = studentsInserted;
    }

    // Alias for backwards compatibility with existing UI
    public int getStudentsCreated() {
        return studentsInserted;
    }

    public void setStudentsCreated(int studentsCreated) {
        this.studentsInserted = studentsCreated;
    }

    public int getStudentsUpdated() {
        return studentsUpdated;
    }

    public void setStudentsUpdated(int studentsUpdated) {
        this.studentsUpdated = studentsUpdated;
    }

    public int getPlatformRecordsUpdated() {
        return platformRecordsUpdated;
    }

    public void setPlatformRecordsUpdated(int platformRecordsUpdated) {
        this.platformRecordsUpdated = platformRecordsUpdated;
    }

    public String getDetectedType() {
        return detectedType;
    }

    public void setDetectedType(String detectedType) {
        this.detectedType = detectedType;
    }

    public List<String> getFailedRows() {
        return failedRows;
    }

    public void setFailedRows(List<String> failedRows) {
        this.failedRows = failedRows;
    }

    public List<String> getSkippedRows() {
        return failedRows;
    }

    public void setSkippedRows(List<String> skippedRows) {
        this.failedRows = skippedRows;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
