# Application Setup Guide

This guide will help you set up and run the application locally on your machine.

## Prerequisites

Before getting started, make sure you have the following installed on your system:

- Node.js and npm
- Python 3

## Installation and Setup

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/MagicalMe2025/soft-engg-project-may-2025-se-May-34.git
cd soft-engg-project-may-2025-se-May-34
```

### 2. Install Dependencies

Install the required Node.js dependencies:

```bash
npm install
```

### 3. Start the Servers

You'll need to run two separate Python HTTP servers for the frontend and mock server.

#### Start the Mock Server

Open a terminal window and run:

```bash
python3 -m http.server 5001
```

#### Start the Frontend Server

Open another terminal window and run:

```bash
python3 -m http.server 5500
```

### 4. Access the Application

Once both servers are running, open your web browser and navigate to:

```
http://localhost:5500/frontend/index.html
```

### 5. Folder Structure
```
.
├── application
│   ├── adminapi.py
│   ├── instances.py
│   ├── models.py
│   ├── resources.py
│   └── sec.py
├── config.py
├── frontend
│   ├── components
│   │   ├── acad
│   │   │   ├── AcadDashboard.js
│   │   │   ├── AcadHomePage.js
│   │   │   ├── ArchivedQuestionsPage.js
│   │   │   ├── ConceptPage.js
│   │   │   ├── ConceptQuestionsPage.js
│   │   │   ├── EditQuestionPage.js
│   │   │   ├── IndividualModulePage.js
│   │   │   ├── IndividualQuestionPage.js
│   │   │   ├── ModulesPage.js
│   │   │   ├── NewBar.js
│   │   │   ├── QuestionBankPage.js
│   │   │   ├── QuestionCreationPage.js
│   │   │   └── ReviewPage.js
│   │   ├── admin
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminNavbar.js
│   │   │   ├── AdminSettings.js
│   │   │   ├── FlaggedContent.js
│   │   │   ├── ManageQuizzes.js
│   │   │   ├── ManageStories.js
│   │   │   ├── ManageUsers.js
│   │   │   ├── ReminderSettings.js
│   │   │   └── ReportsAnalytics.js
│   │   ├── common
│   │   │   ├── LoginPage.js
│   │   │   ├── PublicNavbar.js
│   │   │   └── RegistrationPage.js
│   │   └── user
│   │       ├── GoalTrackerPage.js
│   │       ├── HealthyHabitsPage.js
│   │       ├── HomePage.js
│   │       ├── SettingsPage.js
│   │       ├── SummaryPage.js
│   │       ├── TakeTestPage.js
│   │       └── UserNavbar.js
│   ├── css
│   │   └── style.css
│   ├── images
│   │   ├── active.png
│   │   ├── flag.png
│   │   ├── lifeskills-logo.png
│   │   ├── pending.png
│   │   ├── quiz.png
│   │   ├── story.png
│   │   ├── teacher.png
│   │   └── user.png
│   ├── index.html
│   ├── mock-data
│   │   └── user.json
│   ├── public
│   │   └── mock-data
│   │       ├── acadHomeModules.json
│   │       ├── modules.json
│   │       ├── questions.json
│   │       └── questionsByModule.json
│   ├── README.md
│   ├── services // for fetch data using mock server or real API
│   │   ├── acadService.js
│   │   ├── api.js
│   │   ├── moduleService.js
│   │   └── questionService.js
│   ├── static
│   │   └── index.js
│   ├── store
│   │   └── index.js
│   └── utils
│       ├── router.js
│       └── store.js
├── instance
│   └── dev.db
├── main.py
├── package-lock.json
├── package.json
├── README.md
└── requirements.txt
```

## Test Accounts

The application comes with pre-configured test accounts for different user roles:

| Role     | Email             | Password     |
| -------- | ----------------- | ------------ |
| Admin    | admin@example.com | any password |
| User     | user@example.com  | any password |
| Academic | acad@email.com    | any password |

You can use any password when logging in with these test accounts.

## Troubleshooting

- **Port conflicts**: If ports 5001 or 5500 are already in use, you can specify different ports by adding the port number after the command (e.g., `python3 -m http.server 8080`)
- **Python command not found**: Try using `python` instead of `python3` if you're on Windows
- **Permission errors**: Make sure you have the necessary permissions to run servers on the specified ports

