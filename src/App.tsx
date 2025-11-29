import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Plants from "./pages/Plants";
import PlantDetails from "./pages/PlantDetails";
import NewPlant from "./pages/NewPlant";
import EditPlant from "./pages/EditPlant";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/plants" element={<ProtectedRoute><Plants /></ProtectedRoute>} />
              <Route path="/plants/new" element={<ProtectedRoute><NewPlant /></ProtectedRoute>} />
              <Route path="/plants/:id" element={<ProtectedRoute><PlantDetails /></ProtectedRoute>} />
              <Route path="/plants/:id/edit" element={<ProtectedRoute><EditPlant /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  return user ? <Navigate to="/plants" replace /> : <LandingPage />;
};

export default App;
