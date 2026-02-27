import { useState } from 'react'
import type { RoundData } from './types'
import './App.css'

const API_BASE = '/api'

export default function App() {
  const [data, setData] = useState<RoundData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runRound() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/run-round`, { method: 'POST' })
      if (!res.ok) throw new Error(res.statusText)
      const json: RoundData = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run round')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>DFLN Dashboard</h1>
        <p className="tagline">PQC-secured Decentralized Federated Learning</p>
        <button
          className="run-btn"
          onClick={runRound}
          disabled={loading}
        >
          {loading ? 'Running round…' : 'Run training round'}
        </button>
        {error && <p className="error">{error}</p>}
      </header>

      {data && (
        <main className="main">
          <section className="card">
            <h2>Round #{data.round_id}</h2>
          </section>

          <section className="card">
            <h2>Clients</h2>
            <div className="grid">
              {data.clients.map((c) => (
                <div
                  key={c.id}
                  className={`item ${c.malicious ? 'malicious' : ''}`}
                >
                  <span className="id">{c.id}</span>
                  <span className="mono">‖g‖ = {c.grad_norm.toFixed(4)}</span>
                  {c.malicious && <span className="badge">malicious</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Validators</h2>
            <div className="grid">
              {data.validators.map((v) => (
                <div
                  key={v.id}
                  className={`item ${v.malicious ? 'malicious' : ''}`}
                >
                  <span className="id">{v.id}</span>
                  <span className="mono">‖G_t‖ = {v.grad_norm.toFixed(4)}</span>
                  <span className="hash" title={v.H_agg}>
                    H_agg: {v.H_agg.slice(0, 12)}…
                  </span>
                  {v.malicious && <span className="badge">malicious</span>}
                </div>
              ))}
            </div>
          </section>

          {data.consensus && Object.keys(data.consensus).length > 0 && (
            <section className="card consensus">
              <h2>Blockchain consensus</h2>
              <div className="consensus-row">
                <span className="label">Winning H_agg</span>
                <code className="hash" title={data.consensus.H_star}>
                  {data.consensus.H_star?.slice(0, 20)}…
                </code>
              </div>
              <div className="consensus-row">
                <span className="label">Stake</span>
                <span>
                  {data.consensus.winning_stake?.toFixed(1)} /{' '}
                  {data.consensus.total_stake?.toFixed(1)} (
                  {data.consensus.stake_pct}%)
                </span>
              </div>
              {data.consensus.fraudsters?.length > 0 && (
                <div className="consensus-row fraud">
                  <span className="label">Slashed</span>
                  <span>{data.consensus.fraudsters.join(', ')}</span>
                </div>
              )}
              <div className="validator-state">
                <h3>Validator state</h3>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Reputation</th>
                      <th>Stake</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.consensus.stake &&
                      Object.entries(data.consensus.stake).map(([vid]) => (
                        <tr key={vid}>
                          <td>{vid}</td>
                          <td>{data.consensus.reputation?.[vid] ?? '-'}</td>
                          <td>{data.consensus.stake[vid].toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      )}

      {!data && !loading && (
        <p className="hint">Click “Run training round” to run one DFLN round and see clients, validators, and consensus.</p>
      )}
    </div>
  )
}
