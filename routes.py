from flask import Blueprint, render_template, redirect, url_for
from models import db, User
from flask_login import login_user, login_required, logout_user
from forms import LoginForm, RegisterForm
from werkzeug.security import generate_password_hash, check_password_hash

app_routes = Blueprint("app_routes", __name__)

@app_routes.route("/")
def home():
    return render_template("index.html")

@app_routes.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            return redirect(url_for("app_routes.dashboard"))
    return render_template("login.html", form=form)

@app_routes.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")
