import { SignIn } from "@clerk/nextjs";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your DigiTax account to manage property assessments.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left branding panel */}
      <div className="bg-gradient-hero flex-1 hidden md:flex flex-col justify-center p-12 relative overflow-hidden">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glowing orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">DigiTax</div>
              <div className="text-sm text-white/60">Property Assessment Portal</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Streamline Property Tax Assessment
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            A modern digital platform for local authorities to assess properties, calculate taxes dynamically, and empower property owners with transparent information.
          </p>

          <div className="space-y-4">
            {[
              { icon: "🗺️", title: "Interactive Map Integration", desc: "Pin property locations with precision" },
              { icon: "📐", title: "2D Plan Editor", desc: "Draw house footprints and calculate area" },
              { icon: "⚡", title: "Instant Tax Calculation", desc: "Rule-based engine with live preview" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-white/50">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sign-in panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold">DigiTax</div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <SignIn
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-border bg-card hover:bg-accent transition-colors text-foreground font-medium",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow-sm transition-all",
                formFieldInput:
                  "bg-card border-border text-foreground focus:ring-primary/30",
                footerActionLink: "text-primary hover:text-primary/80 font-medium",
                identityPreviewEditButton: "text-primary",
                formFieldLabel: "text-foreground/80 font-medium",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                formResendCodeLink: "text-primary",
                otpCodeFieldInput: "border-border bg-card text-foreground",
                alertText: "text-destructive",
                formFieldErrorText: "text-destructive text-xs",
                logoBox: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
