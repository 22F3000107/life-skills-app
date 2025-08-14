# Application Setup Guide

This guide will help you set up and run the application locally on your machine.

## Prerequisites

Before getting started, make sure you have the following installed on your system:

- Node.js and npm (latest version)
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

To install Python dependencies, execute the following command : 

```
pip install -r "requirements.txt"
```

### 3. Start the Servers

You'll need to run the server using the following command

```
python3 main.py
```

### 4. Access the Application

Once the server starts running, open your web browser and navigate to:

```
http://localhost:5500/frontend/index.html
```

### 5. Folder Structure
```
.
├── __pycache__
│   ├── config.cpython-310.pyc
│   └── main.cpython-310.pyc
├── application
│   ├── __pycache__
│   │   ├── acadapi.cpython-310.pyc
│   │   ├── adminapi.cpython-310.pyc
│   │   ├── instances.cpython-310.pyc
│   │   ├── models.cpython-310.pyc
│   │   ├── resources.cpython-310.pyc
│   │   ├── sec.cpython-310.pyc
│   │   └── userapi.cpython-310.pyc
│   ├── acadapi.py
│   ├── adminapi.py
│   ├── instances.py
│   ├── models.py
│   ├── resources.py
│   ├── sec.py
│   └── userapi.py
├── config.py
├── frontend
│   ├── components
│   │   ├── acad
│   │   │   ├── AcadDashboard.js
│   │   │   ├── AcadHomePage.js
│   │   │   ├── ArchivedQuestionsPage.js
│   │   │   ├── ConceptPage.js
│   │   │   ├── ConceptQuestionsPage.js
│   │   │   ├── ContentManagement.js
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
│   │   ├── user
│   │   │   ├── GoalTrackerPage.js
│   │   │   ├── HealthyHabitsPage.js
│   │   │   ├── HomePage.js
│   │   │   ├── SettingsPage.js
│   │   │   ├── SummaryPage.js
│   │   │   ├── TakeTestPage.js
│   │   │   └── UserNavbar.js
│   │   └── utils
│   │       ├── AlertMessages.js
│   │       ├── AnswerOptions.js
│   │       ├── ArchivedQuestionsHeader.js
│   │       ├── ArchivedQuestionsStats.js
│   │       ├── ArchivedQuestionsTable.js
│   │       ├── BulkActionsModal.js
│   │       ├── DeleteModal.js
│   │       ├── EditAnswerOptions.js
│   │       ├── EditMatchingOptions.js
│   │       ├── EditMCQOptions.js
│   │       ├── EditQuestionHeader.js
│   │       ├── EditTrueFalseOptions.js
│   │       ├── ErrorState.js
│   │       ├── ImageModel.js
│   │       ├── LoadingState.js
│   │       ├── MatchingOptions.js
│   │       ├── MCQOptions.js
│   │       ├── MediaDisplay.js
│   │       ├── MediaUpload.js
│   │       ├── ModuleHeader.js
│   │       ├── QuestionContentForm.js
│   │       ├── QuestionDetailsForm.js
│   │       ├── QuestionFilters.js
│   │       ├── QuestionFormHeader.js
│   │       ├── QuestionHeader.js
│   │       ├── QuestionMetaData.js
│   │       ├── QuestionPagination.js
│   │       ├── QuestionStats.js
│   │       ├── QuestionTable.js
│   │       ├── QuestionTableRow.js
│   │       ├── QuestionText.js
│   │       ├── RestoreModal.js
│   │       ├── SaveActions.js
│   │       └── TrueFalseOptions.js
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
│   ├── services
│   │   ├── acadService.js
│   │   ├── api.js
│   │   ├── conceptService.js
│   │   ├── moduleService.js
│   │   ├── questionService.js
│   │   └── storyQuizService.js
│   ├── static
│   │   ├── index.html
│   │   └── index.js
│   ├── store
│   │   └── index.js
│   └── utils
│       ├── api.js
│       ├── router.js
│       └── store.js
├── instance
│   └── dev.db
├── main.py
├── package-lock.json
├── package.json
├── README.md
├── requirements.txt
└── upload_initial_data.py
```

## Test Accounts

The application comes with pre-configured test accounts for different user roles:

| Role     | Email             | Password     |
| -------- | ----------------- | ------------ |
| Admin    | admin@email.com | admin |
| User     | user@email.com  | user1234 |
| Academic | acad@email.com    | acad1234 |


## Troubleshooting

- **Python command not found**: Try using `python` instead of `python3` if you're on Windows


