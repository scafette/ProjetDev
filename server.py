from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Utilisation d'une DB SQLite
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

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
