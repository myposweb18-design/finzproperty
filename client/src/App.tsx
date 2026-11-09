import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import PropertyDetails from "./pages/PropertyDetails";
import Agents from "./pages/Agents";
import { Account, Admin } from "./pages/Dashboards";
import { DevelopmentsPage, DevelopmentDetails } from "./pages/Developments";
import ApartmentFinder from "./pages/ApartmentFinder";
import Tools from "./pages/Tools";
import { Journal, InformationPage, Services } from "./pages/Resources";
import { CompareProperties, Locations } from "./pages/DiscoveryExtras";
import { infoPages } from "@shared/siteRoutes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buy">
        <Marketplace preset="buy" />
      </Route>
      <Route path="/rent">
        <Marketplace preset="rent" />
      </Route>
      <Route path="/land">
        <Marketplace preset="land" />
      </Route>
      <Route path="/commercial">
        <Marketplace preset="commercial" />
      </Route>
      <Route path="/new-developments" component={DevelopmentsPage} />
      <Route path="/apartment-finder" component={ApartmentFinder} />
      <Route path="/properties/:slug">
        {params => <PropertyDetails key={params.slug} slug={params.slug} />}
      </Route>
      <Route path="/developments/:slug">
        {params => <DevelopmentDetails key={params.slug} slug={params.slug} />}
      </Route>
      <Route path="/agents/:slug">
        {params => <Agents slug={params.slug} />}
      </Route>
      <Route path="/agents">
        <Agents />
      </Route>
      <Route path="/tools/:tool">
        {params => <Tools tool={params.tool} />}
      </Route>
      <Route path="/tools">
        <Tools />
      </Route>
      <Route path="/locations/:district">
        {params => <Locations district={decodeURIComponent(params.district)} />}
      </Route>
      <Route path="/locations">
        <Locations />
      </Route>
      <Route path="/compare" component={CompareProperties} />
      <Route path="/insights">
        <Journal />
      </Route>
      <Route path="/property-news">
        <Journal />
      </Route>
      <Route path="/guides/:slug">
        {params => <Journal slug={params.slug} />}
      </Route>
      <Route path="/news/:slug">
        {params => <Journal slug={params.slug} />}
      </Route>
      <Route path="/guides">
        <Journal />
      </Route>
      <Route path="/services/:service">
        {params => <Services service={params.service} />}
      </Route>
      <Route path="/services">
        <Services />
      </Route>
      {infoPages.map(page => (
        <Route key={page} path={`/${page}`}>
          <InformationPage page={page} />
        </Route>
      ))}
      <Route path="/account" component={Account} />
      <Route path="/saved-properties" component={Account} />
      <Route path="/saved-searches" component={Account} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
