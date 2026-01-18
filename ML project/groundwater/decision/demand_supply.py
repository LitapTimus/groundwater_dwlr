from dataclasses import dataclass

@dataclass
class DemandSupplyResult:
    demand: float
    availability: float
    stress_index: float


class DemandSupplyCalculator:
    """
    Computes stress index = demand / availability
    """

    @staticmethod
    def compute(demand: float, availability: float) -> DemandSupplyResult:
        if availability <= 0:
            stress_index = 1.0  # Fully stressed
        else:
            stress_index = demand / availability

        return DemandSupplyResult(
            demand=demand,
            availability=availability,
            stress_index=round(stress_index, 4)
        )


