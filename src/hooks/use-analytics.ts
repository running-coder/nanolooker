import React from "react";
import ReactGA from "react-ga";
import { useLocation } from "react-router-dom";

const TRACKER =
  process.env.NODE_ENV === "production" ? "UA-165974694-1" : undefined;

const useAnalytics = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (!TRACKER) return;
    ReactGA.initialize(TRACKER);
  }, []);

  React.useEffect(() => {
    if (!TRACKER) return;
    ReactGA.pageview(location.pathname);
  }, [location]);

  return {};
};

export default useAnalytics;
