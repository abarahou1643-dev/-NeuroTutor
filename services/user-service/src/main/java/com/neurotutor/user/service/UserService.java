package com.neurotutor.user.service;

import com.neurotutor.user.dto.UserRequest;
import com.neurotutor.user.dto.UserResponse;
import com.neurotutor.user.exception.ResourceNotFoundException;
import com.neurotutor.user.model.User;
import com.neurotutor.user.model.UserPreferences;
import com.neurotutor.user.repository.UserRepository;
import com.neurotutor.user.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::fromUser);
    }

    public UserResponse getUserById(String id) {
        return userRepository.findById(id)
                .map(UserResponse::fromUser)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public UserResponse createUser(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = userRequest.toUser();
        
        // Initialize user preferences
        UserPreferences preferences = new UserPreferences();
        preferences.setUser(user);
        user.setPreferences(preferences);
        
        User savedUser = userRepository.save(user);
        log.info("Created new user with id: {}", savedUser.getId());
        
        return UserResponse.fromUser(savedUser);
    }

    @Transactional
    public UserResponse updateUser(String id, UserRequest userRequest) {
        return userRepository.findById(id)
                .map(user -> {
                    // Check if email is being changed and if it's already in use
                    if (userRequest.getEmail() != null && 
                        !userRequest.getEmail().equals(user.getEmail()) && 
                        userRepository.existsByEmail(userRequest.getEmail())) {
                        throw new IllegalArgumentException("Email already in use");
                    }
                    
                    userRequest.updateUser(user);
                    User updatedUser = userRepository.save(user);
                    log.info("Updated user with id: {}", id);
                    return UserResponse.fromUser(updatedUser);
                })
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Delete avatar if exists
        if (user.getAvatarUrl() != null) {
            try {
                storageService.delete(user.getAvatarUrl());
            } catch (Exception e) {
                log.error("Failed to delete user avatar: {}", user.getAvatarUrl(), e);
            }
        }
        
        userRepository.delete(user);
        log.info("Deleted user with id: {}", id);
    }

    @Transactional
    public UserResponse uploadUserAvatar(String userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Delete old avatar if exists
        if (user.getAvatarUrl() != null) {
            try {
                storageService.delete(user.getAvatarUrl());
            } catch (Exception e) {
                log.error("Failed to delete old avatar: {}", user.getAvatarUrl(), e);
            }
        }

        // Upload new avatar
        String avatarUrl = storageService.store(file, "avatars/" + userId);
        user.setAvatarUrl(avatarUrl);
        
        User updatedUser = userRepository.save(user);
        log.info("Uploaded avatar for user: {}", userId);
        
        return UserResponse.fromUser(updatedUser);
    }

    @Transactional
    public UserResponse removeUserAvatar(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getAvatarUrl() != null) {
            try {
                storageService.delete(user.getAvatarUrl());
                user.setAvatarUrl(null);
                user = userRepository.save(user);
                log.info("Removed avatar for user: {}", userId);
            } catch (Exception e) {
                log.error("Failed to remove avatar for user: {}", userId, e);
                throw new RuntimeException("Failed to remove avatar", e);
            }
        }

        return UserResponse.fromUser(user);
    }
}
