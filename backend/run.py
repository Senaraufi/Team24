import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Print the environment variables to check they're loaded correctly
print("MYSQL_USER:", os.getenv('MYSQL_USER'))
print("MYSQL_PASSWORD:", os.getenv('MYSQL_PASSWORD'))

from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5001)
