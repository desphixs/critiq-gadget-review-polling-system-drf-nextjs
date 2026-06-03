# Critiq: Gadget Review and Voting Platform

Critiq is a community platform where tech enthusiasts can browse a curated catalog of gadgets, leave detailed star-rated reviews, and vote on the helpfulness of others' feedback. The application demonstrates real-time data aggregation—dynamically calculating average ratings—and features a seamless push-pull voting toggle using Django's Many-to-Many relationships.

This application is designed as an educational project featured on [staqed.com](https://staqed.com), the premier platform where you can learn to build real-world, industry-standard full-stack web applications from scratch.

---

## Technical Stack

The architecture separates the frontend and backend to demonstrate modern production design:

- **Backend:** Python & Django with Django REST Framework (DRF) for hand-crafted, explicit API endpoints.
- **Database:** SQLite for lightweight and robust relational data storage.
- **Frontend:** Next.js (App Router) with TypeScript for highly optimized client-side pages and server-side pre-rendering.
- **Styling & UI:** Tailwind CSS for a modern, responsive, utility-first user interface and Lucide React for consistent iconography.

---

## Core Application Features

- **Authentication System:** Pre-built credential login, social auth integrations (Google and GitHub), and passwordless flow templates.
- **Curated Gadget Catalog:** Browse and filter devices by category (e.g., Headphones, Laptops, Cameras) with real-time average star ratings and review counts.
- **Relational Star-Rated Reviews:** Post structured 1-to-5 star reviews with text feedback, restricted to one review per gadget per user.
- **Helpful Voting System:** Toggle-based helpfulness voting (upvoting) on reviews powered by a Many-to-Many relational database structure.
- **Optimistic UI Updates:** Instant visual feedback when voting on reviews, backed by robust error recovery if the server request fails.
- **Theme Integration:** Clean, elegant dark and light mode UI matching premium design standards.

---

## Project Structure

```text
critiq/
├── backend/            # Django REST API (endpoints, catalog app, models, userauths)
├── frontend/           # Next.js App Router (dashboard, catalog page, detail page, UI components)
└── docs/               # Detailed study plans and tasks for the building process
```

---

## Getting Started

### 1. Prerequisites

Make sure you have the following installed on your machine:

- Python 3.12+
- Node.js 18+ & npm

### 2. Backend Setup

1. Navigate to the backend folder:
    ```bash
    cd backend
    ```
2. Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4. Create your local environment file:
    - Copy `.env.template` to `.env`.
    - Configure the default development variables (e.g., set `SECRET_KEY`, `DEBUG=True`, `DATABASE_URL=sqlite:///db.sqlite3`).
5. Run migrations to initialize the database:
    ```bash
    python manage.py migrate
    ```
6. Start the Django development server (default port `8000`):
    ```bash
    python manage.py runserver
    ```

### 3. Frontend Setup

1. Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2. Install the node packages:
    ```bash
    npm install
    ```
3. Create your local environment file:
    - Copy `.env.template` to `.env.local`.
    - Configure the API base URL to point to your backend: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.
4. Start the Next.js development server (default port `3000`):
    ```bash
    npm run dev
    ```

Now open your browser and navigate to `http://localhost:3000` to interact with the full application!

---

## Learning Goals on Staqed

While building Critiq on [staqed.com](https://staqed.com), you will master:

1. **Relational Database Design:** Connecting items, reviews, authors, and upvotes with foreign keys, validators, and Many-to-Many relationships.
2. **Aggregations & Custom Serialization:** Writing hand-crafted DRF API endpoints and using Django ORM `Avg` and `Count` annotations to dynamically calculate statistics.
3. **State Sync & Optimistic UI:** Building seamless user interfaces using React, Next.js, and Tailwind CSS, and implementing optimistic UI updates for instant feedback on actions like voting.

---

_This project is part of the full-stack developer path on [staqed.com](https://staqed.com)._
