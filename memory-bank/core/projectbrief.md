---
title: Project Brief
project: Drip Me Out
version: 0.1.0
created: 2025-08-29
updated: 2025-08-29
author: AI Assistant
type: core
---

# Project Brief: Drip Me Out

## Overview

**Drip Me Out** is an AI-powered image transformation web application that adds diamond chains and grills to user photos using Google's Gemini 2.5 Flash model. Built as a showcase of Convex's backend-as-a-service platform capabilities.

## Purpose & Vision

### Primary Purpose
Transform user photos by adding realistic diamond jewelry (chains and grills) using cutting-edge AI image generation technology.

### Target Audience
- Social media users looking for fun photo enhancements
- Developers exploring AI image generation
- Convex platform showcase visitors

### Core Value Proposition
- **Instant AI Enhancement**: Quick diamond chain/grill addition to photos
- **Real-time Processing**: Live status updates during generation
- **Dual Input Methods**: Both webcam capture and file upload
- **Background Processing**: Resilient to page refreshes and navigation

## Key Features

### 1. Image Input System
- **Webcam Integration**: Real-time photo capture with preview
- **File Upload**: Standard image file selection and upload
- **Format Support**: JPEG, PNG, and other standard image formats

### 2. AI Image Generation
- **Google Gemini 2.5 Flash**: Latest multimodal AI model for image editing
- **Smart Enhancement**: Adds diamond chains and grills based on facial analysis
- **Background Processing**: Queue-based generation system

### 3. Real-time Experience
- **Live Status Updates**: Real-time generation progress tracking
- **Reactive UI**: Automatic updates when processing completes
- **Error Handling**: Graceful handling of API limits and failures

### 4. Modern UI/UX
- **Responsive Design**: Works on desktop and mobile devices
- **Infinite Scroll**: Paginated gallery with load-more functionality
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Clear visual indicators for all operations

## Technology Choices Rationale

### Frontend Stack
- **Next.js 15**: App Router for modern React architecture
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS + shadcn/ui**: Rapid, consistent UI development
- **React Hooks**: Modern state management patterns

### Backend (Convex Platform)
- **Real-time Database**: Automatic reactivity without complex setup
- **Built-in File Storage**: No external storage service needed
- **Scheduler System**: Reliable background job processing
- **Type Safety**: End-to-end TypeScript integration

### AI Integration
- **Google Gemini 2.5 Flash**: State-of-the-art multimodal capabilities
- **Base64 Processing**: Efficient image data handling
- **Error Recovery**: Robust API limit and failure handling

## Success Metrics

### Technical Success
- **Processing Speed**: < 30 seconds average generation time
- **Reliability**: > 95% successful generation rate
- **Performance**: < 3 second initial load time
- **Scalability**: Handle concurrent processing requests

### User Experience Success
- **Engagement**: Multiple image generations per session
- **Retention**: Return visits for additional enhancements
- **Sharing**: Social media sharing of generated images
- **Accessibility**: Works across devices and browsers

### Platform Showcase Success
- **Convex Features**: Demonstrates real-time, storage, and scheduling
- **Developer Interest**: Code examination and forking
- **Community Impact**: Positive feedback and contributions

## Current Status

- **Version**: 0.1.0
- **Phase**: Production Ready
- **Last Major Update**: Mobile optimization and UI improvements
- **Active Development**: Bug fixes and UX refinements