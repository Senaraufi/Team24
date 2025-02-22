from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class InputData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(200), nullable=False)

@app.route('/api/input', methods=['POST'])
def add_input():
    data = request.json.get('data')
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    new_input = InputData(data=data)
    db.session.add(new_input)
    db.session.commit()

    return jsonify({'message': 'Data added successfully'}), 201

@app.route('/api/input', methods=['GET'])
def get_inputs():
    inputs = InputData.query.all()
    return jsonify([{'id': input.id, 'data': input.data} for input in inputs])

if __name__ == '__main__':
    app.run(debug=True, port=5001)
