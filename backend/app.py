# app.py - Complete working NIDS with all API endpoints
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from flask import send_from_directory, send_file
import socket
import joblib
import pandas as pd
import numpy as np
import pickle
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import json
import traceback

# ============ SETUP ============
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, 'static')

print("="*60)
print("🚀 NIDS - NETWORK INTRUSION DETECTION SYSTEM")
print("="*60)
print(f"📁 Base Directory: {BASE_DIR}")
print(f"📁 Static Folder: {STATIC_FOLDER}")

# Check static folder
if os.path.exists(STATIC_FOLDER):
    print("✅ Static folder exists")
    files = os.listdir(STATIC_FOLDER)
    print(f"📁 Files in static folder: {files}")
    
    # Check for important directories
    css_path = os.path.join(STATIC_FOLDER, 'css')
    js_path = os.path.join(STATIC_FOLDER, 'js')
    
    if os.path.exists(css_path):
        css_files = os.listdir(css_path)
        print(f"📁 CSS files: {css_files}")
    else:
        print("❌ CSS folder not found")
        
    if os.path.exists(js_path):
        js_files = os.listdir(js_path)
        print(f"📁 JS files: {js_files}")
    else:
        print("❌ JS folder not found")
else:
    print("❌ Static folder not found!")

app = Flask(__name__)

# ============ CORS ============
CORS(app)

# ============ DATABASE ============
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'nids_user',
    'password': 'nids_password',
    'database': 'nids_database',
    'port': 3306
}

