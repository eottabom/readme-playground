import { WALK_DURATION, FULL_CYCLE, adjustBrightness } from "./constants";

export function generateLegoMinifigure(
  color: string,
  waterColor: string,
  startX: number,
  endX: number,
  y: number
): string {
  const bodyDark = adjustBrightness(color, -30);
  const walkEnd = (WALK_DURATION / FULL_CYCLE).toFixed(3);
  const fadeOut = ((WALK_DURATION + 1.5) / FULL_CYCLE).toFixed(3);
  const fadeOutEnd = ((WALK_DURATION + 2) / FULL_CYCLE).toFixed(3);

  return `
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="${startX},${y};${endX},${y};${endX},${y}"
        keyTimes="0;${walkEnd};1"
        dur="${FULL_CYCLE}s" begin="cycle.begin" repeatCount="indefinite" fill="freeze"/>
      <animate attributeName="opacity"
        values="0;1;1;0;0"
        keyTimes="0;0.02;${fadeOut};${fadeOutEnd};1"
        dur="${FULL_CYCLE}s" begin="cycle.begin" repeatCount="indefinite"/>

      <ellipse cx="16" cy="68" rx="14" ry="3" fill="rgba(0,0,0,0.08)"/>

      <!-- Legs -->
      <rect x="7" y="48" width="20" height="5" rx="1" fill="#2c3e80"/>
      <rect x="7" y="50" width="10" height="15" rx="1" fill="#2c3e80">
        <animate attributeName="x" values="7;4;7;10;7" dur="0.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="17" y="50" width="10" height="15" rx="1" fill="#2c3e80">
        <animate attributeName="x" values="17;20;17;14;17" dur="0.5s" repeatCount="indefinite"/>
      </rect>

      <!-- Body -->
      <rect x="5" y="26" width="24" height="24" rx="2" fill="${color}"/>
      <rect x="7" y="34" width="20" height="14" rx="1" fill="${bodyDark}" opacity="0.35"/>
      <rect x="11" y="26" width="3" height="12" rx="0.5" fill="${bodyDark}" opacity="0.35"/>
      <rect x="20" y="26" width="3" height="12" rx="0.5" fill="${bodyDark}" opacity="0.35"/>
      <rect x="13" y="22" width="8" height="5" rx="1" fill="${color}"/>

      <!-- Left arm + seed bag -->
      <g>
        <rect x="-1" y="28" width="7" height="18" rx="3" fill="${color}">
          <animate attributeName="y" values="28;26;28;30;28" dur="0.7s" repeatCount="indefinite"/>
        </rect>
        <rect x="-2" y="45" width="7" height="5" rx="2" fill="#f5d76e">
          <animate attributeName="y" values="45;43;45;47;45" dur="0.7s" repeatCount="indefinite"/>
        </rect>
        <g>
          <animate attributeName="transform" type="translate" values="0,0;0,-2;0,0;0,2;0,0" dur="0.7s" repeatCount="indefinite"/>
          <rect x="-5" y="44" width="10" height="11" rx="2.5" fill="#C19A6B"/>
          <rect x="-4" y="44" width="8" height="3" rx="1" fill="#A0784C"/>
          <circle cx="-2" cy="45.5" r="1" fill="#8B6914"/>
          <circle cx="1" cy="46" r="0.8" fill="#6B5310"/>
          <circle cx="4" cy="45.5" r="0.9" fill="#8B6914"/>
        </g>
      </g>

      <!-- Right arm + watering can -->
      <g>
        <rect x="28" y="27" width="7" height="18" rx="3" fill="${color}"/>
        <rect x="28" y="44" width="6" height="5" rx="2" fill="#f5d76e"/>
        <g transform="translate(34, 38)">
          <rect x="0" y="0" width="16" height="12" rx="2.5" fill="#7f8c8d"/>
          <path d="M 2,-4 Q 8,-9 14,-4" stroke="#95a5a6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <rect x="14" y="2" width="12" height="3" rx="1.2" fill="#95a5a6" transform="rotate(-25, 14, 3)"/>
          <ellipse cx="25" cy="-2" rx="4" ry="3.2" fill="#b0bec5"/>
          <line x1="23" y1="-4.5" x2="23" y2="0" stroke="#95a5a6" stroke-width="0.6"/>
          <line x1="25" y1="-5" x2="25" y2="0.5" stroke="#95a5a6" stroke-width="0.6"/>
          <line x1="27" y1="-4.5" x2="27" y2="0" stroke="#95a5a6" stroke-width="0.6"/>
        </g>
        ${[0, 1, 2].map((i) => `
          <circle cx="${57 + (i - 1) * 3.5}" cy="34" r="1.4" fill="${waterColor}" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="0.7s" begin="${i * 0.12}s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="34;68" dur="0.7s" begin="${i * 0.12}s" repeatCount="indefinite"/>
            <animate attributeName="r" values="1.4;0.5" dur="0.7s" begin="${i * 0.12}s" repeatCount="indefinite"/>
          </circle>`).join("\n")}
      </g>

      <!-- Head -->
      <rect x="7" y="4" width="20" height="20" rx="4" fill="#f5d76e"/>
      <rect x="11" y="1" width="12" height="5" rx="2" fill="#f5d76e"/>

      <!-- Straw Hat -->
      <g>
        <ellipse cx="17" cy="5" rx="22" ry="5.5" fill="#D4A574"/>
        <ellipse cx="17" cy="5" rx="22" ry="5.5" fill="none" stroke="#B8956A" stroke-width="0.5"/>
        <rect x="5" y="-7" width="24" height="12" rx="3" fill="#E8C07A"/>
        <ellipse cx="17" cy="-7" rx="12" ry="4" fill="#F0D89A"/>
        <ellipse cx="17" cy="-8" rx="7" ry="2" fill="#F8E8B8" opacity="0.5"/>
        <rect x="5" y="-1" width="24" height="4" rx="0.5" fill="#c0392b"/>
        <g transform="translate(29, 0)">
          <ellipse cx="0" cy="-1" rx="3.5" ry="2" fill="#e74c3c"/>
          <ellipse cx="0" cy="2.5" rx="3" ry="1.8" fill="#e74c3c"/>
          <circle cx="0" cy="0.8" r="1.2" fill="#a93226"/>
        </g>
        <ellipse cx="17" cy="5" rx="20" ry="4" fill="none" stroke="#B8956A" stroke-width="0.25" stroke-dasharray="2,2"/>
      </g>

      <!-- Face -->
      <circle cx="12" cy="14" r="1.8" fill="#1a1a1a"/>
      <circle cx="22" cy="14" r="1.8" fill="#1a1a1a"/>
      <path d="M 10 18 Q 17 23 24 18" stroke="#1a1a1a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
  `;
}