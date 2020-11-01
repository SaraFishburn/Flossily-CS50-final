from decouple import config
from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from flask_mail import Mail, Message
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import random
import re
import password

from helpers import login_required, email_verification_required

# Configure application
app = Flask(__name__)

app.config.update(

    #EMAIL SETTINGS
    MAIL_SERVER = 'smtp.gmail.com',
    MAIL_PORT = 465,
    MAIL_USE_SSL = True,
    MAIL_USERNAME = 'sarawebtest@gmail.com',
    MAIL_PASSWORD = password.MAIL_PASSWORD,
    MAIL_DEFAULT_SENDER = 'noreply@domain.com',
    MAIL_MAX_EMAILS = 1
)

mail = Mail(app)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///prep.db")

# Make sure API key is set
if not config("API_KEY"):
    raise RuntimeError("API_KEY not set")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ———————————————————————————————————————— Index ————————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/")
@login_required
def index():
    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        return
    else:
        return render_template("index.html")


@app.route("/login_modal")
def login_modal():
    if request.method == "GET":
        return render_template("login-modal.html")


# ———————————————————————————————————————————————————————————————————————————————————————— #
# ————————————————————————————————————— Login & Out —————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/login", methods=["GET", "POST"])
def login():

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        errors = []
        email = request.form.get('email')
        password = request.form.get('password')

        # Ensure email was submitted
        if not email:
            errors.append('No email was given')

        # Ensure password was submitted
        if not password:
            errors.append('No password was given')

        # Check email formatting
        if not email_format(email):
            errors.append('Invalid email format') 

        # If email doesnt exist, report error
        if not email_exists(email):
            errors.append('Email does not exist')

        # Retrieve user
        user = db.execute("SELECT * FROM users WHERE email = :email",
                            email=email)

        if len(user) != 0:

            # Check if account is already locked
            if user[0].get('account_unlock') and datetime.strptime(user[0].get('account_unlock'), '%Y-%m-%d %H-%M-%S.%f') > datetime.now():
                    errors.append('Account locked')

            # Check hashed user input and hash in db match
            elif not check_password_hash(user[0].get('hash'), password):

                num = db.execute("SELECT login_attempts FROM users WHERE email = :email",
                                    email=email)[0].get("login_attempts") + 1

                # If user has tried 3 times, set attempt count back to 0 and lock account
                if num == 3:

                    # Generate time stamp 30 mins in future for account unlock
                    in_30_mins = datetime.now() + timedelta(minutes = 30)
                    account_unlock = in_30_mins.strftime('%Y-%m-%d %H-%M-%S.%f')[:-3]

                    # Reset attempt count and add account unlock time
                    db.execute("UPDATE users SET login_attempts = :num, account_unlock = :account_unlock WHERE email = :email",
                                num=0,
                                account_unlock=account_unlock,
                                email=email)
                    errors.append('Too many attempts')
                else:
                    # Add to attempt count
                    db.execute("UPDATE users SET login_attempts = :num WHERE email = :email",
                                num=num,
                                email=email)
                    errors.append('Incorrect password')

            else:
                # Remember which user has logged in
                session["user_id"] = user[0]["id"]

                # Reset user login attempts to 0
                db.execute("UPDATE users SET login_attempts = :num WHERE email = :email",
                                num=0,
                                email=email)


        # If there are any errors, send them to front end
        if(len(errors) > 0):
            return jsonify({"errors": errors}), 400

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by navigating to page via link/URL)
    if request.method == "GET":
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/login")


# ———————————————————————————————————————————————————————————————————————————————————————— #
# —————————————————————————————————————— Register ———————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        errors = []
        email = request.form.get('email')
        password = request.form.get('password')
        confirm = request.form.get('confirm-password')

        # Ensure email was submitted
        if not email:
            errors.append('No email was given')

        # Ensure password was submitted
        if not password:
            errors.append('No password was given')

        # Ensure password was confirmed
        if not confirm:
            errors.append('No password confirmation was given')

        # Ensure password and confirm password fields match
        if password != confirm:
            errors.append('Password and password confirmation must match')

        # Check email formatting
        if not email_format(email):
            errors.append('Invalid email format')

        # Check if email exists in db
        if email_exists(email):
            errors.append('Email is already in use')

        # Check password formatting
        if not password_format(password):
            errors.append('Invalid password')

        # If there are any errors, send them to front end
        if(len(errors) > 0):
            return jsonify({"errors": errors}), 400

        # Add row to db with new user information
        db.execute("INSERT INTO users (email, hash, login_attempts, code_attempts) VALUES (:email, :hash, 0, 0)",
                    email=email,
                    hash=generate_password_hash(password))

        user = db.execute("SELECT * FROM users WHERE email = :email",
                            email=email)

        # Remember which user has logged in
        session["user_id"] = user[0]["id"]
        
        return redirect("/")

    # User reached route via GET (as by navigating to page via link/URL)
    if request.method == "GET":
        return render_template("register.html")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ———————————————————————————————————— Send Email ———————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/verify_email", methods=['GET', 'POST'])
