import pandas as pd
import numpy as np
import os
from config import Config

class DataLoader:
    def __init__(self):
        self.column_names = [
            'duration', 'protocol_type', 'service', 'flag', 'src_bytes',
            'dst_bytes', 'land', 'wrong_fragment', 'urgent', 'hot',
            'num_failed_logins', 'logged_in', 'num_compromised', 'root_shell',
            'su_attempted', 'num_root', 'num_file_creations', 'num_shells',
            'num_access_files', 'num_outbound_cmds', 'is_host_login',
            'is_guest_login', 'count', 'srv_count', 'serror_rate',
            'srv_serror_rate', 'rerror_rate', 'srv_rerror_rate',
            'same_srv_rate', 'diff_srv_rate', 'srv_diff_host_rate',
            'dst_host_count', 'dst_host_srv_count', 'dst_host_same_srv_rate',
            'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
            'dst_host_srv_diff_host_rate', 'dst_host_serror_rate',
            'dst_host_srv_serror_rate', 'dst_host_rerror_rate',
            'dst_host_srv_rerror_rate', 'label'
        ]
    
    def load_kdd_data(self, filepath):
        """Load KDD Cup 99 dataset"""
        try:
            print(f"Loading data from {filepath}...")
            df = pd.read_csv(filepath, header=None, names=self.column_names)
            print(f"✓ Loaded {len(df)} records with {len(df.columns)} features")
            return df
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            raise
    
    def load_processed_data(self):
        """Load preprocessed data"""
        if os.path.exists(Config.PROCESSED_DATA_PATH):
            return pd.read_csv(Config.PROCESSED_DATA_PATH)
        else:
            raise FileNotFoundError("Processed data not found. Please preprocess data first.")