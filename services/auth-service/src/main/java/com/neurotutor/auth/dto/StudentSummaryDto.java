package com.neurotutor.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSummaryDto {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
}
