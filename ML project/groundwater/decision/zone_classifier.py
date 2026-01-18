from dataclasses import dataclass

@dataclass
class ZoneClassificationResult:
    zone: str
    stress_index: float


class ZoneClassifier:
    """
    Classifies region into SAFE / SEMI-CRITICAL / CRITICAL
    based on stress index.
    """

    SAFE_THRESHOLD = 0.3
    CRITICAL_THRESHOLD = 0.7

    @staticmethod
    def classify(stress_index: float) -> ZoneClassificationResult:
        if stress_index < ZoneClassifier.SAFE_THRESHOLD:
            zone = "SAFE"
        elif stress_index < ZoneClassifier.CRITICAL_THRESHOLD:
            zone = "SEMI-CRITICAL"
        else:
            zone = "CRITICAL"

        return ZoneClassificationResult(
            zone=zone,
            stress_index=stress_index
        )


