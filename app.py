from decouple import config
from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import random
import re

from helpers import login_required

# Configure application
app = Flask(__name__)

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
    return redirect("/login")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ————————————————————————————————————— Login & Out —————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/login")
def login():
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

        # Ensure username was submitted
        if not request.form.get("email"):
            errors.append('No email was given')

        # Ensure password was submitted
        elif not request.form.get("password"):
            errors.append('No password was given')

        # Ensure password was confirmed
        elif not request.form.get("confirm-password"):
            errors.append('No password confirmation was given')

        # Ensure password and confirm password fields match
        elif request.form.get("password") != request.form.get("confirm-password"):
            errors.append('Password and password confirmation must match')


        reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,20}$"

        # Compiling regex 
        pat = re.compile(reg) 
        
        # Searching regex                  
        mat = re.search(pat, request.form.get("password")) 

        # Validating conditions 
        if not mat: 
            errors.append('Invalid password')

        # Check email formatting
        if not re.match(r"[^@]+@[^@]+\.[^@]+", request.form.get('email')):
            errors.append('Invalid email format')
      
        # Query database for email and if available show error else create new row in db
        rows = db.execute("SELECT * FROM users WHERE email = :email",
                          email=request.form.get("email"))
        
        # Check email in database
        if len(rows) != 0:
            errors.append('Email is already in use')

        # If there are any errors, send them to front end
        if(len(errors) > 0):
            return jsonify({"errors": errors}), 400

        # Add row to db with new user information
        db.execute("INSERT INTO users (email, hash) VALUES (:email, :hash)",
                    email=request.form.get('email'),
                    hash=generate_password_hash(request.form.get('password')))
        
        return redirect("/")

    # User reached route via GET (as by navigating to page via link/URL)
    if request.method == "GET":
        return render_template("register.html")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ——————————————————————————————————— Password Reset ————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/verify_email", methods=['GET', 'POST'])
def verify_email():
    if request.method == "GET":
        return render_template("password-email.html")
    
    else:
        return redirect("/verify_code")

@app.route("/verify_code", methods=['GET', 'POST'])
def verify_code():
    if request.method == "GET":
        return render_template("password-code.html")
    
    else:
        return redirect("/reset_password")

@app.route("/reset_password", methods=['GET', 'POST'])
def reset_password():
    if request.method == "GET":
        return render_template("password-reset.html")
    
    else:
        return redirect("/login")


# Generate time stamp 10 mins in future for code expiry
in_10_mins = datetime.now() + timedelta(minutes = 10)
in_10_mins = in_10_mins.strftime('%Y-%m-%d %H-%M-%S.%f')[:-3]

# Generate random 4 digit code
code = str(random.randrange(10000)).zfill(4)

# Convert time in string format pulled from db into a time object that can have operations applied
# ######time = datetime.strptime('''db pulled time''', '%Y-%m-%d %H-%M-%S.%f') > datetime.now()