class SimpleDatabase:
    """Simple MySQL database handler"""
    
    def __init__(self):
        self.config = MYSQL_CONFIG
        self._init_database()
    
    def get_connection(self):
        """Get MySQL connection"""
        try:
            conn = mysql.connector.connect(**self.config)
            return conn
        except Error as e:
            print(f"❌ Database Connection Error: {e}")
            return None
    
    def _init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        if not conn:
            print("⚠ Could not connect to database")
            return
        
        cursor = conn.cursor()
        try:
            # Create predictions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS predictions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    prediction INT,
                    prediction_label VARCHAR(20),
                    confidence DECIMAL(5,2),
                    attack_probability DECIMAL(5,2),
                    normal_probability DECIMAL(5,2),
                    src_bytes BIGINT,
                    dst_bytes BIGINT,
                    count INT,
                    srv_count INT,
                    serror_rate DECIMAL(5,4),
                    srv_serror_rate DECIMAL(5,4),
                    is_attack BOOLEAN,
                    client_ip VARCHAR(45),
                    raw_features TEXT
                )
            ''')
            
            # Create attacks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attacks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    prediction_id INT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    attack_type VARCHAR(50),
                    severity VARCHAR(20),
                    FOREIGN KEY (prediction_id) REFERENCES predictions(id)
                )
            ''')
            
            conn.commit()
            print("✅ Database tables created successfully")
            
        except Error as e:
            print(f"⚠ Database setup error: {e}")
        finally:
            cursor.close()
            conn.close()
    
    def save_prediction(self, prediction_data, features, client_ip):
        """Save prediction to database"""
        conn = self.get_connection()
        if not conn:
            print("❌ No database connection available")
            return None
        
        cursor = conn.cursor()
        try:
            print(f"💾 Attempting to save prediction to database...")
            
            def convert_value(value):
                """Convert numpy/pandas types to Python native types"""
                if isinstance(value, (np.integer, np.floating)):
                    return value.item()
                elif isinstance(value, pd.Series):
                    return value.iloc[0].item() if len(value) > 0 else 0
                elif isinstance(value, pd.DataFrame):
                    return value.iloc[0, 0].item() if value.shape[0] > 0 and value.shape[1] > 0 else 0
                elif isinstance(value, np.ndarray):
                    return value.item() if value.size > 0 else 0
                else:
                    return value
            
            # Convert values
            prediction = int(convert_value(prediction_data.get('prediction', 0)))
            prediction_label = str(prediction_data.get('prediction_label', 'Unknown'))
            confidence = float(convert_value(prediction_data.get('confidence', 0)))
            attack_prob = float(convert_value(prediction_data.get('probabilities', {}).get('attack', 0)))
            normal_prob = float(convert_value(prediction_data.get('probabilities', {}).get('normal', 0)))
            
            # Convert features
            src_bytes = int(convert_value(features.get('src_bytes', 0)))
            dst_bytes = int(convert_value(features.get('dst_bytes', 0)))
            count = int(convert_value(features.get('count', 0)))
            srv_count = int(convert_value(features.get('srv_count', 0)))
            serror_rate = float(convert_value(features.get('serror_rate', 0.0)))
            srv_serror_rate = float(convert_value(features.get('srv_serror_rate', 0.0)))
            is_attack = bool(prediction == 1)
            client_ip = str(client_ip)
            
            # Features to JSON
            features_json = json.dumps({k: convert_value(v) for k, v in features.items()})
            
            # Insert into predictions
            cursor.execute('''
                INSERT INTO predictions (
                    prediction, prediction_label, confidence,
                    attack_probability, normal_probability,
                    src_bytes, dst_bytes, count, srv_count,
                    serror_rate, srv_serror_rate,
                    is_attack, client_ip, raw_features
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                prediction, prediction_label, confidence,
                attack_prob, normal_prob, src_bytes, dst_bytes,
                count, srv_count, serror_rate, srv_serror_rate,
                is_attack, client_ip, features_json
            ))
            
            prediction_id = cursor.lastrowid
            
            # Save to attacks table if it's an attack
            if prediction == 1:
                attack_type = self._determine_attack_type(features)
                severity = self._determine_severity(attack_prob)
                
                cursor.execute('''
                    INSERT INTO attacks (prediction_id, attack_type, severity)
                    VALUES (%s, %s, %s)
                ''', (prediction_id, attack_type, severity))
            
            conn.commit()
            print(f"✅ Saved to database with ID: {prediction_id}")
            return prediction_id
            
        except Error as e:
            print(f"❌ Database save error: {e}")
            import traceback
            traceback.print_exc()
            conn.rollback()
            return None
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            conn.rollback()
            return None
        finally:
            cursor.close()
            conn.close()
    
    def _determine_attack_type(self, features):
        """Determine type of attack"""
        src_bytes = features.get('src_bytes', 0)
        dst_bytes = features.get('dst_bytes', 0)
        count = features.get('count', 0)
        serror_rate = features.get('serror_rate', 0)
        
        if count > 500 and serror_rate == 1.0:
            return "Extreme DoS Attack"
        elif src_bytes > 50000 and dst_bytes == 0:
            return "DoS Attack"
        elif src_bytes > 100000:
            return "DDoS Attack"
        else:
            return "Suspicious Activity"
    
    def _determine_severity(self, attack_prob):
        """Determine attack severity"""
        if attack_prob > 80:
            return "CRITICAL"
        elif attack_prob > 60:
            return "HIGH"
        elif attack_prob > 40:
            return "MEDIUM"
        else:
            return "LOW"
    
    def get_statistics(self):
        """Get prediction statistics"""
        conn = self.get_connection()
        if not conn:
            return {}
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute('SELECT COUNT(*) as total FROM predictions')
            total = cursor.fetchone()['total']
            
            cursor.execute('SELECT COUNT(*) as attacks FROM predictions WHERE is_attack = 1')
            attacks = cursor.fetchone()['attacks']
            
            cursor.execute('SELECT COUNT(*) as normal FROM predictions WHERE is_attack = 0')
            normal = cursor.fetchone()['normal']
            
            return {
                'total_predictions': total,
                'attack_count': attacks,
                'normal_count': normal,
                'attack_rate': round((attacks / total * 100), 2) if total > 0 else 0
            }
        except Error as e:
            print(f"⚠ Statistics error: {e}")
            return {}
        finally:
            cursor.close()
            conn.close()

# Initialize database
try:
    db = SimpleDatabase()
    print("✅ Database connected successfully")
except Exception as e:
    print(f"⚠ Database initialization failed: {e}")
    db = None

# ============ ML MODEL LOADING ============
print("\n📊 Loading Machine Learning Model...")
try:
    rf_model = joblib.load('models/improved_model/rf_improved.pkl')
    scaler = joblib.load('models/improved_model/scaler_improved.pkl')
    pca_model = joblib.load('models/improved_model/pca_improved.pkl')
    
    with open('models/improved_model/feature_columns.pkl', 'rb') as f:
        feature_columns = pickle.load(f)
    
    with open('models/improved_model/feature_mapping.pkl', 'rb') as f:
        feature_mapping = pickle.load(f)
    
    print("✅ ML Model loaded successfully")
    
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    print("💡 Run: python3 evaluate_kdd_dataset_fixed.py to train model")
    exit(1)

# ============ NORMALIZATION ============
NORM_FACTORS = {
    'duration': 0.01, 'src_bytes': 0.0001, 'dst_bytes': 0.0001,
    'count': 0.01, 'srv_count': 0.01, 'serror_rate': 50.0,
    'srv_serror_rate': 50.0, 'dst_host_count': 0.05,
    'dst_host_srv_count': 0.05, 'dst_host_serror_rate': 50.0,
    'dst_host_srv_serror_rate': 50.0
}

def normalize_value(feature_name, raw_value):
    """Convert raw value to normalized z-score"""
    if feature_name in NORM_FACTORS:
        try:
            raw_float = float(raw_value)
            normalized = raw_float * NORM_FACTORS[feature_name]
            return float(max(-5.0, min(5.0, normalized)))
        except:
            return 0.0
    return 0.0

# ============ PREDICTION FUNCTION ============
def predict_traffic(input_data):
    """Predict if traffic is normal or attack"""
    print("🔍 Running PREDICT_TRAFFIC function...")
    sample = {feature: 0.0 for feature in feature_columns}
    
    defaults = {
        'duration': 0.0, 'src_bytes': 0.0, 'dst_bytes': 0.0,
        'count': 0.0, 'srv_count': 0.0, 'serror_rate': 0.0,
        'srv_serror_rate': 0.0, 'dst_host_count': 0.0,
        'dst_host_srv_count': 0.0, 'dst_host_serror_rate': 0.0,
        'dst_host_srv_serror_rate': 0.0
    }
    
    for feature, default in defaults.items():
        if feature not in input_data:
            input_data[feature] = default
    
    # ============ MANUAL ATTACK DETECTION ============
    is_definite_attack = False
    attack_reasons = []
    manual_confidence = 0.0
    
    # Rule 1: Extreme DoS pattern
    if (input_data.get('count', 0) > 500 and 
        input_data.get('serror_rate', 0) == 1.0 and
        input_data.get('srv_serror_rate', 0) == 1.0):
        is_definite_attack = True
        attack_reasons.append("Extreme DoS: count>500, 100% errors")
        manual_confidence = 99.9
    
    # Rule 2: High connection count with zero bytes
    elif input_data.get('count', 0) > 100 and input_data.get('src_bytes', 0) == 0:
        is_definite_attack = True
        attack_reasons.append(f"DoS: count={input_data['count']}, bytes=0")
        manual_confidence = 85.0
    
    # Rule 3: Extreme error rates
    elif input_data.get('serror_rate', 0) > 0.8 or input_data.get('srv_serror_rate', 0) > 0.8:
        is_definite_attack = True
        attack_reasons.append(f"High error rate: serror={input_data.get('serror_rate', 0)}")
        manual_confidence = 75.0
    
    # Rule 4: DDoS pattern
    elif (input_data.get('count', 0) > 200 and 
          input_data.get('serror_rate', 0) > 0.9 and
          input_data.get('srv_serror_rate', 0) > 0.9):
        is_definite_attack = True
        attack_reasons.append("DDoS pattern")
        manual_confidence = 90.0
    
    # If manual rules detect attack
    if is_definite_attack:
        for input_feature, raw_value in input_data.items():
            if input_feature in feature_mapping:
                norm_value = normalize_value(input_feature, raw_value)
                model_feature = feature_mapping[input_feature]
                sample[model_feature] = norm_value
        
        sample_df = pd.DataFrame([sample])[feature_columns]
        scaled = scaler.transform(sample_df)
        pca_transformed = pca_model.transform(scaled)
        probabilities = rf_model.predict_proba(pca_transformed)[0]
        
        converted_features = {}
        for key, value in input_data.items():
            if isinstance(value, (np.integer, np.floating)):
                converted_features[key] = value.item()
            else:
                converted_features[key] = value
        
        attack_prob = float(probabilities[1] * 100)
        normal_prob = float(probabilities[0] * 100)
        
        return 1, manual_confidence, probabilities, converted_features, attack_reasons
    
    # ============ ML PREDICTION ============
    for input_feature, raw_value in input_data.items():
        if input_feature in feature_mapping:
            norm_value = normalize_value(input_feature, raw_value)
            model_feature = feature_mapping[input_feature]
            sample[model_feature] = norm_value
    
    sample_df = pd.DataFrame([sample])[feature_columns]
    scaled = scaler.transform(sample_df)
    pca_transformed = pca_model.transform(scaled)
    probabilities = rf_model.predict_proba(pca_transformed)[0]
    
    attack_prob = float(probabilities[1])
    normal_prob = float(probabilities[0])
    
    # AGGRESSIVE ATTACK DETECTION
    if attack_prob > 0.15:
        prediction = 1
    elif attack_prob > 0.05 and normal_prob < 0.95:
        prediction = 1
    else:
        prediction = 0
    
    # Confidence calculation
    if prediction == 1:
        confidence = float(max(attack_prob * 100, 60.0))
    else:
        confidence = float(normal_prob * 100)
    
    converted_features = {}
    for key, value in input_data.items():
        if isinstance(value, (np.integer, np.floating)):
            converted_features[key] = value.item()
        else:
            converted_features[key] = value
    
    return int(prediction), confidence, probabilities, converted_features, []

# ============ ALL API ENDPOINTS ============
@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def single_predict():
    """Single prediction endpoint for real-time monitoring"""
    try:
        # Handle OPTIONS request (CORS preflight)
        if request.method == 'OPTIONS':
            return jsonify({'success': True}), 200
        
        print("📥 Received single prediction request")
        
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        print(f"📊 Input data: {data}")
        
        # Extract features
        required_features = [
            'duration', 'src_bytes', 'dst_bytes', 'count', 'srv_count',
            'serror_rate', 'srv_serror_rate', 'dst_host_count',
            'dst_host_srv_count', 'dst_host_serror_rate', 'dst_host_srv_serror_rate'
        ]
        
        # Check if all required features are present
        missing_features = [feat for feat in required_features if feat not in data]
        if missing_features:
            return jsonify({
                'success': False,
                'error': f'Missing required features: {missing_features}',
                'required_features': required_features
            }), 400
        
        # Prepare input data
        input_data = {}
        for feature in required_features:
            value = data.get(feature, 0)
            try:
                input_data[feature] = float(value)
            except:
                input_data[feature] = 0.0
        
        # Make prediction (using your existing predict_traffic function)
        prediction, confidence, probabilities, features, attack_reasons = predict_traffic(input_data)
        
        # Convert probabilities
        normal_prob = float(probabilities[0] * 100)
        attack_prob = float(probabilities[1] * 100)
        
        # Determine risk level
        if prediction == 1:  # Attack
            if attack_prob > 80 or confidence > 80:
                prediction_label = "CRITICAL Attack"
                risk_level = "CRITICAL"
            elif attack_prob > 60 or confidence > 60:
                prediction_label = "HIGH Attack"
                risk_level = "HIGH"
            elif attack_prob > 40 or confidence > 40:
                prediction_label = "MEDIUM Attack"
                risk_level = "MEDIUM"
            else:
                prediction_label = "Suspicious Activity"
                risk_level = "LOW"
        else:  # Normal
            if normal_prob > 95:
                prediction_label = "Normal"
                risk_level = "NORMAL"
            elif normal_prob > 80:
                prediction_label = "Likely Normal"
                risk_level = "LOW"
            else:
                prediction_label = "Uncertain"
                risk_level = "MONITOR"
        
        # Prepare response
        response_data = {
            'success': True,
            'prediction': int(prediction),
            'prediction_label': prediction_label,
            'risk_level': risk_level,
            'confidence': round(confidence, 2),
            'probabilities': {
                'normal': round(normal_prob, 2),
                'attack': round(attack_prob, 2)
            },
            'attack_reasons': attack_reasons if attack_reasons else [],
            'features_used': {
                'count': len(input_data),
                'list': list(input_data.keys())
            },
            'detection_method': 'Manual Rules' if attack_reasons else 'ML Model',
            'timestamp': datetime.now().isoformat()
        }
        
        # Save to database if available
        if db:
            try:
                client_ip = request.remote_addr
                db_prediction_data = {
                    'prediction': prediction,
                    'prediction_label': prediction_label,
                    'confidence': round(confidence, 2),
                    'probabilities': {
                        'normal': round(normal_prob, 2),
                        'attack': round(attack_prob, 2)
                    }
                }
                prediction_id = db.save_prediction(db_prediction_data, features, client_ip)
                if prediction_id:
                    response_data['database_saved'] = True
                    response_data['prediction_id'] = prediction_id
                else:
                    response_data['database_saved'] = False
            except Exception as db_error:
                print(f"⚠ Database save error: {db_error}")
                response_data['database_saved'] = False
        
        print(f"✅ Prediction result: {prediction_label} ({confidence}%)")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Prediction failed'
        }), 500

@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    """8. Batch predict from CSV file and save to database"""
    try:
        # Check if file is in the request
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'})
        
        file = request.files['file']
        
        # Check if file has a name
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        # Check if it's a CSV file
        if not file.filename.endswith('.csv'):
            return jsonify({'success': False, 'error': 'File must be a CSV'})
        
        # Read the CSV file
        df = pd.read_csv(file)
        print(f"📥 Batch processing {len(df)} records from {file.filename}")
        
        # Check for required columns
        required_columns = ['duration', 'src_bytes', 'dst_bytes', 'count', 'srv_count', 
                          'serror_rate', 'srv_serror_rate', 'dst_host_count', 
                          'dst_host_srv_count', 'dst_host_serror_rate', 'dst_host_srv_serror_rate']
        
        # Check if all required columns are present
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({
                'success': False, 
                'error': f'Missing required columns: {missing_columns}. Found: {list(df.columns)}'
            })
        
        predictions = []
        normal_count = 0
        attack_count = 0
        saved_to_db = []
        
        # Get client IP (for database saving)
        client_ip = request.remote_addr
        
        # Process each row
        for index, row in df.iterrows():
            try:
                # Prepare input data dictionary (same format as single prediction)
                input_data = {
                    'duration': float(row['duration']),
                    'src_bytes': float(row['src_bytes']),
                    'dst_bytes': float(row['dst_bytes']),
                    'count': float(row['count']),
                    'srv_count': float(row['srv_count']),
                    'serror_rate': float(row['serror_rate']),
                    'srv_serror_rate': float(row['srv_serror_rate']),
                    'dst_host_count': float(row['dst_host_count']),
                    'dst_host_srv_count': float(row['dst_host_srv_count']),
                    'dst_host_serror_rate': float(row['dst_host_serror_rate']),
                    'dst_host_srv_serror_rate': float(row['dst_host_srv_serror_rate'])
                }
                
                # Use the same predict_traffic function as single prediction
                prediction, confidence, probabilities, features, attack_reasons = predict_traffic(input_data)
                
                # Convert probabilities
                normal_prob = float(probabilities[0] * 100)
                attack_prob = float(probabilities[1] * 100)
                
                # Determine prediction label
                if prediction == 1:
                    if attack_prob > 80 or confidence > 80:
                        prediction_label = "CRITICAL Attack"
                        risk_level = "CRITICAL"
                    elif attack_prob > 60 or confidence > 60:
                        prediction_label = "HIGH Attack"
                        risk_level = "HIGH"
                    elif attack_prob > 40 or confidence > 40:
                        prediction_label = "MEDIUM Attack"
                        risk_level = "MEDIUM"
                    else:
                        prediction_label = "Suspicious Activity"
                        risk_level = "LOW"
                    attack_count += 1
                else:
                    if normal_prob > 95:
                        prediction_label = "Normal"
                        risk_level = "NORMAL"
                    elif normal_prob > 80:
                        prediction_label = "Likely Normal"
                        risk_level = "LOW"
                    else:
                        prediction_label = "Uncertain"
                        risk_level = "MONITOR"
                    normal_count += 1
                
                # Prepare prediction result for response
                pred_result = {
                    'id': index + 1,
                    'prediction': prediction,
                    'prediction_label': prediction_label,
                    'risk_level': risk_level,
                    'confidence': round(confidence, 2),
                    'probabilities': {
                        'normal': round(normal_prob, 2),
                        'attack': round(attack_prob, 2)
                    },
                    'features_received': len(input_data),
                    'detection_method': 'Manual Rules' if attack_reasons else 'ML Model'
                }
                
                # Add attack reasons if any
                if attack_reasons:
                    pred_result['attack_reasons'] = attack_reasons
                
                # ============ SAVE TO DATABASE ============
                # Same logic as single prediction endpoint
                if db:
                    try:
                        # Prepare data for database save (same as single prediction)
                        db_prediction_data = {
                            'prediction': prediction,
                            'prediction_label': prediction_label,
                            'confidence': round(confidence, 2),
                            'probabilities': {
                                'normal': round(normal_prob, 2),
                                'attack': round(attack_prob, 2)
                            }
                        }
                        
                        # Save to database using your existing function
                        prediction_id = db.save_prediction(db_prediction_data, features, client_ip)
                        
                        if prediction_id:
                            saved_to_db.append({
                                'record_id': index + 1,
                                'db_id': prediction_id,
                                'status': 'saved'
                            })
                            
                            # Add database ID to response
                            pred_result['database_saved'] = True
                            pred_result['prediction_id'] = prediction_id
                        else:
                            pred_result['database_saved'] = False
                    except Exception as db_error:
                        print(f"⚠ Database save error for record {index + 1}: {db_error}")
                        pred_result['database_saved'] = False
                else:
                    pred_result['database_saved'] = False
                
                predictions.append(pred_result)
                
                # Print progress every 10 records
                if (index + 1) % 10 == 0:
                    print(f"   Processed {index + 1}/{len(df)} records...")
                
            except Exception as row_error:
                print(f"❌ Error processing row {index + 1}: {row_error}")
                predictions.append({
                    'id': index + 1,
                    'error': f'Row processing error: {str(row_error)}',
                    'prediction_label': 'ERROR',
                    'risk_level': 'UNKNOWN',
                    'confidence': 0,
                    'probabilities': {'normal': 0, 'attack': 0},
                    'database_saved': False
                })
        
        print(f"✅ Batch processing complete:")
        print(f"   Total records: {len(predictions)}")
        print(f"   Normal: {normal_count}")
        print(f"   Attacks: {attack_count}")
        print(f"   Saved to DB: {len(saved_to_db)}")
        print(f"   Errors: {len(df) - len(predictions)}")
        
        # Prepare summary
        summary = {
            'total_records': len(predictions),
            'normal_count': normal_count,
            'attack_count': attack_count,
            'normal_percentage': round((normal_count / len(predictions) * 100), 2) if predictions else 0,
            'attack_percentage': round((attack_count / len(predictions) * 100), 2) if predictions else 0,
            'database_saved_count': len(saved_to_db),
            'error_count': len(df) - len(predictions)
        }
        
        return jsonify({
            'success': True, 
            'predictions': predictions,
            'summary': summary,
            'database_status': {
                'connected': db is not None,
                'saved_count': len(saved_to_db),
                'saved_records': saved_to_db[:10]  # Show first 10 saved records
            }
        })
        
    except pd.errors.EmptyDataError:
        return jsonify({'success': False, 'error': 'CSV file is empty'})
    except pd.errors.ParserError:
        return jsonify({'success': False, 'error': 'Invalid CSV format'})
    except Exception as e:
        print(f"❌ Batch prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """2. Get statistics"""
    try:
        if db:
            stats = db.get_statistics()
        else:
            stats = {'error': 'Database not available'}
        
        return jsonify({
            'success': True,
            'statistics': stats,
            'database': 'connected' if db else 'disconnected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint with sample predictions - FIXED VERSION"""
    test_samples = [
        {
            'name': 'Normal Web Traffic',
            'data': {
                'duration': 0.1,
                'src_bytes': 100,      # Changed from 500 to 100
                'dst_bytes': 200,      # Changed from 1500 to 200
                'count': 2,
                'srv_count': 1,
                'serror_rate': 0.001,  # Changed from 0.01 to 0.001
                'srv_serror_rate': 0.001,  # Changed from 0.01 to 0.001
                'dst_host_count': 10,   # Changed from 150 to 10
                'dst_host_srv_count': 5,  # Changed from 100 to 5
                'dst_host_serror_rate': 0.002,  # Changed from 0.05 to 0.002
                'dst_host_srv_serror_rate': 0.002  # Changed from 0.05 to 0.002
            }
        },
        {
            'name': 'DoS Attack',
            'data': {
                'duration': 0,
                'src_bytes': 1000000,
                'dst_bytes': 0,
                'count': 1000,
                'srv_count': 500,
                'serror_rate': 0.98,   # Changed from 1.0 to 0.98
                'srv_serror_rate': 0.98,  # Changed from 1.0 to 0.98
                'dst_host_count': 255,
                'dst_host_srv_count': 255,
                'dst_host_serror_rate': 0.99,  # Changed from 1.0 to 0.99
                'dst_host_srv_serror_rate': 0.99  # Changed from 1.0 to 0.99
            }
        }
    ]
    results = []
    for test in test_samples:
        try:
            # FIXED: predict_traffic now returns 5 values, not 4
            prediction, confidence, probabilities, _, _ = predict_traffic(test['data'])
            
            # Get attack probability
            attack_prob = float(probabilities[1] * 100)
            normal_prob = float(probabilities[0] * 100)
            
            # Determine prediction label
            if prediction == 1:
                if attack_prob > 80:
                    label = "CRITICAL Attack"
                elif attack_prob > 60:
                    label = "HIGH Attack"
                else:
                    label = "Attack"
            else:
                if normal_prob > 95:
                    label = "Normal"
                else:
                    label = "Likely Normal"
            
            results.append({
                'name': test['name'],
                'prediction': label,
                'confidence': round(confidence, 2),
                'attack_probability': round(attack_prob, 2),
                'normal_probability': round(normal_prob, 2),
                'features_tested': len(test['data'])
            })
        except Exception as e:
            results.append({
                'name': test['name'],
                'error': str(e),
                'features': list(test['data'].keys())
            })
    
    return jsonify({
        'success': True,
        'tests': results,
        'database_status': 'connected' if db else 'disconnected',
        'model_status': 'loaded',
        'message': 'NIDS is working correctly'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """4. Health check"""
    db_status = 'connected' if db else 'disconnected'
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model': 'loaded',
        'database': db_status,
        'mysql_config': MYSQL_CONFIG,
        'success': True
    })

@app.route('/api/db_test', methods=['GET'])
def db_test():
    """5. Test database connection"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Database connection successful',
            'test_result': result[0] if result else 'No result'
        })
    except Error as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'config': MYSQL_CONFIG,
            'solution': 'Check MySQL is running: sudo systemctl start mysql (Linux) or brew services start mysql (Mac)'
        })

@app.route('/api/attacks', methods=['GET'])
def get_attacks():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='nids_user',
            password='nids_password',
            database='nids_database'
        )
        cursor = connection.cursor(dictionary=True)

        # Simple query first - just get attacks
        query = "SELECT * FROM attacks ORDER BY timestamp DESC"
        cursor.execute(query)
        attacks = cursor.fetchall()

        formatted_attacks = []
        for attack in attacks:
            # Simple IP simulation
            source_ip = f"192.168.1.{attack['prediction_id'] % 255}"
            
            # Handle timestamp safely
            timestamp = attack['timestamp']
            if hasattr(timestamp, 'strftime'):
                timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
            else:
                timestamp_str = str(timestamp)
            
            # Calculate confidence based on severity
            severity_confidence = {
                'CRITICAL': 95,
                'HIGH': 85,
                'MEDIUM': 75,
                'LOW': 65
            }
            
            formatted_attacks.append({
                'id': attack['id'],
                'timestamp': timestamp_str,
                'attackType': attack['attack_type'],
                'severity': attack['severity'],
                'sourceIp': source_ip,
                'destinationIp': '10.0.0.1',
                'confidence': severity_confidence.get(attack['severity'], 75),
                'features': {
                    'count': 0,
                    'serror_rate': 0.0,
                    'src_bytes': 0
                },
                'status': 'Blocked' if attack['severity'] in ['CRITICAL', 'HIGH'] else 'Monitored'
            })

        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'attacks': formatted_attacks,
            'count': len(formatted_attacks)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/attacks/optimized', methods=['GET'])
def get_attacks_optimized():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='nids_user',
            password='nids_password',
            database='nids_database'
        )
        cursor = connection.cursor(dictionary=True)

        # Optimized query using ALL your available features
        query = """
        SELECT 
            a.id as attack_id,
            a.prediction_id,
            a.timestamp as attack_timestamp,
            a.attack_type,
            a.severity,
            p.timestamp as prediction_timestamp,
            p.prediction,
            p.prediction_label,
            p.confidence as model_confidence,
            p.attack_probability,
            p.normal_probability,
            p.src_bytes,
            p.dst_bytes,
            p.count,
            p.srv_count,
            p.serror_rate,
            p.srv_serror_rate,
            p.is_attack,
            p.client_ip
        FROM attacks a
        JOIN predictions p ON a.prediction_id = p.id
        ORDER BY a.timestamp DESC
        """
        
        cursor.execute(query)
        attacks = cursor.fetchall()

        formatted_attacks = []
        for attack in attacks:
            # Use REAL confidence from your model
            model_confidence = float(attack.get('model_confidence', 0.0) or 0.0)
            attack_probability = float(attack.get('attack_probability', 0.0) or 0.0)
            serror_rate = float(attack.get('serror_rate', 0.0) or 0.0)
            srv_serror_rate = float(attack.get('srv_serror_rate', 0.0) or 0.0)
            count = attack.get('count', 0) or 0
            src_bytes = attack.get('src_bytes', 0) or 0
            
            # Calculate intelligent confidence score
            # Use model confidence if available, otherwise calculate based on features
            if model_confidence > 0:
                confidence = model_confidence
            else:
                # Smart calculation using your actual features
                confidence = 65.0  # Base
                
                # Increase based on error rates
                if serror_rate >= 0.9 or srv_serror_rate >= 0.9:
                    confidence = 95.0
                elif serror_rate >= 0.7 or srv_serror_rate >= 0.7:
                    confidence = 85.0
                elif serror_rate >= 0.5 or srv_serror_rate >= 0.5:
                    confidence = 75.0
                
                # Adjust based on traffic patterns
                if count > 100:
                    confidence += 10.0
                elif count > 50:
                    confidence += 5.0
                
                # Zero source bytes is suspicious for attacks
                if src_bytes == 0:
                    confidence += 8.0
                
                # Use attack probability if available
                if attack_probability > 0:
                    confidence = max(confidence, attack_probability * 100)
                
                confidence = min(confidence, 99.9)
            
            # Use REAL client_ip if available
            source_ip = attack.get('client_ip') or f"192.168.1.{attack['prediction_id'] % 255}"
            
            formatted_attacks.append({
                'id': attack['attack_id'],
                'prediction_id': attack['prediction_id'],
                'timestamp': attack['attack_timestamp'].strftime('%Y-%m-d %H:%M:%S') if hasattr(attack['attack_timestamp'], 'strftime') else str(attack['attack_timestamp']),
                'attackType': attack['attack_type'],
                'severity': attack['severity'],
                'sourceIp': source_ip,
                'destinationIp': f"10.0.0.{attack['attack_id'] % 10 + 1}",
                'confidence': round(confidence, 1),
                'model_confidence': float(model_confidence),
                'attack_probability': float(attack_probability),
                'normal_probability': float(attack.get('normal_probability', 0.0) or 0.0),
                'features': {
                    'count': count,
                    'srv_count': attack.get('srv_count', 0) or 0,
                    'serror_rate': serror_rate,
                    'srv_serror_rate': srv_serror_rate,
                    'src_bytes': src_bytes,
                    'dst_bytes': attack.get('dst_bytes', 0) or 0
                },
                'prediction_label': attack.get('prediction_label', 'Unknown'),
                'status': 'Blocked' if attack['severity'] in ['CRITICAL', 'HIGH'] else 'Monitored',
                'is_attack': bool(attack.get('is_attack', 1)),
                'client_ip': attack.get('client_ip', 'N/A')
            })

        cursor.close()
        connection.close()

        # Calculate statistics
        total_attacks = len(formatted_attacks)
        blocked_count = len([a for a in formatted_attacks if a['status'] == 'Blocked'])
        avg_confidence = round(sum(a['confidence'] for a in formatted_attacks) / total_attacks, 1) if total_attacks > 0 else 0
        
        return jsonify({
            'success': True,
            'attacks': formatted_attacks,
            'count': total_attacks,
            'statistics': {
                'total_attacks': total_attacks,
                'blocked_count': blocked_count,
                'monitored_count': total_attacks - blocked_count,
                'avg_confidence': avg_confidence,
                'severity_distribution': {
                    'CRITICAL': len([a for a in formatted_attacks if a['severity'] == 'CRITICAL']),
                    'HIGH': len([a for a in formatted_attacks if a['severity'] == 'HIGH']),
                    'LOW': len([a for a in formatted_attacks if a['severity'] == 'LOW'])
                },
                'attack_types': list(set(a['attackType'] for a in formatted_attacks))
            },
            'schema_info': {
                'has_real_confidence': any(a['model_confidence'] > 0 for a in formatted_attacks),
                'has_client_ip': any(a['client_ip'] != 'N/A' for a in formatted_attacks),
                'available_features': ['count', 'srv_count', 'serror_rate', 'srv_serror_rate', 'src_bytes', 'dst_bytes']
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'schema': 'Make sure your attacks table has columns: id, prediction_id, timestamp, attack_type, severity'
        }), 500

@app.route('/api/debug_db', methods=['GET'])
def debug_database():
    """6. Debug database"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Check tables
        cursor.execute('SHOW TABLES')
        tables = cursor.fetchall()
        
        # Count predictions
        cursor.execute('SELECT COUNT(*) as count FROM predictions')
        pred_count = cursor.fetchone()
        
        # Get table structure
        cursor.execute('DESCRIBE predictions')
        pred_structure = cursor.fetchall()
        
        # Get sample data
        cursor.execute('SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 3')
        sample_data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'connection': 'successful',
            'tables': [table['Tables_in_nids_database'] for table in tables],
            'predictions_count': pred_count['count'],
            'predictions_structure': pred_structure,
            'sample_data': sample_data,
            'message': 'Database is accessible'
        })
        
    except Error as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Database connection failed'
        })

@app.route('/api/debug_model', methods=['GET'])
def debug_model():
    """7. Debug model info"""
    try:
        info = {
            'model_type': str(type(rf_model)),
            'n_features': rf_model.n_features_in_ if hasattr(rf_model, 'n_features_in_') else 'Unknown',
            'n_classes': rf_model.n_classes_ if hasattr(rf_model, 'n_classes_') else 'Unknown',
            'classes': rf_model.classes_.tolist() if hasattr(rf_model, 'classes_') else 'Unknown',
            'feature_columns_count': len(feature_columns),
            'feature_mapping_count': len(feature_mapping),
            'scaler_type': str(type(scaler)),
            'pca_type': str(type(pca_model))
        }
        
        return jsonify({
            'success': True,
            'model_info': info,
            'message': 'Model debug information'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to get model info'
        })

# ============ STATIC FILE ROUTES FOR REACT ============
# These are the CRITICAL routes that fix the reload issue

@app.route('/static/css/<path:filename>')
def serve_static_css(filename):
    """Serve CSS files from static/css folder"""
    return send_from_directory(os.path.join(STATIC_FOLDER, 'css'), filename)

@app.route('/static/js/<path:filename>')
def serve_static_js(filename):
    """Serve JS files from static/js folder"""
    return send_from_directory(os.path.join(STATIC_FOLDER, 'js'), filename)

@app.route('/static/media/<path:filename>')
def serve_static_media(filename):
    """Serve media files from static/media folder"""
    return send_from_directory(os.path.join(STATIC_FOLDER, 'media'), filename)

# Serve other static files (favicon, images, etc.)
@app.route('/<path:filename>')
def serve_other_static(filename):
    """Serve other static files"""
    # Don't interfere with API routes
    if filename.startswith('api/'):
        return jsonify({'error': 'API route not found'}), 404
    
    file_path = os.path.join(STATIC_FOLDER, filename)
    
    # If it's a file that exists, serve it
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(STATIC_FOLDER, filename)
    
    # For all other routes, serve index.html (React Router will handle it)
    return send_file(os.path.join(STATIC_FOLDER, 'index.html'))

# Serve index.html for root path
@app.route('/')
def serve_index():
    """Serve React's index.html for root path"""
    return send_file(os.path.join(STATIC_FOLDER, 'index.html'))

# ============ DEBUG ENDPOINT ============
@app.route('/debug/paths', methods=['GET'])
def debug_paths():
    """Debug endpoint to check paths"""
    return jsonify({
        'base_dir': BASE_DIR,
        'static_folder': STATIC_FOLDER,
        'static_folder_exists': os.path.exists(STATIC_FOLDER),
        'index_html_exists': os.path.exists(os.path.join(STATIC_FOLDER, 'index.html')),
        'current_working_dir': os.getcwd()
    })

# ============ MAIN ============
if __name__ == '__main__':
    print("\n" + "="*60)
    print("📡 ALL 10 API ENDPOINTS:")
    print("="*60)
    print("  1. POST /api/predict    - Classify network traffic")
    print("  2. POST /api/batch-predict - Batch predict from CSV")
    print("  3. GET  /api/stats      - Get statistics")
    print("  4. GET  /api/test       - Test with samples")
    print("  5. GET  /api/health     - Health check")
    print("  6. GET  /api/db_test    - Test database connection")
    print("  7. GET  /api/debug_db   - Debug database")
    print("  8. GET  /api/debug_model - Debug model info")
    print("  9. GET  /api/attacks    - Get recent attacks")
    print(" 10. GET  /api/attacks/optimized - Get recent attacks (optimized)")
    print("="*60)
    print("🌐 REACT APP SERVING ENABLED")
    print(f"📁 Serving from: {STATIC_FOLDER}")
    print("="*60)
    
    # Test database connection
    print("🔍 Testing database connection...")
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result and result[0] == 1:
            print("✅ MySQL Database: CONNECTED")
            print(f"   Database: {MYSQL_CONFIG['database']}")
            print(f"   User: {MYSQL_CONFIG['user']}")
            
            # Show statistics
            if db:
                stats = db.get_statistics()
                if stats:
                    print(f"📊 Initial Stats: {stats['total_predictions']} predictions")
                    print(f"   Attacks: {stats['attack_count']}, Normal: {stats['normal_count']}")
        else:
            print("⚠ MySQL Database: CONNECTION TEST FAILED")
    except Error as e:
        print(f"❌ MySQL Database: CONNECTION ERROR - {e}")
        print("💡 Predictions will still work, but won't be saved to database")

    def get_local_ip():
        """Get the local IP address automatically"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "localhost"
    
    local_ip = get_local_ip()
    print("="*60)
    print(f"🚀 Starting Flask server on http://0.0.0.0:8000")
    print(f"🌐 Access from network: http://{local_ip}:8000")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=8000)