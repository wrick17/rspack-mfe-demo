import React, { Suspense, lazy } from "react";
import Home from "./Home";

const Child = lazy(() => import("child/app"));

function App() {
  return (
    <div>
      <Home />
      <Suspense>
        <Child />
      </Suspense>
    </div>
  );
}

export default App;

