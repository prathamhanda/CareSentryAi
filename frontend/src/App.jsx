import { useLocation } from "react-router-dom";
import { Header, Footer } from "./components";
import { Outlet } from "react-router-dom";

function App() {
  const location = useLocation();
  const hideLayout = location.pathname === "/";

  return (
    <>
      {!hideLayout && <Header />}

      <main className="min-h-[70vh] bg-gray-950 text-gray-100 transition-colors">
        <Outlet />
      </main>

      {<Footer />}
    </>
  );
}

export default App;
