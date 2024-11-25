# Mercury AIQuest

Welcome to **Mercury AIQuest**, a multi-service application built to demonstrate AI-driven features combined with robust backend services. This project is split into three repositories:

---

[![Watch the Project Video](https://img.youtube.com/vi/l1pXpls1Vro/0.jpg)](https://www.youtube.com/watch?v=l1pXpls1Vro)

---

🚀 Check out the **project showcase video**: [https://www.youtube.com/watch?v=l1pXpls1Vro](https://www.youtube.com/watch?v=l1pXpls1Vro)  
📧 Watch the **Mercury Email Service walkthrough**: [https://www.youtube.com/watch?v=7l9NQXqjo8g&t=0s](https://www.youtube.com/watch?v=7l9NQXqjo8g&t=0s)

---

## 🗂️ Repositories

The project is organized into the following repositories:

### 1. [Frontend: Mercury_AIQuest](https://github.com/DarkHeart01/Mercury_AIQuest)
The main user interface for Mercury AIQuest. Built with React, this frontend enables users to interact with the backend and AI-driven functionalities seamlessly.

### 2. [Backend: Mercury-CRUD-Service](https://github.com/SidTheKid-dotcom/Mercury-CRUD-Service)
Handles all the core CRUD operations for the application, serving as the backbone for database interactions.

### 3. [Backend: Mercury-Email-Service](https://github.com/SidTheKid-dotcom/Mercury-Email-Service)
A microservice dedicated to email-based functionalities such as notifications and updates.

---

# Mercury Email Service

[![Watch the Email Service Walkthrough](https://img.youtube.com/vi/7l9NQXqjo8g/0.jpg)](https://www.youtube.com/watch?v=7l9NQXqjo8g&t=0s)

Watch the **Mercury Email Service walkthrough**: [https://www.youtube.com/watch?v=7l9NQXqjo8g&t=0s](https://www.youtube.com/watch?v=7l9NQXqjo8g&t=0s)


---

The **Mercury Email Service** is a microservice designed to manage email notifications and related functionalities within the Mercury ecosystem. This backend service is a crucial part of the multi-repository project, ensuring efficient email operations for notifications and updates.

## 🔥 Features
- **Event-Driven Architecture**: Integrates with RabbitMQ to trigger email notifications based on events produced by other services.
- **Transactional Emails**: Supports sending transactional emails for system events like post updates.
- **Custom Email Templates**: Facilitates dynamic email template creation and rendering.
- **Scalable**: Designed to handle high email volumes with minimal latency.
- **Modular Design**: Easy to extend and integrate with other services in the ecosystem.
- **Error Handling and Logging**: Comprehensive logging for debugging and monitoring email-related errors.

## 🛠 Prerequisites
- **Node.js**: Required for running the service.
- **Message Queue (RabbitMQ)**: Essential for handling asynchronous email triggers.
- **SMTP Server**: Ensure access to a configured SMTP service for email delivery.
- **Environment Variables**: Set up `.env` to configure SMTP credentials and RabbitMQ connection details.
