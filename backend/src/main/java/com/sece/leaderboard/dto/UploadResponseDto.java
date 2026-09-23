package com.sece.leaderboard.dto;

import java.util.ArrayList;
import java.util.List;

public class UploadResponseDto {
    private boolean success;
    private String message;
    private int totalRowsProcessed;
    private int studentsCreated;
    private int studentsUpdated;
    private String detectedType;
    private List<String> warnings = new ArrayList<>();

    public UploadResponseDto() {}

    public UploadResponseDto(boolean success, String message, int totalRowsProcessed, int studentsCreated, int studentsUpdated, List<String> warnings) {
        this.success = success;
        this.message = message;
        this.totalRowsProcessed = totalRowsProcessed;
        this.studentsCreated = studentsCreated;
        this.studentsUpdated = studentsUpdated;
        this.warnings = warnings != null ? warnings : new ArrayList<>();
    }

    public UploadResponseDto(boolean success, String message, int totalRowsProcessed, int studentsCreated, int studentsUpdated, String detectedType, List<String> warnings) {
        this.success = success;
        this.message = message;
        this.totalRowsProcessed = totalRowsProcessed;
        this.studentsCreated = studentsCreated;
        this.studentsUpdated = studentsUpdated;
        this.detectedType = detectedType;
        this.warnings = warnings != null ? warnings : new ArrayList<>();
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getTotalRowsProcessed() { return totalRowsProcessed; }
    public void setTotalRowsProcessed(int totalRowsProcessed) { this.totalRowsProcessed = totalRowsProcessed; }

    public int getStudentsCreated() { return studentsCreated; }
    public void setStudentsCreated(int studentsCreated) { this.studentsCreated = studentsCreated; }

    public int getStudentsUpdated() { return studentsUpdated; }
    public void setStudentsUpdated(int studentsUpdated) { this.studentsUpdated = studentsUpdated; }

    public String getDetectedType() { return detectedType; }
    public void setDetectedType(String detectedType) { this.detectedType = detectedType; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
}
