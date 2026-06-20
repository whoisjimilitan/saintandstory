interface PageHeaderProps {
  title: string;
  purpose: string;
}

export function PageHeader({ title, purpose }: PageHeaderProps) {
  return (
    <div className="mb-12">
      <h1 className="text-5xl font-black text-[#0D0D0D] mb-6">{title}</h1>
      <p className="text-base text-[#888888] leading-relaxed max-w-2xl">
        {purpose}
      </p>
      <div className="h-px bg-[#E8E8E8] mt-8"></div>
    </div>
  );
}
