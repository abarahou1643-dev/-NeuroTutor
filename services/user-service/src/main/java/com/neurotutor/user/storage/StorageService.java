package com.neurotutor.user.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String path);
    byte[] retrieve(String fileUrl);
    void delete(String fileUrl);
}