def verify_email():

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        email = request.form.get('email')
        errors = []

        # check email exists in db
        if email_exists(email):

            # Remember email address
            session["email"] = email

            # Generate random 4 digit code
            code = str(random.randrange(10000)).zfill(4)

            #hash code to add to database
            code_hash = generate_password_hash(code)

            # Generate time stamp 10 mins in future for code expiry
            in_10_mins = datetime.now() + timedelta(minutes = 10)
            code_expiry = in_10_mins.strftime('%Y-%m-%d %H-%M-%S.%f')[:-3]

            # Add code and expiry to database
            db.execute("UPDATE users SET code_hash = :code_hash, code_expiry = :code_expiry WHERE email = :email",
                        code_hash=code_hash,
                        code_expiry=code_expiry,
                        email=email)

            # Send email to user with code
            msg = Message("Prep Password Reset Code")
            msg.add_recipient(email)
            msg.html = render_template('code-email.html', code=code)
            mail.send(msg)

            return redirect("/verify_code")

        else:
            errors.append('Email does not exist')

        # If there are any errors, send them to front end
        if(len(errors) > 0):
            return jsonify({"errors": errors}), 400

    # User reached route via GET (as by navigating to page via link/URL)
    if request.method == "GET":
        return render_template("password-email.html")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ———————————————————————————————————— Verify Code ——————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/verify_code", methods=['GET', 'POST'])
@email_verification_required
def verify_code():

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        errors = []
        code_input = request.form.get('code')
        email = session.get('email')

        user = db.execute("SELECT * FROM users WHERE email = :email",
                            email=email)
        expiry = user[0].get('code_expiry')

        # Check if code has expired
        if datetime.strptime(expiry, '%Y-%m-%d %H-%M-%S.%f') <= datetime.now():
            errors.append('Code has expired')

        # Check if code submitted by user matches code in db
        elif not check_password_hash(user[0].get('code_hash'), code_input):
                errors.append('Incorrect code')

                num = db.execute("SELECT code_attempts FROM users WHERE email = :email",
                                email=email)[0].get("code_attempts") + 1
                
                if num == 3:

                    # Set attempts back to 0
                    db.execute("UPDATE users SET code_attempts = :code_attempts WHERE email = :email",
                                code_attempts=0,
                                email=email)

                    return redirect("/resend")

                
                else:
                    db.execute("UPDATE users SET code_attempts = :code_attempts WHERE email = :email",
                                code_attempts=num,
                                email=email)

        # If there are any errors, send them to front end
        if(len(errors) > 0):
            return jsonify({"errors": errors}), 400

        return redirect('/reset_password')

    # User reached route via GET (as by navigating to page via link/URL)
    if request.method == "GET":
        return render_template("password-code.html")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ———————————————————————————————————— Resend Code ——————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/resend", methods=['GET', 'POST'])
@email_verification_required
def resendCode():
    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        return redirect("/verify_email")

    # User reached route via GET (as by navigating to page via link/URL)
    else:
        return render_template("send-new.html")


# ———————————————————————————————————————————————————————————————————————————————————————— #
# ——————————————————————————————————— Reset Password ————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/reset_password", methods=['GET', 'POST'])
@email_verification_required
def reset_password():
    # User reached route via GET (as by navigating to page via link/URL)
    if request.method == "GET":
        return render_template("password-reset.html")

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        errors = []
        email = session.get('email')
        password = request.form.get('password')
        confirm = request.form.get('confirm')

        # Ensure password was submitted
        if not password:
            errors.append('No password was given')

        if not password_format(password):
            errors.append("Invalid password")

        # Ensure password was confirmed
        if not confirm:
            errors.append('No password confirmation was given')

        # Ensure password and confirm password fields match
        if password != confirm:
            errors.append('Password and password confirmation must match')

        # If there are any errors, send them to front end
        if(len(errors) > 0):
            return jsonify({"errors": errors}), 400
            
        db.execute("UPDATE users SET hash = :hash WHERE email = :email",
                    hash=generate_password_hash(password),
                    email=email)
            
        return redirect('/login')

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ——————————————————————————————————— Helpful Functions —————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

def email_format(email):

    # Check email formatting
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return False

    else:
        return True

def password_format(password):

    # Regex for pasword format
    reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,128}$"

    # Compiling regex 
    pat = re.compile(reg) 

    # Searching regex
    mat = re.search(pat, password) 

    # Validating conditions 
    if not mat: 
        return False

    else:
        return True

def email_exists(email):

        # Query database for email
        rows = db.execute("SELECT * FROM users WHERE email = :email",
                          email=email)

        # Check if email is in db
        if len(rows) != 0:
            return True

        else:
            return False