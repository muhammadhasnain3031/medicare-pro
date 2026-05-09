# 🏥 MediCare Pro — Advanced Hospital Management SaaS

**MediCare Pro** is an enterprise-grade, Multi-Tenant Hospital Management System designed for modern healthcare facilities. Built with **Next.js 15**, **TypeScript**, and **MongoDB**, it leverages AI to automate clinical workflows and improve patient outcomes.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🔴 Live Production Demo
🚀 **[medicare-pro-green.vercel.app](https://medicare-pro-green.vercel.app)**

> **Note:** For a seamless experience, use the **Quick Demo Login** buttons on the login page to auto-fill credentials for different roles.

---

## 🔑 Role-Based Access Control (RBAC)

The system features 7 specialized roles with granular permissions:

| Role | Core Responsibilities |
| :--- | :--- |
| **Super Admin** | Manage multiple hospital tenants, system logs, and global stats. |
| **Admin** | Hospital-specific settings, staff management, and analytics. |
| **Doctor** | AI-assisted prescriptions, patient EMR, and appointment logs. |
| **Receptionist** | Patient registration, scheduling, and billing initiation. |
| **Lab Staff** | Manage test requests, upload results, and generate PDF reports. |
| **Nurse/Staff** | Monitor vitals, bed management, and patient care notes. |
| **Patient** | View medical history, download prescriptions, and book slots. |

---

## ✨ Key Technical Features

### 🏢 Multi-Tenant SaaS Architecture
Scale your business by hosting multiple hospitals on a single platform with complete data isolation between tenants.

### 🤖 AI-Powered Clinical Support
Integrated with **Groq AI (LLaMA 3)** to assist doctors in generating accurate diagnoses and structured prescriptions based on symptoms.

### 💳 Integrated Billing & Payments
Ready for the Pakistani market with support for **JazzCash, EasyPaisa**, and manual cash transactions with automated invoice generation.

### 📄 Professional Document Generation
Instant PDF generation for:
* Digital Prescriptions (with AI insights)
* Standardized Lab Reports
* Financial Invoices & Receipts

### 📱 Performance & Security
* **Next.js 15 App Router** for lightning-fast Server-Side Rendering (SSR).
* **TypeScript** for robust, type-safe code and fewer production bugs.
* **JWT & HttpOnly Cookies** for secure, session-based authentication.
* **Fully Responsive UI** crafted with Tailwind CSS for mobile and tablet use.

---

## 🛠 Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Database:** MongoDB (via Mongoose)
* **Styling:** Tailwind CSS & Lucide Icons
* **AI Engine:** Groq SDK
* **PDF Engine:** jsPDF & jspdf-autotable
* **Deployment:** Vercel

---

## 🚀 Local Installation

1.  **Clone the Repo:**
    ```bash
    git clone [https://github.com/muhammadhasnain3031/medicare-pro](https://github.com/muhammadhasnain3031/medicare-pro)
    cd medicare-pro
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file and add your credentials:
    ```env
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_secret_key
    GROQ_API_KEY=your_groq_key
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

**Screenshots**

<img width="1904" height="926" alt="image" src="https://github.com/user-attachments/assets/5cf6a938-4db1-4110-a34d-9af641b3d79b" />
<img width="1889" height="904" alt="image" src="https://github.com/user-attachments/assets/92bf7036-7002-408e-82b3-39a87aff12df" />
<img width="1901" height="905" alt="image" src="https://github.com/user-attachments/assets/15e9b2d2-e7db-4aee-aae5-f9d8335dcd42" />
<img width="1889" height="913" alt="image" src="https://github.com/user-attachments/assets/88ae9408-c6d9-4a5b-a1aa-0a1c8b8d8e10" />
<img width="1890" height="916" alt="image" src="https://github.com/user-attachments/assets/6439cb60-0204-4257-b16b-79bb782eff8a" />
<img width="1894" height="914" alt="image" src="https://github.com/user-attachments/assets/3573ab23-1f3e-4407-af88-2b066ec810c9" />
<img width="1894" height="915" alt="image" src="https://github.com/user-attachments/assets/f30d75e4-fb35-4136-be58-9cf57b0bc9bf" />
<img width="1892" height="912" alt="image" src="https://github.com/user-attachments/assets/d9992dba-a174-4a5c-a863-eab795365393" />
<img width="1893" height="919" alt="image" src="https://github.com/user-attachments/assets/e5367186-e256-4f38-acf0-a1ba6df42525" />
<img width="1892" height="913" alt="image" src="https://github.com/user-attachments/assets/f6bc7d06-6e68-49a0-90fa-958d50e6cc94" />
<img width="1892" height="909" alt="image" src="https://github.com/user-attachments/assets/e205fe03-b6e6-4b76-a1b7-a2e4becebe8d" />
<img width="1898" height="914" alt="image" src="https://github.com/user-attachments/assets/c0bc3706-7baf-498f-8b5f-26d2253bcf17" />
<img width="1915" height="903" alt="image" src="https://github.com/user-attachments/assets/4ed906a8-759a-4f89-be31-6b4f5c4b091c" />













## 👨‍💻 Developed By

**Muhammad Hasnain**
*Full Stack Developer specializing in Next.js & TypeScript*

* **GitHub:** [@muhammadhasnain3031](https://github.com/muhammadhasnain3031)
* **LinkedIn:** [muhammad-hasnain-dev](https://linkedin.com/in/muhammad-hasnain-dev)

---
*Developed with ❤️ in Pakistan*
