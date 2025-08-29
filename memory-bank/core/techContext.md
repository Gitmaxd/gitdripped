---
title: Technical Context
project: Drip Me Out
version: 0.1.0
created: 2025-08-29
updated: 2025-08-29
author: AI Assistant
type: core
dependencies: [projectbrief.md]
---

# Technical Context: Drip Me Out

## Tech Stack Overview

### Frontend Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + PostCSS
- **UI Components**: shadcn/ui (built on Radix UI)
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono (Google Fonts)
- **Notifications**: Sonner (toast system)
- **Analytics**: Vercel Analytics
- **Animations**: Motion (Framer Motion successor)

### Backend (Convex Platform)
- **Database**: Convex NoSQL with real-time subscriptions
- **File Storage**: Convex built-in storage system
- **Scheduler**: Convex background job system
- **API**: Generated TypeScript client
- **Authentication**: Not implemented (public app)
- **Hosting**: Convex serverless functions

### AI Integration
- **Provider**: Google Gemini AI
- **Model**: Gemini 2.5 Flash Image Preview
- **API Library**: @google/genai v1.16.0
- **Image Processing**: Base64 encoding/decoding
- **Prompt**: "Add a bust down diamond chain, if the person is smiling, make have diamond grills"

## Architecture Overview

```
┌─────────────────────────────────────────┐
│               Frontend                   │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │  Next.js    │  │   Components    │   │
│  │  App Router │  │ - Webcam        │   │
│  │             │  │ - ImagePreview  │   │
│  │             │  │ - UI Library    │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────┬───────────────────────────┘
              │ Convex Client
┌─────────────▼───────────────────────────┐
│            Convex Backend               │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │  Database   │  │   File Storage  │   │
│  │ - images    │  │ - Original pics │   │
│  │ - indexes   │  │ - Generated     │   │
│  └─────────────┘  └─────────────────┘   │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │         Scheduler System            │ │
│  │ - Queue AI generation jobs          │ │
│  │ - Background processing             │ │
│  └─────────────────────────────────────┘ │
└─────────────┬───────────────────────────┘
              │ External API
┌─────────────▼───────────────────────────┐
│         Google Gemini AI                │
│  - Image-to-Image transformation        │
│  - Multimodal processing                │
│  - Diamond chain/grill addition         │
└─────────────────────────────────────────┘
```

## Database Schema

### Images Table
```typescript
{
  _id: Id<"images">,
  body: string,                    // Storage ID reference
  createdAt: number,               // Unix timestamp
  isGenerated?: boolean,           // true for AI-generated images
  originalImageId?: string,        // Links generated to original
  generationStatus?: string,       // "pending" | "processing" | "completed" | "failed"
  generationError?: string,        // Error message if failed
  _creationTime: number           // Convex auto-field
}
```

### Indexes
- `by_created_at`: Orders images chronologically
- `by_is_generated`: Separates original vs generated images
- `by_generation_status`: Filters by processing state

## External Service Integrations

### Google Gemini AI
- **Endpoint**: Via @google/genai SDK
- **Authentication**: API Key (environment variable)
- **Model**: `gemini-2.5-flash-image-preview`
- **Input Format**: Base64 encoded images with text prompt
- **Output Format**: Base64 encoded enhanced images
- **Rate Limits**: Handled with graceful error messages

### Vercel Analytics
- **Purpose**: User engagement and performance tracking
- **Implementation**: @vercel/analytics/next package
- **Privacy**: No PII collection, anonymous usage data

## Development Environment

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)
- Convex account and CLI
- Google Gemini API key

### Environment Variables
```bash
CONVEX_DEPLOYMENT=<convex-deployment-url>
GEMINI_API_KEY=<google-gemini-api-key>
```

### Build System
- **Development**: `npm run dev` (Next.js with Turbopack)
- **Production Build**: `npm run build` (Next.js with Turbopack)
- **Linting**: `npm run lint` (ESLint 9)
- **Type Checking**: Built into Next.js build process

### Deployment
- **Frontend**: Vercel (automatic deployment)
- **Backend**: Convex (serverless deployment)
- **CI/CD**: Git-based automatic deployments

## Performance Considerations

### Frontend Optimization
- **Image Lazy Loading**: Built-in Next.js optimization
- **Code Splitting**: Automatic with Next.js App Router
- **Bundle Size**: Optimized with Turbopack
- **Caching**: Next.js static asset caching

### Backend Optimization
- **Real-time Queries**: Convex reactive subscriptions
- **File Storage**: CDN-backed Convex storage
- **Background Jobs**: Efficient scheduler system
- **Database Indexes**: Optimized query performance

### AI Processing Optimization
- **Background Processing**: Non-blocking generation
- **Status Tracking**: Real-time progress updates
- **Error Recovery**: Robust failure handling
- **Resource Management**: Queue-based processing

## Security Considerations

### API Security
- **Environment Variables**: Secure key storage
- **CORS**: Properly configured for Next.js
- **File Upload**: Convex managed security
- **Rate Limiting**: Gemini API limits respected

### Data Privacy
- **No Authentication**: Public app, no user data stored
- **Image Storage**: Temporary processing, no permanent retention policy
- **Analytics**: Anonymous usage tracking only
- **API Keys**: Server-side only, never exposed to client

## Monitoring & Observability

### Logging
- **Convex Functions**: Built-in console.log collection
- **AI Processing**: Detailed generation step logging
- **Error Tracking**: Comprehensive error capture
- **Performance**: Processing time measurements

### User Feedback
- **Toast Notifications**: Real-time user communication
- **Loading States**: Clear progress indication
- **Error Messages**: User-friendly error reporting
- **Status Indicators**: Visual processing feedback