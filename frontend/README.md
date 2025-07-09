# React + Redux + TypeScript Product App

This project is a product management frontend built with React, Redux Toolkit, TypeScript, and Vite.

## Features
- User authentication (login/register/logout)
- Protected routes
- Product CRUD operations
- Axios with global error handling and auth token support

## Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the project root:
     ```env
     VITE_API_BASE_URL=http://localhost:3000
     ```
   - Change the value if your backend runs on a different URL/port.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

## Linting
```bash
npm run lint
```

## Notes
- Make sure your backend API is running and accessible at the URL specified in `VITE_API_BASE_URL`.
- On 401 Unauthorized errors, the app will automatically log out and redirect to the login page.

---
Feel free to customize this README for your project needs!
