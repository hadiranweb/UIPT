/* Living Infrastructure direction: dark observatory atmosphere, asymmetrical editorial pacing, Space Grotesk + IBM Plex Mono, Flux Cyan and amber signals, motion that communicates stabilization. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Theory from "./pages/Theory";
import ArticlesIndex from "./pages/ArticlesIndex";
import ArticleDetail from "./pages/ArticleDetail";
import EcosystemHub from "./pages/EcosystemHub";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/docs" component={Docs} />
      <Route path="/lab" component={Docs} />
      <Route path="/theory" component={Theory} />
      <Route path="/articles" component={ArticlesIndex} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      <Route path="/ecosystem" component={EcosystemHub} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
