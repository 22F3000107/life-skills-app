from celery import shared_task
import flask_excel as excel
from io import BytesIO
from jinja2 import Template
from .mail_service import send_message
from .models import db, User, QuizAttempt, Quiz, Habit, Goal
from datetime import date, timedelta,datetime

@shared_task(ignore_result=False)
def send_individual_reminder(user_email):
    today = date.today()
    start_date = today - timedelta(days=7)
    
    user = db.session.query(User).filter_by(email=user_email).first()
    total_quizzes = db.session.query(Quiz).count()
    
    if not user:
        return f"No user found with email: {user_email}"
    
    # Quiz Attempts This Week
    quiz_attempts = db.session.query(QuizAttempt).filter(
        QuizAttempt.user_id == user.id,
        db.func.date(QuizAttempt.attempted_on) >= start_date,
        db.func.date(QuizAttempt.attempted_on) <= today
    ).all()

    completed_quiz_ids = [attempt.quiz_id for attempt in quiz_attempts]
    completed_count = len(completed_quiz_ids)
    uncompleted_count = max(0, total_quizzes - completed_count)

    # Habits This Week
    all_habits = db.session.query(Habit).filter(
        Habit.user_id == user.id,
        Habit.date >= start_date,
        Habit.date <= today
    ).all()

    habit_details = [{
        "name": habit.name,
        "date": habit.date.strftime("%Y-%m-%d"),
        "status": "Completed" if habit.completed else "Not Completed"
    } for habit in all_habits]

    # Goals - Completed and Pending
    all_goals = db.session.query(Goal).filter(
        Goal.user_id == user.id
    ).all()

    completed_goals = [goal for goal in all_goals if goal.status == "done"]
    pending_goals = [goal for goal in all_goals if goal.status == "active"]

    goal_details = {
        "completed": [{
            "text": goal.text,
            "due_date": goal.due_date.strftime("%Y-%m-%d")
        } for goal in completed_goals],
        "pending": [{
            "text": goal.text,
            "due_date": goal.due_date.strftime("%Y-%m-%d")
        } for goal in pending_goals],
        "completed_count": len(completed_goals),
        "pending_count": len(pending_goals),
        "total_count": len(all_goals)
    }

    # Email content
    html_template = """
    <html>
        <body>
            <h2>Weekly Quiz & Habit Reminder</h2>
            
            <h3>Hello {{ user_name }},</h3>
            
            <h3>Quiz Progress ({{ start }} - {{ end }}):</h3>
            <p>Completed: {{ completed_count }}</p>
            <p>Not Completed: {{ uncompleted_count }}</p>
            <p>Total Available: {{ total_quizzes }}</p>

            <h3>Habit Details:</h3>
            {% if habits %}
                <ul>
                    {% for habit in habits %}
                        <li>{{ habit.date }} - {{ habit.name }}: {{ habit.status }}</li>
                    {% endfor %}
                </ul>
            {% else %}
                <p>No habits tracked this week.</p>
            {% endif %}

            <h3>Goal Progress:</h3>
            <p><strong>Total Goals: {{ goals.total_count }}</strong></p>
            <p><strong>Completed Goals: {{ goals.completed_count }}</strong></p>
            <p><strong>Active Goals: {{ goals.pending_count }}</strong></p>
            
            <h4>Completed Goals:</h4>
            {% if goals.completed %}
                <ul>
                    {% for goal in goals.completed %}
                        <li>{{ goal.text }} (Due: {{ goal.due_date }})</li>
                    {% endfor %}
                </ul>
            {% else %}
                <p>No completed goals yet.</p>
            {% endif %}

            <h4>Pending Goals:</h4>
            {% if goals.pending %}
                <ul>
                    {% for goal in goals.pending %}
                        <li>{{ goal.text }} (Due: {{ goal.due_date }})</li>
                    {% endfor %}
                </ul>
            {% else %}
                <p>No pending goals.</p>
            {% endif %}
            
            <p>Keep up the great work!</p>
        </body>
    </html>
    """

    template = Template(html_template)
    rendered = template.render(
        user_name=f"{user.first_name} {user.last_name}",
        start=start_date.strftime("%Y-%m-%d"),
        end=today.strftime("%Y-%m-%d"),
        completed_count=completed_count,
        uncompleted_count=uncompleted_count,
        total_quizzes=total_quizzes,
        habits=habit_details,
        goals=goal_details
    )

    send_message(
        user_email,
        "Weekly Quiz & Habit Reminder",
        rendered
    )
    
    return f"Weekly reminder sent successfully to {user_email}"

