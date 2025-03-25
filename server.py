from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import datetime
import sqlite3
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import os
import random
from contextlib import contextmanager

# Configuration de l'application
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration des uploads
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Gestion des connexions à la base de données
def get_db_connection():
    conn = sqlite3.connect('fitness.db')
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def db_connection():
    conn = None
    try:
        conn = get_db_connection()
        yield conn
    finally:
        if conn:
            conn.close()

# Initialisation de la base de données
def init_db():
    with db_connection() as conn:
        cursor = conn.cursor()
        
        # Table messages
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users (id),
                FOREIGN KEY (receiver_id) REFERENCES users (id)
            )
        ''')
        
        # Table users
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name TEXT,
                age INTEGER,
                weight REAL,
                height REAL,
                sport_goal TEXT,
                role TEXT DEFAULT 'user',
                coach_id INTEGER,
                last_activity DATETIME
            )
        ''')
        
        # Table workouts
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                type TEXT,
                duration INTEGER,
                exercises TEXT,
                status TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Table goals
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                goal_type TEXT,
                target_date TEXT,
                current_progress REAL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Table notifications
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message TEXT,
                date TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Table exercices
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exercices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                category TEXT
            )
        ''')
        
        # Table subscriptions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL UNIQUE,
                price TEXT NOT NULL,
                color TEXT NOT NULL,
                features TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Table nutrition
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nutrition (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                ingredients TEXT NOT NULL,
                preparation_time INTEGER NOT NULL,
                calories INTEGER NOT NULL,
                category TEXT NOT NULL,
                goal_category TEXT NOT NULL
            )
        ''')
        
        # Table client_removals
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS client_removals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER NOT NULL,
                coach_id INTEGER NOT NULL,
                reason TEXT NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users (id),
                FOREIGN KEY (coach_id) REFERENCES users (id)
            )
        ''')
        
        # Table uploaded_files
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS uploaded_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                uploader_id INTEGER NOT NULL,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploader_id) REFERENCES users (id)
            )
        ''')
        
        # Table actualites
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS actualites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                auteur_id INTEGER,
                date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (auteur_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()

# Gestion des événements Socket.IO
@socketio.on('connect')
def handle_connect():
    print('Client connecté:', request.sid)
    emit('welcome', {'data': 'Connecté au serveur'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client déconnecté:', request.sid)

@socketio.on('userConnected')
def handle_user_connected(user_id):
    print(f'Utilisateur {user_id} est en ligne')

@socketio.on('sendMessage')
def handle_send_message(data):
    with db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO messages (sender_id, receiver_id, message, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (data['sender_id'], data['receiver_id'], data['message'], datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        conn.commit()
        message_id = cursor.lastrowid
        
        message = {
            'id': message_id,
            'sender_id': data['sender_id'],
            'receiver_id': data['receiver_id'],
            'message': data['message'],
            'timestamp': datetime.datetime.now().isoformat(),
            'is_read': False
        }
        
        emit('newMessage', message, room=str(data['receiver_id']))
        emit('newMessage', message, room=str(data['sender_id']))

# Routes API
@app.route('/coach/clients/<int:coach_id>', methods=['GET'])
def get_coach_clients(coach_id):
    with db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, username, name, age, weight, height, sport_goal 
            FROM users 
            WHERE coach_id = ?
        ''', (coach_id,))
        clients = cursor.fetchall()

        return jsonify([dict(client) for client in clients]), 200

@app.route('/coach/remove-client/<int:client_id>', methods=['DELETE'])
def remove_client(client_id):
    data = request.get_json()
    reason = data.get('reason')
    coach_id = data.get('coach_id')

    if not reason:
        return jsonify({'message': 'Une raison doit être fournie'}), 400

    with db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT coach_id FROM users WHERE id = ?', (client_id,))
        client = cursor.fetchone()
        
        if not client or client['coach_id'] != coach_id:
            return jsonify({'message': 'Client non trouvé ou ne vous appartient pas'}), 404

        cursor.execute('''
            INSERT INTO client_removals (client_id, coach_id, reason)
            VALUES (?, ?, ?)
        ''', (client_id, coach_id, reason))
        
        cursor.execute('UPDATE users SET coach_id = NULL WHERE id = ?', (client_id,))
        conn.commit()

    return jsonify({'message': 'Client supprimé avec succès'}), 200

# ... (Toutes les autres routes restent inchangées, mais utilisez le with db_connection() pattern)

# Routes pour les actualités
@app.route('/actualites', methods=['POST'])
def creer_actualite():
    data = request.get_json()
    description = data.get('description')
    auteur_id = data.get('auteur_id')
    
    if not description:
        return jsonify({'message': 'La description est requise'}), 400
    
    with db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO actualites (description, auteur_id)
            VALUES (?, ?)
        ''', (description, auteur_id))
        conn.commit()
        actualite_id = cursor.lastrowid
    
    return jsonify({
        'message': 'Actualité créée avec succès',
        'id': actualite_id
    }), 201

@app.route('/api/actualite/random', methods=['GET'])
def get_random_actualite():
    with db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as count FROM actualites')
        count = cursor.fetchone()['count']
        
        if count == 0:
            return jsonify({'message': 'Aucune actualité disponible'}), 404
        
        random_id = random.randint(1, count)
        cursor.execute('''
            SELECT description, date_creation 
            FROM actualites 
            WHERE id = ?
        ''', (random_id,))
        
        actualite = cursor.fetchone()
        
        if actualite:
            return jsonify({
                'description': actualite['description'],
                'date': actualite['date_creation']
            }), 200
        else:
            return jsonify({'message': 'Actualité non trouvée'}), 404

# Point d'entrée de l'application
if __name__ == '__main__':
    init_db()
    socketio.run(app, debug=True, host="0.0.0.0")