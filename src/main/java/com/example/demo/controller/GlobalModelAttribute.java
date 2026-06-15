package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.example.demo.utils.WebpackManifest;

@ControllerAdvice
public class GlobalModelAttribute {

    @Autowired
    WebpackManifest webpackManifest;

    @ModelAttribute
    public void addGlobalAttributes(Model model) {
        model.addAttribute("bundleJs", webpackManifest.getBundleJs());
    }
}
