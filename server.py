from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import datetime
import sqlite3

app = Flask(__name__)
CORS(app)  # Autorise toutes les origines par défaut
bcrypt = Bcrypt(app)

# Connexion à la base de données SQLite
def get_db_connection():
    conn = sqlite3.connect('fitness.db')
    conn.row_factory = sqlite3.Row
    return conn

# Initialisation de la base de données
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table `messages` pour la messagerie
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users (id),
            FOREIGN KEY (receiver_id) REFERENCES users (id)
        )
    ''')
    
    # Table `users`
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
            coach_id INTEGER
        )
    ''')
    
    # Table `workouts`
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
    
    # Table `goals`
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
    
    # Table `notifications`
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message TEXT,
            date TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Table `exercices`
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exercices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            category TEXT
        )
    ''')
    
    # Table `subscriptions`
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
    
    # Table `nutrition`
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
    
    conn.commit()
    conn.close()

# Routes Flask

# Route pour envoyer un message
@app.route('/messages', methods=['POST'])
def send_message():
    data = request.get_json()
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']
    message = data['message']
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (sender_id, receiver_id, message, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (sender_id, receiver_id, message, timestamp))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Message sent successfully'}), 201

# Route pour récupérer les messages entre deux utilisateurs
@app.route('/messages/<int:sender_id>/<int:receiver_id>', methods=['GET'])
def get_messages(sender_id, receiver_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM messages
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp ASC
    ''', (sender_id, receiver_id, receiver_id, sender_id))
    messages = cursor.fetchall()
    conn.close()

    message_list = []
    for message in messages:
        message_list.append({
            'id': message['id'],
            'sender_id': message['sender_id'],
            'receiver_id': message['receiver_id'],
            'message': message['message'],
            'timestamp': message['timestamp']
        })

    return jsonify(message_list), 200

# Route pour récupérer les messages d'un utilisateur avec son coach
@app.route('/messages/coach/<int:user_id>', methods=['GET'])
def get_messages_with_coach(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Récupérer l'ID du coach de l'utilisateur
    cursor.execute('SELECT coach_id FROM users WHERE id = ?', (user_id,))
    coach_id = cursor.fetchone()['coach_id']

    if not coach_id:
        return jsonify({'message': 'Aucun coach assigné'}), 404

    # Récupérer les messages entre l'utilisateur et son coach
    cursor.execute('''
        SELECT * FROM messages
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp ASC
    ''', (user_id, coach_id, coach_id, user_id))
    messages = cursor.fetchall()
    conn.close()

    message_list = []
    for message in messages:
        message_list.append({
            'id': message['id'],
            'sender_id': message['sender_id'],
            'receiver_id': message['receiver_id'],
            'message': message['message'],
            'timestamp': message['timestamp']
        })

    return jsonify(message_list), 200

@app.route('/messages/<int:message_id>', methods=['PUT'])
def update_message(message_id):
    data = request.get_json()
    new_message = data.get('message')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE messages
        SET message = ?
        WHERE id = ?
    ''', (new_message, message_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Message updated successfully'}), 200

@app.route('/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM messages WHERE id = ?', (message_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Message deleted successfully'}), 200

# Routes existantes (non modifiées)
@app.route('/admin/workouts', methods=['GET'])
def get_all_workouts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT workouts.id, workouts.date, workouts.type, workouts.duration, workouts.exercises, workouts.status,
               users.id as user_id, users.name as user_name, users.sport_goal, users.coach_id
        FROM workouts
        JOIN users ON workouts.user_id = users.id
        WHERE workouts.date >= date('now')
    ''')
    workouts = cursor.fetchall()
    conn.close()

    workout_list = []
    for workout in workouts:
        workout_list.append({
            'id': workout['id'],
            'date': workout['date'],
            'type': workout['type'],
            'duration': workout['duration'],
            'exercises': workout['exercises'],
            'status': workout['status'],
            'user_id': workout['user_id'],
            'user_name': workout['user_name'],
            'sport_goal': workout['sport_goal'],
            'coach_id': workout['coach_id']
        })

    return jsonify(workout_list), 200

@app.route('/admin/change-role/<int:user_id>', methods=['PUT'])
def change_user_role(user_id):
    data = request.get_json()
    new_role = data.get('role')

    if new_role not in ['admin', 'coach', 'user']:
        return jsonify({'message': 'Rôle invalide'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET role = ? WHERE id = ?', (new_role, user_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Rôle mis à jour avec succès'}), 200

@app.route('/admin/assign-coach/<int:user_id>', methods=['PUT'])
def assign_coach(user_id):
    data = request.get_json()
    coach_id = data.get('coach_id')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET coach_id = ? WHERE id = ?', (coach_id, user_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Coach assigné avec succès'}), 200

