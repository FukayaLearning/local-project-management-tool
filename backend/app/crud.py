import json
import os
from .schemas import Settings

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")

def get_settings() -> Settings:
    if not os.path.exists(SETTINGS_FILE):
        return Settings()  # Default settings
    
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return Settings(**data)
    except (json.JSONDecodeError, FileNotFoundError):
        return Settings()

def save_settings(settings: Settings) -> Settings:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings.model_dump(), f, ensure_ascii=False, indent=2)
    return settings
