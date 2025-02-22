from app import db

class InputData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(200), nullable=False)
