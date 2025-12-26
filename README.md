# NOTES SHARE (Minor Project)


**NOTESHARE – A Web Application for Sharing Study Notes**

### Introduction

NOTESHARE is a simple web-based application developed as a **college minor project**. The main goal of this project is to provide a platform where students can upload, view, and manage study notes easily. The application also includes authentication and an admin panel to manage users and content.

This project is built using **React with TypeScript** and follows a clean and beginner-friendly structure.

### Features

* User authentication (Login / Logout)
* Dashboard for users
* Upload and view notes
* Admin panel for management
* Protected routes using authentication
* Responsive and simple UI

### Technologies Used

* **Frontend:** React + TypeScript (Vite)
* **Styling:** CSS / Tailwind (PostCSS)
* **Backend / Database:** Supabase
* **Authentication:** Supabase Auth
* **Build Tool:** Vite

### Project Structure

```
notesshare-local-main/
│── src/
│   │── contexts/
│   │   └── AuthContext.tsx
│   │── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   └── AdminPanel.tsx
│   │── db.ts
│   │── App.tsx
│   │── main.tsx
│── index.html
│── package.json
│── README.md
```

### How the Project Works

1. User opens the application
2. User logs in using authentication
3. After login, user is redirected to dashboard
4. User can access notes
5. Admin can manage users and content via admin panel

### Installation & Setup

1. Clone the repository

```bash
git clone https://github.com/Bikash1225/NoteShare-WEB
```

2. Install dependencies

```bash
npm install
```

3. Run the project

```bash
npm run dev
```

### Future Enhancements

* File upload support (PDF / Images)
* Search and filter notes
* User roles and permissions
* Better UI/UX

### Conclusion

NOTESHARE is a beginner-level project that demonstrates the use of React, TypeScript, routing, authentication, and basic project structure.

---

## PROJECT REPORT

### 1. Abstract

The NOTES SHARE project is a web-based application developed to help students share and access study materials easily. The system allows authenticated users to view notes, while administrators can manage the platform. This project helps in understanding modern web development using React and Supabase.

### 2. Problem Statement

Students often face difficulty in sharing notes efficiently. Existing platforms are either complex or not student-focused. The aim of this project is to create a simple and secure notes sharing system for students.

### 3. Objectives

* To build a simple notes sharing platform
* To implement user authentication
* To create an admin panel for management
* To understand React with TypeScript
* To use Supabase for backend services

### 4. Scope of the Project

This project can be used in colleges for internal note sharing. It can be extended in the future with file uploads, comments, and rating systems.

### 5. System Requirements

**Hardware Requirements:**

* Computer / Laptop
* Minimum 4GB RAM

**Software Requirements:**

* Node.js
* Web Browser
* Code Editor (VS Code)

### 6. Tools & Technologies

* React
* TypeScript
* Supabase
* Vite
* HTML, CSS

### 7. System Design

The system follows a client-server model:

* Frontend handles UI and routing
* Supabase handles authentication and database
* Context API manages authentication state

### 8. Module Description

* **Authentication Module:** Handles login and logout
* **Dashboard Module:** Displays user content
* **Admin Module:** Controls users and notes
* **Database Module:** Supabase configuration and access

### 9. Advantages

* Easy to use
* Secure authentication
* Scalable
* Beginner friendly

### 10. Limitations

* No offline access
* Limited file support
* Basic UI

### 11. Future Scope

* Cloud storage integration
* Mobile application
* Advanced admin controls

### 12. Conclusion

The NOTES SHARE project successfully meets its objectives and demonstrates practical knowledge of modern web technologies.

**Technology:** React + TypeScript

