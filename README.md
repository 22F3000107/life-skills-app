# SmartKids: Life Skills App

A web application for children aged 8 to 14 to build learning, moral values, and healthy habits through stories, quizzes, and goal tracking. It has separate dashboards for Users (children), Academic staff, and Admins.

> **Group project** (team of 6), built for the IIT Madras Software Engineering course. Original team repository: [MagicalMe2025/soft-engg-project-may-2025-se-May-34](https://github.com/MagicalMe2025/soft-engg-project-may-2025-se-May-34).
>
> **My contributions:** Built the Vue.js frontend for the admin and user sections, contributed to the Flask REST API backend, and handled testing and debugging.

## Features

**User (child)**
- Register and log in
- Take tests and quizzes
- Track personal goals
- Learn healthy habits
- View a progress summary
- Manage account settings

**Academic**
- Create and manage learning modules and concepts
- Build a question bank (MCQ, true/false, matching) with media uploads
- Review, edit, archive, and restore questions

**Admin**
- Manage users, quizzes, and stories
- Review flagged content
- Configure reminders
- View reports and analytics

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, SQLAlchemy |
| Database | SQLite |
| Frontend | Vue.js, JavaScript, HTML/CSS (no build step) |

## Project Structure

```
├── main.py                 # Entry point
├── config.py               # Configuration
├── upload_initial_data.py  # Seeds initial data
├── application/            # Backend: models, user/admin/academic APIs, security
│   ├── models.py
│   ├── userapi.py
│   ├── adminapi.py
│   ├── acadapi.py
│   └── sec.py
├── frontend/               # Vue.js app
│   ├── components/         # acad/, admin/, user/, common/, utils/
│   ├── services/           # API service modules
│   └── utils/              # Router, store, API helper
└── instance/               # SQLite database
```

## Getting Started

### Prerequisites
- Python 3
- Node.js and npm

### Run locally

```bash
git clone https://github.com/22F3000107/life-skills-app.git
cd life-skills-app

pip install -r requirements.txt
npm install
python3 main.py
```

Open http://localhost:5500/frontend/index.html in your browser.

On Windows, use `python` instead of `python3`.

### Demo accounts (development only)

| Role | Email | Password |
|---|---|---|
| Admin | admin@email.com | admin |
| User | user@email.com | user1234 |
| Academic | acad@email.com | acad1234 |

These are demo credentials for local use only.
## Demo

▶️ [Watch the demo video](https://drive.google.com/file/d/1I-I54RrILO-MuwJ5wZWiG725tec1_Zdi/view?usp=sharing)


## Screenshots

![User home](docs/user-home.png)
![Quiz page](docs/quiz.png)
![Admin dashboard](docs/admin-dashboard.png)

## Author

Deepak Kumar — [GitHub](https://github.com/22F3000107) | [LinkedIn](https://www.linkedin.com/in/deepak-kumar-855999268)
