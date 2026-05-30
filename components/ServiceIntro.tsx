function ShieldIcon() {
  return (
    <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const BULLETS = [
  { Icon: ShieldIcon, title: "No searching. No comparing.", sub: "We're the answer." },
  { Icon: TagIcon,   title: "Fixed price. Confirmed before we arrive.", sub: "Not a penny more." },
  { Icon: ClockIcon, title: "Same-day available.", sub: "In 30+ UK cities." },
];

export default function ServiceIntro() {
  return (
    <section className="bg-white py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="font-sans font-black text-navy text-3xl md:text-4xl mb-4">
            Man &amp; Van Services
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Professional man and van services nationwide. No comparison sites, no middlemen — just a reliable team at your door.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <p className="text-gray-600 text-base leading-relaxed">
            Most people dread moving day. Not because of the boxes — because they&apos;ve been let down before.
            Vague quotes. No-shows. Damage with no recourse. Saint &amp; Story was built to end that.
            One call, fixed price, professional team at your door. No searching, no comparing, no hoping.
          </p>
          <div className="space-y-6">
            {BULLETS.map(({ Icon, title, sub }) => (
              <div key={title} className="flex gap-3">
                <Icon />
                <div>
                  <p className="font-semibold text-navy text-sm">{title}</p>
                  <p className="text-gray-400 text-sm">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
