# database/mysql_manager.py
import mysql.connector
from mysql.connector import pooling
import json
from datetime import datetime
import logging
from config.database_config import DatabaseConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MySQLDatabase:
    """MySQL Database Manager for NIDS"""
    
    def __init__(self, environment='DEV'):
        self.environment = environment
        self.config = DatabaseConfig.DEV if environment == 'DEV' else DatabaseConfig.PROD
        self.connection_pool = None
        self.init_pool()
        self.init_database()
    
    def init_pool(self):
        """Initialize connection pool"""
        try:
            self.connection_pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name=self.config['pool_name'],
                pool_size=self.config['pool_size'],
                host=self.config['host'],
                port=self.config['port'],
                user=self.config['user'],
                password=self.config['password'],
                database=self.config['database'],
                charset=self.config['charset']
            )
            logger.info(f"✅ MySQL connection pool initialized for {self.config['database']}")
        except mysql.connector.Error as err:
            logger.error(f"❌ Failed to initialize connection pool: {err}")
            raise
    
    def get_connection(self):
        """Get connection from pool"""
        try:
            return self.connection_pool.get_connection()
        except mysql.connector.Error as err:
            logger.error(f"❌ Failed to get connection: {err}")
            raise
    
    def init_database(self):
        """Initialize database tables if they don't exist"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        try:
            # Create predictions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS predictions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    prediction TINYINT,
                    prediction_label VARCHAR(20),
                    confidence DECIMAL(5,2),
                    attack_probability DECIMAL(5,2),
                    normal_probability DECIMAL(5,2),
                    features_count INT,
                    
                    -- Key features for indexing and analysis
                    src_bytes BIGINT,
                    dst_bytes BIGINT,
                    count INT,
                    srv_count INT,
                    serror_rate DECIMAL(5,4),
                    srv_serror_rate DECIMAL(5,4),
                    dst_host_count INT,
                    dst_host_srv_count INT,
                    dst_host_serror_rate DECIMAL(5,4),
                    dst_host_srv_serror_rate DECIMAL(5,4),
                    duration DECIMAL(10,4),
                    
                    -- Metadata
                    is_attack BOOLEAN,
                    client_ip VARCHAR(45),
                    user_agent TEXT,
                    request_path VARCHAR(255),
                    raw_data JSON,
                    
                    -- Indexes for performance
                    INDEX idx_timestamp (timestamp),
                    INDEX idx_is_attack (is_attack),
                    INDEX idx_prediction (prediction),
                    INDEX idx_src_bytes (src_bytes),
                    INDEX idx_client_ip (client_ip)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
            # Create attacks table (for security incidents)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attacks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    prediction_id INT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    attack_type VARCHAR(50),
                    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
                    alert_sent BOOLEAN DEFAULT FALSE,
                    acknowledged BOOLEAN DEFAULT FALSE,
                    acknowledged_by VARCHAR(100),
                    acknowledged_at TIMESTAMP NULL,
                    notes TEXT,
                    
                    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
                    INDEX idx_attack_type (attack_type),
                    INDEX idx_severity (severity),
                    INDEX idx_alert_sent (alert_sent)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
            # Create statistics table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS statistics (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date DATE UNIQUE,
                    total_predictions INT DEFAULT 0,
                    attack_count INT DEFAULT 0,
                    normal_count INT DEFAULT 0,
                    false_positives INT DEFAULT 0,
                    false_negatives INT DEFAULT 0,
                    avg_confidence DECIMAL(5,2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
            connection.commit()
            logger.info("✅ Database tables initialized successfully")
            
        except mysql.connector.Error as err:
            logger.error(f"❌ Failed to initialize database: {err}")
            connection.rollback()
            raise
        
        finally:
            cursor.close()
            connection.close()
    
    def log_prediction(self, prediction_data, client_ip=None, user_agent=None, request_path=None):
        """Log a prediction to database"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        try:
            # Extract features from prediction data
            features = prediction_data.get('features', {})
            
            cursor.execute('''
                INSERT INTO predictions (
                    prediction, prediction_label, confidence,
                    attack_probability, normal_probability,
                    features_count,
                    src_bytes, dst_bytes, count, srv_count,
                    serror_rate, srv_serror_rate,
                    dst_host_count, dst_host_srv_count,
                    dst_host_serror_rate, dst_host_srv_serror_rate,
                    duration,
                    is_attack, client_ip, user_agent, request_path, raw_data
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                prediction_data.get('prediction'),
                prediction_data.get('prediction_label'),
                prediction_data.get('confidence'),
                prediction_data.get('probabilities', {}).get('attack', 0),
                prediction_data.get('probabilities', {}).get('normal', 0),
                prediction_data.get('features_received', 0),
                features.get('src_bytes', 0),
                features.get('dst_bytes', 0),
                features.get('count', 0),
                features.get('srv_count', 0),
                features.get('serror_rate', 0),
                features.get('srv_serror_rate', 0),
                features.get('dst_host_count', 0),
                features.get('dst_host_srv_count', 0),
                features.get('dst_host_serror_rate', 0),
                features.get('dst_host_srv_serror_rate', 0),
                features.get('duration', 0),
                prediction_data.get('prediction') == 1,
                client_ip,
                user_agent,
                request_path,
                json.dumps(prediction_data)
            ))
            
            prediction_id = cursor.lastrowid
            
            # If it's an attack, log to attacks table
            if prediction_data.get('prediction') == 1:
                attack_type = self._determine_attack_type(features)
                severity = self._determine_severity(prediction_data)
                
                cursor.execute('''
                    INSERT INTO attacks (prediction_id, attack_type, severity)
                    VALUES (%s, %s, %s)
                ''', (prediction_id, attack_type, severity))
            
            # Update daily statistics
            self._update_statistics(connection, cursor, prediction_data)
            
            connection.commit()
            logger.info(f"✅ Prediction logged with ID: {prediction_id}")
            
            return prediction_id
            
        except mysql.connector.Error as err:
            logger.error(f"❌ Failed to log prediction: {err}")
            connection.rollback()
            raise
        
        finally:
            cursor.close()
            connection.close()
    
    def _determine_attack_type(self, features):
        """Determine type of attack based on features"""
        src_bytes = features.get('src_bytes', 0)
        dst_bytes = features.get('dst_bytes', 0)
        count = features.get('count', 0)
        serror_rate = features.get('serror_rate', 0)
        duration = features.get('duration', 0)
        
        if src_bytes > 50000 and dst_bytes == 0:
            return "DoS Attack"
        elif count > 500:
            return "High Volume Attack"
        elif serror_rate > 0.7:
            return "Error-Based Attack"
        elif duration > 10 and count > 100:
            return "Port Scanning"
        elif src_bytes > 100000:
            return "Flood Attack"
        else:
            return "Suspicious Activity"
    
    def _determine_severity(self, prediction_data):
        """Determine attack severity based on probability"""
        attack_prob = prediction_data.get('probabilities', {}).get('attack', 0)
        
        if attack_prob > 80:
            return "CRITICAL"
        elif attack_prob > 60:
            return "HIGH"
        elif attack_prob > 40:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _update_statistics(self, connection, cursor, prediction_data):
        """Update daily statistics"""
        today = datetime.now().date()
        
        # Check if today's record exists
        cursor.execute('SELECT id FROM statistics WHERE date = %s', (today,))
        result = cursor.fetchone()
        
        if result:
            # Update existing record
            stats_id = result[0]
            is_attack = prediction_data.get('prediction') == 1
            
            if is_attack:
                cursor.execute('''
                    UPDATE statistics 
                    SET attack_count = attack_count + 1,
                        total_predictions = total_predictions + 1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (stats_id,))
            else:
                cursor.execute('''
                    UPDATE statistics 
                    SET normal_count = normal_count + 1,
                        total_predictions = total_predictions + 1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (stats_id,))
        else:
            # Create new record
            is_attack = prediction_data.get('prediction') == 1
            
            cursor.execute('''
                INSERT INTO statistics (date, total_predictions, attack_count, normal_count, avg_confidence)
                VALUES (%s, 1, %s, %s, %s)
            ''', (
                today,
                1 if is_attack else 0,
                0 if is_attack else 1,
                prediction_data.get('confidence', 0)
            ))
    
    # Query Methods
    def get_recent_predictions(self, limit=50):
        """Get recent predictions"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            cursor.execute('''
                SELECT * FROM predictions 
                ORDER BY timestamp DESC 
                LIMIT %s
            ''', (limit,))
            return cursor.fetchall()
        finally:
            cursor.close()
            connection.close()
    
    def get_attacks_today(self):
        """Get today's attacks"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            cursor.execute('''
                SELECT p.*, a.attack_type, a.severity 
                FROM predictions p
                JOIN attacks a ON p.id = a.prediction_id
                WHERE DATE(p.timestamp) = CURDATE()
                ORDER BY p.timestamp DESC
            ''')
            return cursor.fetchall()
        finally:
            cursor.close()
            connection.close()
    
    def get_statistics(self, days=7):
        """Get statistics for last N days"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            cursor.execute('''
                SELECT * FROM statistics 
                WHERE date >= CURDATE() - INTERVAL %s DAY
                ORDER BY date DESC
            ''', (days,))
            return cursor.fetchall()
        finally:
            cursor.close()
            connection.close()
    
    def search_predictions(self, start_date, end_date, is_attack=None, min_confidence=None):
        """Search predictions with filters"""
        connection = self.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            query = '''
                SELECT * FROM predictions 
                WHERE timestamp BETWEEN %s AND %s
            '''
            params = [start_date, end_date]
            
            if is_attack is not None:
                query += ' AND is_attack = %s'
                params.append(is_attack)
            
            if min_confidence is not None:
                query += ' AND confidence >= %s'
                params.append(min_confidence)
            
            query += ' ORDER BY timestamp DESC'
            
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            cursor.close()
            connection.close()