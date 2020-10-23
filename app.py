from decouple import config
from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

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
    return 'hello'

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ———————————————————————————————————————— Login ————————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/login")
def login():
    if request.method == "GET":
        return render_template("login.html")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# —————————————————————————————————————— Register ———————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/register")
def register():
    if request.method == "GET":
        return render_template("register.html")

# ———————————————————————————————————————————————————————————————————————————————————————— #
# ——————————————————————————————————————— Verify ————————————————————————————————————————— #
# ———————————————————————————————————————————————————————————————————————————————————————— #

@app.route("/verify")
def Verify():
    if request.method == "GET":
        return render_template("password-code.html")

