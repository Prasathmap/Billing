import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/auth/Login";
import PosLayout from "./components/PosLayout";
import Dashboard from "./Pages/POS/Dashboard";
import SalesReport from "./Pages/POS/SalesReport";
import Sales from "./Pages/POS/Sales";
import Expance from "./Pages/POS/Expance";
import DayCloseReport from "./Pages/POS/DayCloseReport";
import Notfound from "./Pages/NotFound";
import { OpenRoutes } from "./routing/OpenRoutes";
import { PrivateRoutes } from "./routing/PrivateRoutes";

function App() {
  
  return (
    <Router>
      <Routes>
          <Route path="/" element={ <OpenRoutes> <Login />  </OpenRoutes> }/>
          <Route path="/pos" element={ <PrivateRoutes> <PosLayout /> </PrivateRoutes> }  >
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/:id" element={<Sales />} />
              <Route path="sales-Report" element={<SalesReport />} />
              <Route path="expance" element={<Expance />} />
              <Route path="dayclose" element={<DayCloseReport />} />
          </Route> 

          <Route path="*" element={ <Notfound /> }/>

      </Routes>
    </Router>   
  );
}

export default App;

