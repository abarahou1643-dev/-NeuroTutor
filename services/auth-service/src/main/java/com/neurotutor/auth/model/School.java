package com.neurotutor.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "schools")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String address;

    private String phone;
    private String email;
    private String website;

    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL)
    @Builder.Default
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ClassEntity> classes = new ArrayList<>();
}