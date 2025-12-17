# config/database_config.py
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class DatabaseConfig:
    """MySQL Database Configuration"""
    
    # Development database
    DEV = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('DB_USER', 'nids_user'),
        'password': os.getenv('DB_PASSWORD', 'nids_password'),
        'database': os.getenv('DB_NAME', 'nids_database'),
        'charset': 'utf8mb4',
        'pool_size': 5,
        'pool_name': 'nids_pool'
    }
    
    # Production database
    PROD = {
        'host': os.getenv('PROD_DB_HOST', 'localhost'),
        'port': int(os.getenv('PROD_DB_PORT', 3306)),
        'user': os.getenv('PROD_DB_USER', 'nids_user'),
        'password': os.getenv('PROD_DB_PASSWORD', ''),
        'database': os.getenv('PROD_DB_NAME', 'nids_production'),
        'charset': 'utf8mb4',
        'pool_size': 10,
        'pool_name': 'nids_prod_pool'
    }