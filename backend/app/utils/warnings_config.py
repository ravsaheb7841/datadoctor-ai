import warnings
import pandas as pd

def suppress_warnings():
    """Suppress all pandas and numpy warnings"""
    warnings.filterwarnings('ignore')
    warnings.filterwarnings('ignore', category=UserWarning)
    warnings.filterwarnings('ignore', category=FutureWarning)
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    warnings.filterwarnings('ignore', message='.*Could not infer format.*')
    warnings.filterwarnings('ignore', message='.*parsed individually.*')
    warnings.filterwarnings('ignore', message='.*dateutil.*')
    
    # Suppress pandas specific warnings
    pd.options.mode.chained_assignment = None
    
    # Suppress numpy warnings
    import numpy as np
    np.seterr(all='ignore')