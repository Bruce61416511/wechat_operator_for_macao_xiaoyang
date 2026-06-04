import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";

function getToken() { return sessionStorage.getItem("token"); }
import HeaderNav from "./components/HeaderNav.jsx";
import HeroSection from "./components/HeroSection.jsx";
import AssistantPanel from "./components/AssistantPanel.jsx";
import PageFooter from "./components/PageFooter.jsx";
import ApplyPage from "./components/ApplyPage.jsx";
import MemberPage from "./components/MemberPage.jsx";
import ReviewPage from "./components/ReviewPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import TrackPage from "./components/TrackPage.jsx";
import EventCenterPage from "./components/EventCenterPage.jsx";
import MemberManagementPage from "./components/MemberManagementPage.jsx";
import ConstitutionPage from "./components/ConstitutionPage.jsx";
import AssociationIntroPage from "./components/AssociationIntroPage.jsx";
import EventCalendarPage from "./components/EventCalendarPage.jsx";
import AnnouncementsPage from "./components/AnnouncementsPage.jsx";
import HelpCenterPage from "./components/HelpCenterPage.jsx";
import ResourcesPage from "./components/ResourcesPage.jsx";
import FinalReviewPage from "./components/FinalReviewPage.jsx";
import PaymentApprovalPage from "./components/PaymentApprovalPage.jsx";
import AnnouncementManagementPanel from "./components/AnnouncementManagementPanel.jsx";
import MemberAnalysis from "./components/MemberAnalysis.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    const current = window.location.pathname + window.location.search;
    window.location.href = "/login?redirect=" + encodeURIComponent(current);
    return null;
  }
  return children;
}

function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8fbfb] bg-[url('/macau-page-bg.webp')] bg-cover bg-top bg-no-repeat p-0 pb-10">
      <HeaderNav />
      <HeroSection />
      <AssistantPanel />
      <MemberAnalysis />
      <PageFooter />
    </main>
  );
}

function AppRoutes() {
  const path = window.location.pathname;

  if (path === "/login") return <LoginPage />;
  if (path === "/apply") return <ApplyPage />;
  if (path === "/track") return <TrackPage />;
  if (path === "/events") return <EventCenterPage role={JSON.parse(atob((sessionStorage.getItem("token") || ".").split(".")[0]) || "{}").role || "member"} />;

  if (path === "/member") {
    return (
      <ProtectedRoute>
        <MemberPage />
      </ProtectedRoute>
    );
  }

  if (path === "/admin/final-review") {
    const token2 = sessionStorage.getItem("token");
    if (!token2) { window.location.href = "/login"; return null; }
    try {
      const payload2 = JSON.parse(atob(token2.split(".")[0]));
      if (payload2.role !== "root") { window.location.href = "/member"; return null; }
    } catch { window.location.href = "/login"; return null; }
    return <FinalReviewPage />;
  }

  if (path === "/admin/payment-approval") {
    const token3 = sessionStorage.getItem("token");
    if (!token3) { window.location.href = "/login"; return null; }
    try {
      const payload3 = JSON.parse(atob(token3.split(".")[0]));
      if (payload3.role !== "root") { window.location.href = "/member"; return null; }
    } catch { window.location.href = "/login"; return null; }
    return <PaymentApprovalPage />;
  }

  if (path === "/admin/members") {
    const token = sessionStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return null; }
    try {
      const payload = JSON.parse(atob(token.split(".")[0]));
      if (payload.role !== "root") { window.location.href = "/member"; return null; }
    } catch { window.location.href = "/login"; return null; }
    return <MemberManagementPage />;
  }

  if (path === "/admin/constitution") {
    const token4 = sessionStorage.getItem("token");
    if (!token4) { window.location.href = "/login"; return null; }
    try {
      const payload4 = JSON.parse(atob(token4.split(".")[0]));
      if (payload4.role !== "root") { window.location.href = "/member"; return null; }
    } catch { window.location.href = "/login"; return null; }
    return <ConstitutionPage />;
  }

  if (path === "/review") {
    return (
      <ProtectedRoute>
        <ReviewPage />
      </ProtectedRoute>
    );
  }

  if (path === "/about") return <AssociationIntroPage />;
  if (path === "/calendar") return <EventCalendarPage />;
  if (path === "/announcements") return <AnnouncementsPage />;
  if (path === "/admin/announcements") {
    if (!getToken()) { window.location.href = "/login"; return null; }
    try { if (JSON.parse(atob(getToken().split(".")[0])).role !== "root") { window.location.href = "/member"; return null; } } catch { window.location.href = "/login"; return null; }
    return <AnnouncementManagementPanel />;
  }
  if (path === "/help") return <HelpCenterPage />;
  if (path === "/resources") return <ResourcesPage />;

  return <HomePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