@shared_task(ignore_result=False)
def weekly_reminder():
    all_users = db.session.query(User).all()
    
    if not all_users:
        return "No users found in database"
    
    # Create individual tasks for each user
    from celery import current_app
    for user in all_users:
        send_individual_reminder.delay(user.email)
    
    return f"Created {len(all_users)} individual reminder tasks for database users"

@shared_task(ignore_result=False)
def send_to_inactive(user_email):
    """Send a concise HTML reminder to a specific user inactive for 7+ days."""
    user = db.session.query(User).filter_by(email=user_email).first()
    if not user:
        return f"No user found with email: {user_email}"

    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)

    last_login_dt = user.last_login  # datetime or None
    # If never logged in, treat registered date as baseline for 'days inactive'
    baseline_dt = last_login_dt or (user.registered or now)
    days_inactive = (now.date() - baseline_dt.date()).days

    if (last_login_dt is None) or (last_login_dt < seven_days_ago):
        # Build HTML message
        last_login_str = (
            baseline_dt.strftime("%Y-%m-%d %H:%M UTC") if last_login_dt
            else "never (since registration)"
        )

        html_template = """
        <html>
          <body style="font-family: Arial, sans-serif; line-height:1.5; color:#222;">
            <div style="max-width:600px; margin:0 auto; padding:16px;">
              <h2 style="margin:0 0 12px;">We miss you at Life Skills 👋</h2>
              <p>Hello {{ user_name }},</p>

              <p>
                You’ve been <strong>inactive for {{ days_inactive }} days</strong>.
                {% if has_logged_in %}
                  Your last login was on <strong>{{ last_login_str }}</strong>.
                {% else %}
                  It looks like you haven’t logged in yet.
                {% endif %}
              </p>

              <p>Jump back in to continue your progress on quizzes, habits, and goals.</p>

              <p style="margin:24px 0;">
                <a href="{{ app_url }}" 
                   style="display:inline-block; padding:12px 18px; text-decoration:none; 
                          border-radius:8px; background:#2563eb; color:#fff;">
                  Resume Learning
                </a>
              </p>

              <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />

              <p style="font-size:12px; color:#666; margin-top:12px;">
                If you didn’t expect this email, you can ignore it.
              </p>
            </div>
          </body>
        </html>
        """

        template = Template(html_template)
        rendered = template.render(
            user_name=f"{user.first_name} {user.last_name}",
            days_inactive=days_inactive,
            has_logged_in=bool(last_login_dt),
            last_login_str=last_login_str,
            app_url="http://127.0.0.1:5000/#/login"  # <-- change to your real URL
        )

        # Subject clearly states inactivity
        subject = "You’ve been inactive for 7+ days"

        # Send the HTML email
        send_message(user_email, subject, rendered)
        return f"Inactive reminder sent to {user_email} (inactive {days_inactive} days)."

    return f"{user_email} has logged in within the last 7 days. No reminder sent."


@shared_task(ignore_result=False)
def send_reminder_to_inactive():
    """Queue reminders for all users who haven't logged in for at least the last 7 days."""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    inactive_users = (
        db.session.query(User)
        .filter(
            (User.last_login == None) | (User.last_login < seven_days_ago)
        )
        .all()
    )

    if not inactive_users:
        return "No inactive users found."

    for user in inactive_users:
        send_to_inactive.delay(user.email)

    return f"Created {len(inactive_users)} reminder tasks for inactive users."