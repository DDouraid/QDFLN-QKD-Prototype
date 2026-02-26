from typing import Dict, Tuple, Optional


class BlockchainSim:
    def __init__(self):
        self.round_hashes: Dict[int, Dict[str, str]] = {}
        self.reputation: Dict[str, int] = {}

    def submit_hash(self, round_id: int, validator_id: str, H_agg: str):
        self.round_hashes.setdefault(round_id, {})[validator_id] = H_agg
        self.reputation.setdefault(validator_id, 0)

    def check_consensus_and_update(self, round_id: int) -> Optional[Tuple[str, int, Dict[str, str]]]:
        entries = self.round_hashes.get(round_id, {})
        if not entries:
            return None

        counts: Dict[str, int] = {}
        for h in entries.values():
            counts[h] = counts.get(h, 0) + 1

        H_star, max_votes = max(counts.items(), key=lambda x: x[1])

        for vid, h in entries.items():
            if h == H_star:
                self.reputation[vid] += 1
            else:
                self.reputation[vid] -= 1

        return H_star, max_votes, entries

