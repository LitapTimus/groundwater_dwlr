import logging
from datetime import datetime
from pathlib import Path

# ===============================
# Project Root Detection
# ===============================
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# ===============================
# Logs Directory
# ===============================
LOGS_ROOT = PROJECT_ROOT / "logs"

# One folder per run
RUN_ID = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
RUN_LOG_DIR = LOGS_ROOT / RUN_ID
RUN_LOG_DIR.mkdir(parents=True, exist_ok=True)

# ===============================
# Log File (Main Combined Log)
# ===============================
LOG_FILE = f"{RUN_ID}.log"
LOG_FILE_PATH = RUN_LOG_DIR / LOG_FILE

# ===============================
# Logging Configuration
# ===============================
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE_PATH),
        logging.StreamHandler()
    ]
)

# ===============================
# Optional: Component-wise Logger Getter
# (For future, does not break old code)
# ===============================
def get_logger(name: str):
    return logging.getLogger(name)


