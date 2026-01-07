import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomPage from "@/pages/room/RoomPage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";
import HomePage from "@/pages/home/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/prototype" element={<RoomPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
