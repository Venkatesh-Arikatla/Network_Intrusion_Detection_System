import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

class DataPreprocessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.categorical_cols = ['protocol_type', 'service', 'flag']
    
    def preprocess_data(self, df):
        """Preprocess entire dataset"""
        print("Preprocessing data...")
        
        # Create a copy
        df_processed = df.copy()
        
        # Handle categorical columns
        for col in self.categorical_cols:
            if col in df_processed.columns:
                le = LabelEncoder()
                df_processed[col] = le.fit_transform(df_processed[col])
                self.label_encoders[col] = le
        
        # Convert label to binary (normal=0, attack=1)
        if 'label' in df_processed.columns:
            df_processed['label'] = df_processed['label'].apply(
                lambda x: 0 if x == 'normal.' else 1
            )
        
        # Fill missing values
        df_processed = df_processed.fillna(0)
        
        print(f"✓ Preprocessed data shape: {df_processed.shape}")
        return df_processed
    
    def preprocess_single_record(self, df):
        """Preprocess single record for prediction"""
        df_processed = df.copy()
        
        # Handle categorical columns
        for col in self.categorical_cols:
            if col in df_processed.columns:
                if col in self.label_encoders:
                    try:
                        df_processed[col] = self.label_encoders[col].transform(
                            df_processed[col]
                        )
                    except:
                        # Handle unseen categories
                        df_processed[col] = 0
                else:
                    df_processed[col] = 0
        
        # Ensure all columns are numeric
        df_processed = df_processed.apply(pd.to_numeric, errors='coerce')
        df_processed = df_processed.fillna(0)
        
        return df_processed
    
    def save_preprocessor(self, path):
        """Save preprocessor objects"""
        joblib.dump({
            'label_encoders': self.label_encoders,
            'categorical_cols': self.categorical_cols
        }, path)
    
    def load_preprocessor(self, path):
        """Load preprocessor objects"""
        data = joblib.load(path)
        self.label_encoders = data['label_encoders']
        self.categorical_cols = data['categorical_cols']