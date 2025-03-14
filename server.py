from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Utilisation d'une DB SQLite
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Modèles de la base de données avec les nouvelles tables
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    weight = db.Column(db.Numeric(5, 2))
    height = db.Column(db.Numeric(5, 2))
    goal = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    sessions = db.relationship('Session', backref='user', lazy=True)
    goals = db.relationship('Goal', backref='user', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sport_type = db.Column(db.String(100))
    duration = db.Column(db.Integer)
    date = db.Column(db.DateTime, default=db.func.current_timestamp())
    calories_burned = db.Column(db.Numeric(5, 2))
    exercises = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goal_type = db.Column(db.String(100))
    target_date = db.Column(db.Date)
    progress = db.Column(db.Numeric(5, 2))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text)
    notification_type = db.Column(db.String(50))
    date = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_read = db.Column(db.Boolean, default=False)

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    exercise = db.Column(db.String(100))
    repetitions = db.Column(db.Integer)
    weight = db.Column(db.Numeric(5, 2))
    duration = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

# Création de la base de données
with app.app_context():
    db.create_all()

# Routes API
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=data['password_hash'],  # Assure-toi de hasher le mot de passe
        age=data.get('age'),
        weight=data.get('weight'),
        height=data.get('height'),
        goal=data.get('goal')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Utilisateur créé", "id": new_user.id})

@app.route('/sessions', methods=['POST'])
def create_session():
    data = request.json
    new_session = Session(
        user_id=data['user_id'],
        sport_type=data['sport_type'],
        duration=data['duration'],
        calories_burned=data.get('calories_burned', 0),
        exercises=data.get('exercises', '')
    )
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"message": "Séance ajoutée", "id": new_session.id})

@app.route('/sessions/<int:user_id>', methods=['GET'])
def get_sessions(user_id):
    sessions = Session.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": s.id,
        "sport_type": s.sport_type,
        "duration": s.duration,
        "calories_burned": s.calories_burned,
        "exercises": s.exercises,
        "date": s.date
    } for s in sessions])

@app.route('/goals', methods=['POST'])
def create_goal():
    data = request.json
    new_goal = Goal(
        user_id=data['user_id'],
        goal_type=data['goal_type'],
        target_date=data['target_date'],
        progress=data.get('progress', 0)
    )
    db.session.add(new_goal)
    db.session.commit()
    return jsonify({"message": "Objectif créé", "id": new_goal.id})

@app.route('/notifications', methods=['POST'])
def create_notification():
    data = request.json
    new_notification = Notification(
        user_id=data['user_id'],
        message=data['message'],
        notification_type=data['notification_type']
    )
    db.session.add(new_notification)
    db.session.commit()
    return jsonify({"message": "Notification créée", "id": new_notification.id})

# WebSockets : suivre les entraînements en temps réel
@socketio.on('new_session')
def handle_new_session(data):
    print(f"Nouvelle séance reçue : {data}")
    socketio.emit('update_sessions', data, broadcast=True)

# Lancer le serveur
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
