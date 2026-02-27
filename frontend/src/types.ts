export interface ClientInfo {
  id: string
  grad_norm: number
  malicious: boolean
}

export interface ValidatorInfo {
  id: string
  grad_norm: number
  H_agg: string
  malicious: boolean
}

export interface Consensus {
  H_star: string
  winning_stake: number
  total_stake: number
  stake_pct: number
  entries: Record<string, string>
  fraudsters: string[]
  reputation: Record<string, number>
  stake: Record<string, number>
}

export interface RoundData {
  round_id: number
  clients: ClientInfo[]
  validators: ValidatorInfo[]
  consensus: Partial<Consensus>
}
