import sys
import traceback
from groundwater.logging import logger

class GroundwaterException(Exception):
    def __init__(self, error_message, error_details: sys):
        self.error_message = error_message

        # Try to extract traceback info safely
        try:
            _, _, exc_tb = error_details.exc_info()
            if exc_tb is not None:
                self.lineno = exc_tb.tb_lineno
                self.file_name = exc_tb.tb_frame.f_code.co_filename
            else:
                self.lineno = -1
                self.file_name = "Unknown"
        except Exception:
            self.lineno = -1
            self.file_name = "Unknown"

        # Log the full traceback once
        try:
            logger.logging.error(
                f"Exception occurred in [{self.file_name}] at line [{self.lineno}]",
                exc_info=True
            )
        except Exception:
            pass

        super().__init__(self.error_message)

    def __str__(self):
        return (
            "Error occurred in python script name [{0}] line number [{1}] error message [{2}]"
            .format(self.file_name, self.lineno, str(self.error_message))
        )


