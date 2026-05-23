import { SignUp } from "@clerk/nextjs";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your DigiTax account to view your property tax assessments.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left branding panel */}
      <div className="bg-gradient-hero flex-1 hidden md:flex flex-col justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
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
            Access Your Property Tax Details
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Your account gives you complete transparency into your property assessment — view maps, floor plans, attributes, and your calculated annual tax amount.
          </p>

          <div className="space-y-3">
            {[
              "View your property location on an interactive map",
              "See the exact house plan used for assessment",
              "Understand how your tax amount was calculated",
              "Download or print your tax report",
            ].map((point) => (
              <div key={point} className="flex items-center gap-2.5 text-white/70 text-sm">
                <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/40 grid place-items-center flex-shrink-0">
                  <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sign-up panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold">DigiTax</div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="text-muted-foreground mt-1">Set up access to view your property assessments</p>
          </div>

          <SignUp
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
                formFieldLabel: "text-foreground/80 font-medium",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
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
