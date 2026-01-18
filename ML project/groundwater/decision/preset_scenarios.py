from groundwater.decision.scenario_simulator import ScenarioConfig

PRESET_SCENARIOS = {
    "drought": ScenarioConfig(
        availability_change_pct=-0.4,   # 40% drop in availability
        demand_change_pct=0.1            # 10% increase in demand
    ),
    "overuse": ScenarioConfig(
        availability_change_pct=-0.2,
        demand_change_pct=0.3
    ),
    "policy_support": ScenarioConfig(
        availability_change_pct=0.15,    # recharge improvement
        demand_change_pct=-0.2           # reduced demand
    ),
    "climate_change": ScenarioConfig(
        availability_change_pct=-0.3,
        demand_change_pct=0.2
    ),
}


