from typing import Dict, Tuple, Optional, List


class BlockchainSim:
    def __init__(self, supermajority: float = 2 / 3, slash_fraction: float = 0.2):
        self.round_hashes: Dict[int, Dict[str, str]] = {}
        self.reputation: Dict[str, int] = {}
        self.stake: Dict[str, float] = {}
        self.supermajority = supermajority
        self.slash_fraction = slash_fraction

    def register_validator(self, validator_id: str, stake: float) -> None:
        self.stake[validator_id] = float(stake)
        self.reputation.setdefault(validator_id, 0)

    def submit_hash(self, round_id: int, validator_id: str, H_agg: str):
        self.round_hashes.setdefault(round_id, {})[validator_id] = H_agg
        self.reputation.setdefault(validator_id, 0)
        self.stake.setdefault(validator_id, 1.0)

    def check_consensus_and_update(
        self, round_id: int
    ) -> Optional[Tuple[str, float, Dict[str, str], List[str]]]:
        entries = self.round_hashes.get(round_id, {})
        if not entries:
            return None

        weight_per_hash: Dict[str, float] = {}
        for vid, h in entries.items():
            w = self.stake.get(vid, 0.0)
            weight_per_hash[h] = weight_per_hash.get(h, 0.0) + w

        H_star, winning_weight = max(weight_per_hash.items(), key=lambda x: x[1])
        total_stake = sum(self.stake.values())

        if total_stake <= 0:
            return None

        # Require supermajority of stake for finality
        if winning_weight < self.supermajority * total_stake:
            return None

        fraudsters: List[str] = []
        for vid, h in entries.items():
            if h == H_star:
                self.reputation[vid] += 1
            else:
                self.reputation[vid] -= 1
                self.stake[vid] = max(0.0, self.stake[vid] * (1.0 - self.slash_fraction))
                fraudsters.append(vid)

        return H_star, winning_weight, entries, fraudsters