@app.route('/admin/users', methods=['GET'])
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, name, age, weight, height, sport_goal, role, coach_id FROM users')
    users = cursor.fetchall()
    conn.close()

    user_list = []
    for user in users:
        user_list.append({
            'id': user['id'],
            'username': user['username'],
            'name': user['name'],
            'age': user['age'],
            'weight': user['weight'],
            'height': user['height'],
            'sport_goal': user['sport_goal'],
            'role': user['role'],
            'coach_id': user['coach_id']
        })

    return jsonify(user_list), 200

@app.route('/user/<int:user_id>/change-password', methods=['PUT'])
def change_password(user_id):
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT password_hash FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({'message': 'Utilisateur non trouvé'}), 404

    if not bcrypt.check_password_hash(user['password_hash'], old_password):
        conn.close()
        return jsonify({'message': 'Ancien mot de passe incorrect'}), 401

    new_password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')

    cursor.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_password_hash, user_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Mot de passe mis à jour avec succès'}), 200

@app.route('/user/<int:user_id>', methods=['PUT'])
def update_user_profile(user_id):
    data = request.get_json()
    username = data.get('username')
    name = data.get('name')
    age = data.get('age')
    weight = data.get('weight')
    height = data.get('height')
    sport_goal = data.get('sport_goal')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users
        SET username = ?, name = ?, age = ?, weight = ?, height = ?, sport_goal = ?
        WHERE id = ?
    ''', (username, name, age, weight, height, sport_goal, user_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User profile updated successfully'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    name = data['name']
    age = data['age']
    weight = data['weight']
    height = data['height']
    sport_goal = data['sport_goal']

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (username, password_hash, name, age, weight, height, sport_goal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (username, password_hash, name, age, weight, height, sport_goal))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.check_password_hash(user['password_hash'], password):
        return jsonify({'message': 'Login successful', 'user_id': user['id']}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        user_profile = {
            'username': user['username'],
            'name': user['name'],
            'age': user['age'],
            'weight': user['weight'],
            'height': user['height'],
            'sport_goal': user['sport_goal'],
            'role': user['role'],
            'coach_id': user['coach_id']
        }
        return jsonify(user_profile), 200
    else:
        return jsonify({'message': 'User not found'}), 404

@app.route('/workout', methods=['POST'])
def add_workout():
    data = request.get_json()
    user_id = data['user_id']
    date = data['date']
    workout_type = data['type']
    duration = data['duration']
    exercises = data['exercises']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO workouts (user_id, date, type, duration, exercises) VALUES (?, ?, ?, ?, ?)',
                   (user_id, date, workout_type, duration, exercises))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Workout added successfully'}), 201

@app.route('/workout/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    data = request.get_json()
    date = data['date']
    workout_type = data['type']
    duration = data['duration']
    exercises = data['exercises']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE workouts SET date = ?, type = ?, duration = ?, exercises = ? WHERE id = ?',
                   (date, workout_type, duration, exercises, workout_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Workout updated successfully'}), 200

@app.route('/workout/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM workouts WHERE id = ?', (workout_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Workout deleted successfully'}), 200

@app.route('/workouts/<int:user_id>', methods=['GET'])
def get_workouts(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM workouts WHERE user_id = ?', (user_id,))
    workouts = cursor.fetchall()
    conn.close()

    workout_list = []
    for workout in workouts:
        workout_list.append({
            'id': workout['id'],
            'date': workout['date'],
            'type': workout['type'],
            'duration': workout['duration'],
            'exercises': workout['exercises']
        })

    return jsonify(workout_list), 200

@app.route('/goal', methods=['POST'])
def set_goal():
    data = request.get_json()
    user_id = data['user_id']
    goal_type = data['goal_type']
    target_date = data['target_date']
    current_progress = data['current_progress']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO goals (user_id, goal_type, target_date, current_progress) VALUES (?, ?, ?, ?)',
                   (user_id, goal_type, target_date, current_progress))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Goal set successfully'}), 201

@app.route('/goal/<int:user_id>', methods=['GET'])
def get_goal(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM goals WHERE user_id = ?', (user_id,))
    goal = cursor.fetchone()
    conn.close()

    if goal:
        goal_info = {
            'goal_type': goal['goal_type'],
            'target_date': goal['target_date'],
            'current_progress': goal['current_progress']
        }
        return jsonify(goal_info), 200
    else:
        return jsonify({'message': 'No goal set'}), 404

@app.route('/stats/<int:user_id>', methods=['GET'])
def get_stats(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM workouts WHERE user_id = ?', (user_id,))
    workouts = cursor.fetchall()
    conn.close()

    stats = {
        'total_workouts': len(workouts),
        'total_duration': sum(workout['duration'] for workout in workouts),
        'calories_burned': sum(workout['duration'] * 10 for workout in workouts)
    }

    return jsonify(stats), 200

@app.route('/notification', methods=['POST'])
def add_notification():
    data = request.get_json()
    user_id = data['user_id']
    message = data['message']
    date = data['date']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO notifications (user_id, message, date) VALUES (?, ?, ?)',
                   (user_id, message, date))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Notification added successfully'}), 201

@app.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM notifications WHERE user_id = ?', (user_id,))
    notifications = cursor.fetchall()
    conn.close()

    notification_list = []
    for notification in notifications:
        notification_list.append({
            'message': notification['message'],
            'date': notification['date']
        })

    return jsonify(notification_list), 200

@app.route('/exercices', methods=['GET'])
def get_exercises():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM exercices')
    exercises = cursor.fetchall()
    conn.close()

    exercise_list = []
    for exercise in exercises:
        exercise_list.append({
            'id': exercise['id'],
            'name': exercise['name'],
            'description': exercise['description'],
            'category': exercise['category']
        })

    return jsonify(exercise_list), 200

@app.route('/subscriptions', methods=['GET'])
def get_subscriptions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM subscriptions')
    subscriptions = cursor.fetchall()
    conn.close()

    subscription_list = []
    for subscription in subscriptions:
        subscription_list.append({
            'id': subscription['id'],
            'name': subscription['name'],
            'price': subscription['price'],
            'color': subscription['color'],
            'features': subscription['features'].split(',')
        })

    return jsonify(subscription_list), 200

@app.route('/user/<int:user_id>/subscription', methods=['POST'])
def update_user_subscription(user_id):
    data = request.get_json()
    subscription_name = data.get('subscription_name')

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'message': 'Utilisateur non trouvé'}), 404

        cursor.execute('SELECT id FROM subscriptions WHERE name = ?', (subscription_name,))
        subscription = cursor.fetchone()
        if not subscription:
            return jsonify({'message': 'Abonnement non trouvé'}), 404

        cursor.execute('''
            UPDATE subscriptions
            SET user_id = ?
            WHERE name = ?
        ''', (user_id, subscription_name))

        conn.commit()
        return jsonify({'message': 'Abonnement mis à jour avec succès'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Erreur: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/nutrition', methods=['POST'])
def add_nutrition():
    data = request.get_json()
    name = data['name']
    ingredients = data['ingredients']
    preparation_time = data['preparation_time']
    calories = data['calories']
    category = data['category']
    goal_category = data['goal_category']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO nutrition (name, ingredients, preparation_time, calories, category, goal_category)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, ingredients, preparation_time, calories, category, goal_category))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Nutrition entry added successfully'}), 201

@app.route('/nutrition', methods=['GET'])
def get_nutrition():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM nutrition')
    nutrition_entries = cursor.fetchall()
    conn.close()

    nutrition_list = []
    for entry in nutrition_entries:
        nutrition_list.append({
            'id': entry['id'],
            'name': entry['name'],
            'ingredients': entry['ingredients'],
            'preparation_time': entry['preparation_time'],
            'calories': entry['calories'],
            'category': entry['category'],
            'goal_category': entry['goal_category']
        })

    return jsonify(nutrition_list), 200

@app.route('/nutrition/<int:nutrition_id>', methods=['GET'])
def get_nutrition_entry(nutrition_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM nutrition WHERE id = ?', (nutrition_id,))
    entry = cursor.fetchone()
    conn.close()

    if entry:
        nutrition_entry = {
            'id': entry['id'],
            'name': entry['name'],
            'ingredients': entry['ingredients'],
            'preparation_time': entry['preparation_time'],
            'calories': entry['calories'],
            'category': entry['category'],
            'goal_category': entry['goal_category']
        }
        return jsonify(nutrition_entry), 200
    else:
        return jsonify({'message': 'Nutrition entry not found'}), 404

@app.route('/nutrition/<int:nutrition_id>', methods=['PUT'])
def update_nutrition(nutrition_id):
    data = request.get_json()
    name = data['name']
    ingredients = data['ingredients']
    preparation_time = data['preparation_time']
    calories = data['calories']
    category = data['category']
    goal_category = data['goal_category']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE nutrition
        SET name = ?, ingredients = ?, preparation_time = ?, calories = ?, category = ?, goal_category = ?
        WHERE id = ?
    ''', (name, ingredients, preparation_time, calories, category, goal_category, nutrition_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Nutrition entry updated successfully'}), 200

@app.route('/nutrition/<int:nutrition_id>', methods=['DELETE'])
def delete_nutrition(nutrition_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM nutrition WHERE id = ?', (nutrition_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Nutrition entry deleted successfully'}), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host="0.0.0.0")