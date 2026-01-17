import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Footer } from "./Footer"

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
