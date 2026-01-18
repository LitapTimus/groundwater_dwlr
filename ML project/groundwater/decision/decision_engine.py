from dataclasses import dataclass
from groundwater.decision.demand_supply import DemandSupplyCalculator, DemandSupplyResult
from groundwater.decision.zone_classifier import ZoneClassifier, ZoneClassificationResult


@dataclass
class DecisionResult:
    demand: float
    availability: float
    stress_index: float
    zone: str


class GroundwaterDecisionEngine:
    """
    Combines demand-supply calculation and zone classification
    """

    @staticmethod
    def evaluate(demand: float, availability: float) -> DecisionResult:
        # Step 1: Compute stress index
        ds_result: DemandSupplyResult = DemandSupplyCalculator.compute(
            demand=demand,
            availability=availability
        )

        # Step 2: Classify zone
        zone_result: ZoneClassificationResult = ZoneClassifier.classify(
            stress_index=ds_result.stress_index
        )

        return DecisionResult(
            demand=ds_result.demand,
            availability=ds_result.availability,
            stress_index=ds_result.stress_index,
            zone=zone_result.zone
        )


