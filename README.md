# QdpDataProcessor
## Overview
This project project focuses on developing a secure, scalable, and efficient serverless architecture for user authentication and real-time message passing using AWS and GCP services.
## 🛠️ Modules
### 1. User Management & Authentication

Purpose: Securely manage user registration, authentication, and authorization.

Key Features

User Registration: AWS Cognito stores user details securely.

Multi-Factor Authentication (MFA): Includes security questions and math-based validation.

Token-Based Authentication: Uses JWT tokens for session management.

- **Technologies Used**: AWS Cognito, AWS Lambda, AWS DynamoDB, GCP Functions


Authentication Flow

![User Authentication Flow](images/authFlow.png)


- User provides credentials.

- Security question verification.

- Math expression validation.

- If all checks pass, Cognito issues a JWT token.

### 2. Message Passing

Purpose: Enables real-time messaging between users and support agents.

Key Features

Support Ticket Creation: Users generate a reference code for issue tracking.

Real-Time Messaging: Uses AWS WebSocket API and DynamoDB Streams.

Agent Assignment: GCP function assigns available agents.

- **Technologies Used**: AWS DynamoDB, AWS WebSocket API, AWS Lambda, GCP Functions




Message Flow

![Message Support System Flow](images/supportSystemFlow.png)

User creates a support ticket (stored in DynamoDB).

GCP function assigns an agent and sends an auto-reply.

Users and agents exchange messages in real-time using WebSockets.

