import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="admin">
      <div className="flex-1 min-h-screen">{children}</div>
    </ProtectedRoute>
  );
}
