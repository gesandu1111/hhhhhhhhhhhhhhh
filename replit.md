# WhatsApp Bot Admin Dashboard

## Overview

This is a full-stack WhatsApp bot administration dashboard built with React, Express, and PostgreSQL. The application provides a comprehensive interface for managing WhatsApp business communications, including message handling, template management, webhook monitoring, and analytics. The system integrates with the WhatsApp Cloud API to receive and send messages, while providing real-time monitoring and configuration capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Type Safety**: Full TypeScript coverage across all components

The frontend follows a component-based architecture with pages organized by feature (dashboard, messages, templates, webhooks, bot-config, analytics). The UI components are built using the shadcn/ui system which provides consistent, accessible components based on Radix UI primitives.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with proper error handling and logging
- **Middleware**: Custom logging middleware for API request tracking
- **Development**: Hot reload with Vite middleware integration
- **Build**: ESBuild for server bundling

The server implements a modular route structure with separate concerns for webhook handling, message processing, template management, and configuration. The storage layer is abstracted through an interface allowing for different implementations.

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL
- **Type Safety**: Generated TypeScript types from database schema

The database schema includes tables for messages, conversations, templates, bot configuration, webhook logs, and analytics. All tables use UUID primary keys and include proper indexing for performance.

### Authentication and Authorization
- **Session Management**: PostgreSQL-based sessions using connect-pg-simple
- **Security**: Environment-based configuration for sensitive data
- **Webhook Verification**: WhatsApp webhook token verification

The application uses session-based authentication with PostgreSQL storage for persistence across server restarts. Webhook endpoints are protected with token verification.

### API Integration
- **WhatsApp Cloud API**: Full integration for sending/receiving messages
- **Webhook Processing**: Real-time message processing and response
- **Template Management**: WhatsApp business template creation and usage tracking
- **Message Types**: Support for text, media, and interactive messages

The WhatsApp integration includes proper webhook verification, message parsing, and response handling. The system tracks message delivery status and response times for analytics.

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### WhatsApp Integration
- **WhatsApp Cloud API**: Business messaging platform
- **Webhook verification**: Token-based security for incoming messages

### Session and Logging
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session middleware for Express

The application is designed to be deployed on platforms supporting Node.js with PostgreSQL databases, with particular optimization for Replit's development environment.