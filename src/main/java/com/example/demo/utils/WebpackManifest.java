package com.example.demo.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class WebpackManifest {

    private Map<String, String> manifest = new HashMap<>();

    public WebpackManifest() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ClassPathResource resource =
                new ClassPathResource("resources/dist/manifest.json");

            if (resource.exists()) {
                manifest = mapper.readValue(
                    resource.getInputStream(),
                    new TypeReference<Map<String, String>>() {}
                );
            }
        } catch (Exception e) {
            // dev 환경에서는 manifest 없어도 정상 동작
        }
    }

    public String getBundleJs() {
        // manifest 없으면 기존 bundle.js 사용
        return manifest.containsKey("bundle.js")
            ? manifest.get("bundle.js")
            : "/resources/dist/bundle.js";
    }
}