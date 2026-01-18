from dataclasses import dataclass
from typing import List


@dataclass
class Alert:
    level: str        # INFO / WARNING / CRITICAL
    message: str
    zone: str
    stress_index: float


class AlertEngine:
    """
    Rule-based alert engine for groundwater decision system
    """

    CRITICAL_STRESS_THRESHOLD = 0.7

    @staticmethod
    def generate_alerts(zone: str, stress_index: float) -> List[Alert]:
        alerts: List[Alert] = []

        # Rule 1: Zone based alert
        if zone == "CRITICAL":
            alerts.append(
                Alert(
                    level="CRITICAL",
                    message="Groundwater level is in CRITICAL zone. Immediate action required.",
                    zone=zone,
                    stress_index=stress_index,
                )
            )

        elif zone == "SEMI-CRITICAL":
            alerts.append(
                Alert(
                    level="WARNING",
                    message="Groundwater level is in SEMI-CRITICAL zone. Monitor closely.",
                    zone=zone,
                    stress_index=stress_index,
                )
            )

        # Rule 2: Stress index based alert
        if stress_index >= AlertEngine.CRITICAL_STRESS_THRESHOLD:
            alerts.append(
                Alert(
                    level="CRITICAL",
                    message="Stress index is very high. Groundwater extraction exceeds safe limits.",
                    zone=zone,
                    stress_index=stress_index,
                )
            )

        return alerts


