from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Utilisation d'une DB SQLite
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Modèles de la base de données
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    date_creation = db.Column(db.DateTime, default=db.func.current_timestamp())

class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, default=db.func.current_timestamp())
    durée = db.Column(db.Integer, nullable=False)
    type_exercice = db.Column(db.String(100), nullable=False)
    calories_brûlées = db.Column(db.Integer, nullable=True)

class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workout.id'), nullable=False)
    nom_exercice = db.Column(db.String(100), nullable=False)
    répétitions = db.Column(db.Integer, nullable=True)
    poids_utilisé = db.Column(db.Float, nullable=True)
    durée = db.Column(db.Integer, nullable=True)

# Création de la base de données
with app.app_context():
    db.create_all()

# Création de données de test
if not User.query.all():
    db.session.add(User(nom="Alice Durand", email="",))
    db.session.add(User(nom="Bob Martin", email="",))
    db.session.commit()

# Routes API
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    new_user = User(nom=data['nom'], email=data['email'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Utilisateur créé", "id": new_user.id})

@app.route('/workouts', methods=['POST'])
def create_workout():
    data = request.json
    new_workout = Workout(
        user_id=data['user_id'],
        durée=data['durée'],
        type_exercice=data['type_exercice'],
        calories_brûlées=data.get('calories_brûlées', 0)
    )
    db.session.add(new_workout)
    db.session.commit()
    return jsonify({"message": "Séance ajoutée", "id": new_workout.id})

@app.route('/workouts/<int:user_id>', methods=['GET'])
def get_workouts(user_id):
    workouts = Workout.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": w.id,
        "date": w.date,
        "durée": w.durée,
        "type_exercice": w.type_exercice,
        "calories_brûlées": w.calories_brûlées
    } for w in workouts])

# WebSockets : suivre les entraînements en temps réel
@socketio.on('new_workout')
def handle_new_workout(data):
    print(f"Nouvelle séance reçue : {data}")
    socketio.emit('update_workouts', data, broadcast=True)

# Lancer le serveur
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
