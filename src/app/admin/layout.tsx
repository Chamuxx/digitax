export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-muted/20 min-h-screen">
      {children}
    </div>
  );
}
