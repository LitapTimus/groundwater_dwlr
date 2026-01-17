from dataclasses import dataclass
from typing import Dict


@dataclass
class ScenarioConfig:
    """
    Defines how much to change parameters (in percentage)
    Example:
      drought = -0.3 means reduce availability by 30%
      overuse = +0.2 means increase demand by 20%
    """
    availability_change_pct: float = 0.0   # e.g. -0.3 for -30%
    demand_change_pct: float = 0.0          # e.g. +0.2 for +20%


@dataclass
class ScenarioResult:
    new_demand: float
    new_availability: float
    old_demand: float
    old_availability: float


class ScenarioSimulator:
    """
    Applies scenario changes to demand and availability.
    """

    @staticmethod
    def simulate(
        demand: float,
        availability: float,
        scenario: ScenarioConfig
    ) -> ScenarioResult:

        old_demand = float(demand)
        old_availability = float(availability)

        # Apply changes
        new_demand = old_demand * (1 + scenario.demand_change_pct)
        new_availability = old_availability * (1 + scenario.availability_change_pct)

        # Safety clamp
        if new_demand < 0:
            new_demand = 0

        if new_availability < 1:
            new_availability = 1  # avoid divide-by-zero

        return ScenarioResult(
            new_demand=round(new_demand, 4),
            new_availability=round(new_availability, 4),
            old_demand=round(old_demand, 4),
            old_availability=round(old_availability, 4),
        )
