import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { DemoProvider } from "./lib/store";
import Layout from "./components/Layout";
import { Loading } from "./components/ui";
import Home from "./Home";
import "./styles.css";
import "./polish.css";
const FindFood = lazy(() => import("./FindFood"));
const Matching = lazy(() => import("./Matching"));
const FoodDetail = lazy(() => import("./FoodDetail"));
const MyPlan = lazy(() => import("./Planning"));
const Volunteer = lazy(() => import("./Volunteer"));
const VolunteerDetail = lazy(() =>
  import("./Volunteer").then((m) => ({ default: m.VolunteerDetail })),
);
const VolunteerDashboard = lazy(() =>
  import("./Volunteer").then((m) => ({ default: m.VolunteerDashboard })),
);
const Organizations = lazy(() => import("./Organizations"));
const OrganizationDashboard = lazy(() =>
  import("./Organizations").then((m) => ({ default: m.OrganizationDashboard })),
);
const Resources = lazy(() => import("./Resources"));
const Auth = lazy(() =>
  import("./Resources").then((m) => ({ default: m.Auth })),
);
const NotFound = lazy(() =>
  import("./Resources").then((m) => ({ default: m.NotFound })),
);
function ScrollReset() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(
        () => document.getElementById(hash.slice(1))?.scrollIntoView(),
        100,
      );
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DemoProvider>
      <BrowserRouter>
        <ScrollReset />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="find-food" element={<FindFood />} />
              <Route path="find-food/match" element={<Matching />} />
              <Route path="food/:id" element={<FoodDetail />} />
              <Route path="my-plan" element={<MyPlan />} />
              <Route path="volunteer" element={<Volunteer />} />
              <Route path="volunteer/match" element={<Matching volunteer />} />
              <Route
                path="volunteer/dashboard"
                element={<VolunteerDashboard />}
              />
              <Route path="volunteer/:id" element={<VolunteerDetail />} />
              <Route path="organizations" element={<Organizations />} />
              <Route
                path="organizations/dashboard"
                element={<OrganizationDashboard />}
              />
              <Route path="resources" element={<Resources />} />
              <Route path="auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DemoProvider>
  </React.StrictMode>,
);
