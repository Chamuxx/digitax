"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Building2,
  MapPin,
  PenTool,
  Calculator,
  Users,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Interactive Map Integration",
    description:
      "Pin exact property locations using an interactive map powered by OpenStreetMap. Capture precise latitude and longitude coordinates for every assessment.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: PenTool,
    title: "2D House Plan Editor",
    description:
      "Draw property footprints directly in the browser. Input corner points, auto-calculate polygon area in square feet, and store geometric data.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Calculator,
    title: "Dynamic Tax Engine",
    description:
      "Rule-based calculation engine applies multipliers for flooring type, floor count, amenities, garden size, and usage type instantly.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Admin (Municipal Officers) manage assessments. Property Owners securely view their assigned property details and tax amounts.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    description:
      "Enterprise-grade authentication via Clerk. Role-based access control ensures admins and property owners only see what they should.",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: FileText,
    title: "Tax Report Export",
    description:
      "Generate print-ready tax assessment reports from any property detail page. Perfect for official municipal documentation.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

const steps = [
  {
    step: "01",
    title: "Admin Creates Property",
    description: "Municipal officer pins the property on the map, draws the house footprint using the plan editor, and sets building attributes.",
  },
  {
    step: "02",
    title: "Tax Auto-Calculated",
    description: "The system instantly calculates tax using the formula: Area × Base Rate × Feature Multipliers based on property attributes.",
  },
  {
    step: "03",
    title: "Assigned to Owner",
    description: "Admin assigns the assessed property to the owner's email. The owner can log in to view all their property and tax details.",
  },
];

const stats = [
  { value: "100%", label: "Digital", sub: "End-to-end paperless" },
  { value: "< 1s", label: "Calculation", sub: "Instant tax preview" },
  { value: "2", label: "User Roles", sub: "Admin & Property Owner" },
  { value: "LKR", label: "Currency", sub: "Sri Lankan Rupees" },
];

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata?.role;
      router.replace(role === "admin" ? "/admin" : "/dashboard");
    }
  }, [isLoaded, user, router]);

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-primary shadow-glow grid place-items-center group-hover:shadow-glow transition-all duration-300">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-base">DigiTax</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block">
                Property Assessment Portal
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-gradient-primary text-white shadow-glow-sm hover:shadow-glow transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden bg-gradient-hero py-24 md:py-36">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Glowing orbs */}
          <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000" />
          <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-7000 delay-1000" />
          <div className="absolute -bottom-[20%] left-[20%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-5000" />

          <div className="container relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              Municipal Property Assessment & Digital Tax System
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 max-w-4xl mx-auto drop-shadow-xl">
              Property{" "}
              <span className="text-gradient">Tax Assessment</span>{" "}
              for Kurunegala
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              An end-to-end digital platform for municipal authorities to assess house properties, calculate tax dynamically, and provide property owners transparent access to their details.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-in">
                <Button size="lg" className="bg-gradient-primary text-white shadow-glow hover:shadow-glow animate-pulse-glow px-8 text-base font-semibold w-full sm:w-auto">
                  Admin Sign In
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 px-8 text-base w-full sm:w-auto">
                  Property Owner Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <section className="py-12 border-y border-border/50 bg-card/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center p-4">
                  <div className="text-3xl md:text-4xl font-extrabold text-gradient mb-1">{s.value}</div>
                  <div className="font-semibold text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground text-xs font-medium mb-4">
                <BarChart3 className="h-3 w-3" />
                Full-Featured Platform
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything for Modern Tax Assessment
              </h2>
              <p className="text-muted-foreground text-lg">
                Built for the Kurunegala Municipal Council with intuitive tools that completely replace paper-based workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
                >
                  {/* Subtle hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className={`relative h-12 w-12 rounded-2xl ${f.bg} grid place-items-center mb-6 shadow-inner ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="relative text-lg font-bold mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                  <p className="relative text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-20 md:py-28 bg-muted/20 border-y border-border/50">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg">
                Three simple steps from property registration to tax notification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((s, i) => (
                <div key={s.step} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(100%_-_1rem)] w-full h-px bg-gradient-to-r from-primary/30 to-transparent" />
                  )}
                  <div className="text-center relative group">
                    <div className="inline-flex h-20 w-20 rounded-3xl bg-gradient-primary shadow-glow items-center justify-center mb-6 transform group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-300">
                      <span className="text-3xl font-black text-white drop-shadow-md">{s.step}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Advantages ─── */}
        <section className="py-20 md:py-28 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="container relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Why Digitise Your Municipal Tax Workflow?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  By moving away from scattered ledgers to a centralized platform, your municipality can significantly boost revenue collection and improve transparency for citizens.
                </p>
                <div className="space-y-6">
                  {[
                    "Eliminate manual calculation errors with an automated engine",
                    "Enhance transparency with property owner portals",
                    "Improve field data collection with interactive map tooling",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-medium text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-[80px] opacity-20 animate-pulse duration-5000" />
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl">
                  <div className="h-64 rounded-xl bg-muted/30 border border-white/5 flex items-center justify-center">
                    <BarChart3 className="h-24 w-24 text-primary/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-hero border border-primary/30 p-12 md:p-20 text-center shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-10000" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
                  Ready to Go Digital?
                </h2>
                <p className="text-white/60 text-lg max-w-lg mx-auto mb-8">
                  Replace manual, paper-based property tax assessment with a fast, accurate, and transparent digital system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-in">
                    <Button size="lg" className="bg-gradient-primary text-white shadow-glow hover:shadow-glow px-8 font-semibold">
                      Admin Portal →
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 px-8">
                      Property Owner Access
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 py-8 bg-card/20">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">DigiTax</span>
            <span className="text-muted-foreground text-xs">Property Assessment Portal</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} DigiTax. Built for Kurunegala Municipal Council.
          </p>
        </div>
      </footer>
    </div>
  );
}
