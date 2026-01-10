# Blood Donation Management System

A fully responsive, modern, and secure Blood Donation Management Website built with Next.js, React, Tailwind CSS, and MongoDB.

## Features

- **User Roles**: Donor, Recipient, Admin, Hospital/Blood Bank Staff.
- **Authentication**: Secure Login/Signup with NextAuth.js (Credentials & Google).
- **Donor Features**: Register, Book Appointments, View History.
- **Recipient Features**: Request Blood, Search for Blood Banks.
- **Hospital Features**: Manage Blood Stock, View Requests.
- **Admin Panel**: Dashboard with Analytics, User Management.
- **Core Functionalities**: Real-time availability (mocked), Responsive Design.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide React (Icons).
- **Backend**: Next.js API Routes.
- **Database**: MongoDB (Mongoose).
- **Authentication**: NextAuth.js.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd blood-donation
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    - Copy `.env.example` to `.env.local`:
      ```bash
      cp .env.example .env.local
      ```
    - Update the variables in `.env.local` with your MongoDB URI and NextAuth secret.

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `src/app`: App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions and database connection.
- `src/models`: Mongoose models (User, Appointment, Request, etc.).

## License

This project is licensed under the MIT License.
