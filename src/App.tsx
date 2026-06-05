// Copyright (c) 2026 Nagravision SARL
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtocolV2 from "./pages/ProtocolV2";
import ResultsV2 from "./pages/ResultsV2";
import NotFound from "./pages/NotFound";
import { AppNav } from "./components/AppNav";
import { NavVisibilityProvider } from "./contexts/NavVisibilityContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NavVisibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppNav />
          <Routes>
            {/* Redirect deprecated V1 routes to V2 main page */}
            <Route path="/" element={<Navigate to="/v2" replace />} />

            <Route path="/v2" element={<ProtocolV2 />} />
            <Route path="/v2/results" element={<ResultsV2 />} />

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NavVisibilityProvider>
  </QueryClientProvider>
);

export default App;
