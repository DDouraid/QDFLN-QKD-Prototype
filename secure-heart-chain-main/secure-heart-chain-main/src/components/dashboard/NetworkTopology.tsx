import { mockClients, type Client } from "@/lib/mock-data";
import { Network } from "lucide-react";

type Point = { x: number; y: number };

const COLORS = {
  background: "#020817",
  panel: "#020617",
  border: "rgba(148, 163, 184, 0.4)",
  accent: "#38bdf8",
  accent2: "#22c55e",
};

const BC_POS: Point = { x: 360, y: 340 };

const CLIENT_POS: Record<string, Point> = {
  C1: { x: 110, y: 120 },
  C2: { x: 90, y: 320 },
  C3: { x: 110, y: 520 },
  C4: { x: 220, y: 210 },
  C5: { x: 220, y: 460 },
};

const VALID_POS: Record<string, Point> = {
  V1: { x: 540, y: 150 },
  V2: { x: 630, y: 340 },
  V3: { x: 540, y: 530 },
};

interface NodeSVGProps {
  label: string;
  x: number;
  y: number;
  color: string;
  pulsing?: boolean;
  slashed?: boolean;
  flagged?: boolean;
}

function NodeSVG({
  label,
  x,
  y,
  color,
  pulsing,
  slashed,
  flagged,
}: NodeSVGProps) {
  const ringColor = slashed ? "#ef4444" : flagged ? "#eab308" : color;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle
        r={18}
        fill={COLORS.panel}
        stroke={ringColor}
        strokeWidth={1.2}
        style={{
          filter: `drop-shadow(0 0 10px ${ringColor}66)`,
        }}
      />
      {pulsing && (
        <circle
          r={26}
          fill="none"
          stroke={ringColor}
          strokeWidth={0.6}
          opacity={0.5}
        >
          <animate
            attributeName="r"
            values="22;30;22"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <text
        textAnchor="middle"
        y={3}
        fill={ringColor}
        fontSize={10}
        fontFamily="Orbitron, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

interface NetworkTopologyProps {
  clients?: Client[] | null;
  consensusOk?: boolean;
}

export function NetworkTopology({
  clients,
  consensusOk,
}: NetworkTopologyProps) {
  const dataClients: Client[] = clients && clients.length > 0 ? clients : mockClients;

  const activeClientRecords = dataClients.filter((c) => c.status !== "error");
  const activeClientsIds = activeClientRecords.map((c) => c.id);
  const maliciousClientIds = dataClients
    .filter((c) => c.status === "error")
    .map((c) => c.id);

  const allClientsParticipating =
    activeClientRecords.length === dataClients.length;
  const running = true;

  // Consensus animation only when backend says OK (if provided)
  // AND all clients are participating (no errors/malicious).
  const consensus = (consensusOk ?? true) && allClientsParticipating;

  const packets = dataClients.map((c, i) => ({
    from: c.id in CLIENT_POS ? (c.id as keyof typeof CLIENT_POS) : "C1",
    color: c.status === "error" ? "#f97316" : COLORS.accent,
    offset: i * 0.3,
  }));

  return (
    <div className="gradient-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Network className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
          Network Topology — Live
        </h3>
      </div>
      <div className="relative bg-background/40 rounded-md border border-border/40 overflow-hidden">
        <svg
          width="100%"
          viewBox="0 0 720 680"
          style={{ display: "block" }}
        >
          <defs>
            <pattern
              id="grid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke={COLORS.border}
                strokeWidth={0.5}
              />
            </pattern>
          </defs>

          <rect
            width="720"
            height="680"
            fill="url(#grid)"
            opacity={0.4}
          />

          {/* Blockchain node */}
          <g transform={`translate(${BC_POS.x},${BC_POS.y})`}>
            <circle
              r={42}
              fill={COLORS.panel}
              stroke={COLORS.accent2}
              strokeWidth={1.5}
              style={{
                filter: `drop-shadow(0 0 14px ${COLORS.accent2}66)`,
              }}
            />
            <circle
              r={55}
              fill="none"
              stroke={COLORS.accent2}
              strokeWidth={0.5}
              opacity={0.3}
            >
              <animate
                attributeName="r"
                values="48;70;48"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0;0.7"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              textAnchor="middle"
              y={-6}
              fill={COLORS.accent2}
              fontSize={10}
              fontFamily="Orbitron, system-ui, sans-serif"
              fontWeight={700}
            >
              BLOCK
            </text>
            <text
              textAnchor="middle"
              y={8}
              fill={COLORS.accent2}
              fontSize={10}
              fontFamily="Orbitron, system-ui, sans-serif"
              fontWeight={700}
            >
              CHAIN
            </text>
            <text
              textAnchor="middle"
              y={22}
              fill={COLORS.accent}
              fontSize={9}
              fontFamily="Share Tech Mono, ui-monospace, SFMono-Regular"
            >
              live round
            </text>
          </g>

          {/* Client–validator links */}
          {Object.values(CLIENT_POS).map((cp, i) =>
            Object.values(VALID_POS).map((vp, j) => (
              <line
                key={`${i}-${j}`}
                x1={cp.x}
                y1={cp.y}
                x2={vp.x}
                y2={vp.y}
                stroke={COLORS.border}
                strokeWidth={0.5}
                strokeDasharray="4 6"
              />
            )),
          )}

          {/* Validator–blockchain links */}
          {Object.values(VALID_POS).map((vp, i) => (
            <line
              key={`v-${i}`}
              x1={vp.x}
              y1={vp.y}
              x2={BC_POS.x}
              y2={BC_POS.y}
              stroke={COLORS.border}
              strokeWidth={0.5}
              strokeDasharray="4 6"
            />
          ))}

          {/* Animated packets client → validators */}
          {packets.map((pk, i) => {
            const from = CLIENT_POS[pk.from];
            return Object.values(VALID_POS).map((to, j) => (
              <circle
                key={`${i}-${j}`}
                r={5}
                fill={pk.color}
                opacity={0.9}
                style={{
                  filter: `drop-shadow(0 0 5px ${pk.color})`,
                }}
              >
                <animateMotion
                  dur="1.8s"
                  repeatCount="indefinite"
                  begin={`${pk.offset}s`}
                  path={`M${from.x},${from.y} L${to.x},${to.y}`}
                />
              </circle>
            ));
          })}

          {/* Validator → blockchain pulses when consensus phase */}
          {consensus &&
            Object.values(VALID_POS).map((vp, i) => (
              <circle
                key={`vbc-${i}`}
                r={5}
                fill={COLORS.accent2}
                opacity={0.9}
                style={{
                  filter: `drop-shadow(0 0 6px ${COLORS.accent2})`,
                }}
              >
                <animateMotion
                  dur="1.2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                  path={`M${vp.x},${vp.y} L${BC_POS.x},${BC_POS.y}`}
                />
              </circle>
            ))}

          {/* Client nodes */}
          {Object.entries(CLIENT_POS).map(([cid, pos]) => (
            <NodeSVG
              key={cid}
              label={cid}
              x={pos.x}
              y={pos.y}
              color={COLORS.accent}
              pulsing={activeClientsIds.includes(cid)}
              slashed={false}
              flagged={maliciousClientIds.includes(cid)}
            />
          ))}

          {/* Validator nodes */}
          {Object.entries(VALID_POS).map(([vid, pos]) => (
            <NodeSVG
              key={vid}
              label={vid}
              x={pos.x}
              y={pos.y}
              color={COLORS.accent2}
              pulsing={running}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
