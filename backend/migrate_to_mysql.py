import sqlite3
import mysql.connector
from app.config import Config
from dotenv import load_dotenv
import os

load_dotenv()

def migrate_data():
    # Connect to SQLite database
    sqlite_conn = sqlite3.connect('instance/emergency.db')
    sqlite_cursor = sqlite_conn.cursor()

    # Connect to MySQL database
    mysql_conn = mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB
    )
    mysql_cursor = mysql_conn.cursor()

    try:
        # Get all records from SQLite
        sqlite_cursor.execute("SELECT * FROM dialer_records")
        records = sqlite_cursor.fetchall()

        # Get column names
        columns = [description[0] for description in sqlite_cursor.description]

        # Create insert query
        placeholders = ', '.join(['%s'] * len(columns))
        columns_str = ', '.join(columns)
        insert_query = f"INSERT INTO dialer_records ({columns_str}) VALUES ({placeholders})"

        # Insert records into MySQL
        for record in records:
            mysql_cursor.execute(insert_query, record)

        # Commit the transaction
        mysql_conn.commit()
        print(f"Successfully migrated {len(records)} records to MySQL")

    except Exception as e:
        print(f"Error during migration: {str(e)}")
        mysql_conn.rollback()

    finally:
        # Close connections
        sqlite_cursor.close()
        sqlite_conn.close()
        mysql_cursor.close()
        mysql_conn.close()

if __name__ == "__main__":
    migrate_data()
