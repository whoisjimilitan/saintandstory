interface AvatarProps {
  initials: string;
  name: string;
  role: "Customer" | "Driver";
}

export default function IllustratedAvatar({ initials, name, role }: AvatarProps) {
  const avatarData: Record<string, { bg: string; skinTone: string; hairColor: string; expression: string }> = {
    JR: { bg: "from-blue-100 to-blue-50", skinTone: "#D4A574", hairColor: "#5C4033", expression: "smile" },
    AS: { bg: "from-amber-100 to-amber-50", skinTone: "#8B6F47", hairColor: "#3E2723", expression: "confident" },
    MC: { bg: "from-slate-100 to-slate-50", skinTone: "#C9A876", hairColor: "#4A4A4A", expression: "serious" },
    NK: { bg: "from-rose-100 to-rose-50", skinTone: "#A0826D", hairColor: "#1A1A1A", expression: "welcoming" },
    RP: { bg: "from-green-100 to-green-50", skinTone: "#B8956A", hairColor: "#6D4C41", expression: "thoughtful" },
    EJ: { bg: "from-purple-100 to-purple-50", skinTone: "#D0A89A", hairColor: "#4A3728", expression: "energetic" },
    CP: { bg: "from-orange-100 to-orange-50", skinTone: "#C59963", hairColor: "#5D4037", expression: "intelligent" },
    TS: { bg: "from-indigo-100 to-indigo-50", skinTone: "#6B4423", hairColor: "#1B1B1B", expression: "confident" },
  };

  const data = avatarData[initials] || { bg: "from-gray-100 to-gray-50", skinTone: "#9B8B7E", hairColor: "#4A4A4A", expression: "friendly" };

  const expressions = {
    smile: { eyeY: "38%", mouthPoints: "0,0 8,4 16,0" },
    confident: { eyeY: "35%", mouthPoints: "0,0 8,3 16,0" },
    serious: { eyeY: "36%", mouthPoints: "0,2 8,1 16,2" },
    welcoming: { eyeY: "37%", mouthPoints: "0,1 8,5 16,1" },
    thoughtful: { eyeY: "36%", mouthPoints: "0,0 8,2 16,0" },
    energetic: { eyeY: "37%", mouthPoints: "0,2 8,6 16,2" },
    intelligent: { eyeY: "35%", mouthPoints: "0,0 8,3 16,0" },
  };

  const expr = expressions[data.expression as keyof typeof expressions] || expressions.smile;

  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br shrink-0 flex items-center justify-center">
      <svg
        viewBox="0 0 64 64"
        className={`w-full h-full bg-gradient-to-br ${data.bg}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hair */}
        <ellipse cx="32" cy="22" rx="18" ry="14" fill={data.hairColor} />

        {/* Head */}
        <circle cx="32" cy="32" r="16" fill={data.skinTone} />

        {/* Eyes */}
        <circle cx="26" cy={expr.eyeY} r="1.5" fill="#1a1a1a" />
        <circle cx="38" cy={expr.eyeY} r="1.5" fill="#1a1a1a" />

        {/* Mouth */}
        <polyline
          points={expr.mouthPoints}
          fill="none"
          stroke="#A0826D"
          strokeWidth="0.8"
          strokeLinecap="round"
          transform="translate(24, 44)"
        />

        {/* Collar/Shirt hint */}
        <path
          d="M 18 42 L 32 48 L 46 42"
          fill="none"
          stroke="#E8E8E8"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
