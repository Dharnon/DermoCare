import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
      {/* Logo */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-neutral-900 mb-2">
          Dermo{" "}
          <span className="text-transparent bg-clip-text sparkline-gradient">
            Care
          </span>
        </h1>
        <p className="text-[#7A869A]">Dermoesthetics SaaS Platform</p>
      </div>

      {/* Portal Selection */}
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/auth"
          className="block w-full p-6 bg-white rounded-3xl ios-shadow hover:shadow-md transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">
                stethoscope
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Portal Profesional</h2>
              <p className="text-secondary">Gestiona pacientes y tratamientos</p>
            </div>
          </div>
        </Link>

        <Link
          href="/auth"
          className="block w-full p-6 bg-white rounded-3xl ios-shadow hover:shadow-md transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-peach flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-white">
                person
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">App Paciente</h2>
              <p className="text-secondary">Tu plan de cuidado dermatológico</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-12 text-sm text-[#7A869A]">Select a portal to continue</p>
    </div>
  );
}
