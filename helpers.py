from decouple import config
import requests
import urllib.parse
import re

from flask import redirect, render_template, request, session
from functools import wraps

def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

def email_verification_required(f):
    """
    Decorate routes to require email verification.

    http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("email") is None:
            return redirect("/email")
        return f(*args, **kwargs)
    return decorated_function

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

def email_exists(email, db):

    # Query database for email
    rows = db.execute("SELECT * FROM users WHERE email = :email",
                        email=email)

    # Check if email is in db
    if len(rows) != 0:
        return True

    else:
        return False