package com.neurotutor.user.storage;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.util.IOUtils;
import com.neurotutor.user.exception.StorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.UUID;

@Slf4j
@Service
public class S3StorageService implements StorageService {

    private final AmazonS3 s3Client;
    private final String bucketName;

    @Autowired
    public S3StorageService(AmazonS3 s3Client, 
                           @Value("${aws.s3.bucket-name}") String bucketName) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    @Override
    public String store(MultipartFile file, String path) {
        try {
            String key = generateUniqueKey(path, file.getOriginalFilename());
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());

            s3Client.putObject(new PutObjectRequest(bucketName, key, file.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));

            return getPublicUrl(key);
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new StorageException("Failed to store file", e);
        } catch (AmazonServiceException e) {
            log.error("AWS S3 error while storing file", e);
            throw new StorageException("Failed to store file in S3", e);
        }
    }

    @Override
    public byte[] retrieve(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);
            S3Object s3Object = s3Client.getObject(bucketName, key);
            try (S3ObjectInputStream inputStream = s3Object.getObjectContent()) {
                return IOUtils.toByteArray(inputStream);
            }
        } catch (AmazonServiceException e) {
            log.error("AWS S3 error while retrieving file: {}", fileUrl, e);
            throw new StorageException("Failed to retrieve file from S3", e);
        } catch (IOException e) {
            log.error("IO error while reading file from S3: {}", fileUrl, e);
            throw new StorageException("Failed to read file content", e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);
            s3Client.deleteObject(bucketName, key);
        } catch (AmazonServiceException e) {
            log.error("AWS S3 error while deleting file: {}", fileUrl, e);
            throw new StorageException("Failed to delete file from S3", e);
        }
    }

    private String generateUniqueKey(String path, String originalFilename) {
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFilename.substring(lastDotIndex);
        }
        return String.format("%s/%s%s", 
                path, 
                UUID.randomUUID().toString(), 
                extension);
    }

    private String getPublicUrl(String key) {
        try {
            URL url = s3Client.getUrl(bucketName, key);
            return url.toString();
        } catch (Exception e) {
            log.error("Failed to generate public URL for key: {}", key, e);
            throw new StorageException("Failed to generate public URL", e);
        }
    }

    private String extractKeyFromUrl(String fileUrl) {
        try {
            URL url = new URL(fileUrl);
            // Remove leading slash if present
            return url.getPath().startsWith("/") 
                    ? url.getPath().substring(1) 
                    : url.getPath();
        } catch (Exception e) {
            log.error("Invalid file URL: {}", fileUrl, e);
            throw new StorageException("Invalid file URL: " + fileUrl, e);
        }
    }
}
