import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import PhotoDetail from "@/pages/PhotoDetail";
import Photographer from "@/pages/Photographer";
import PhotographerList from "@/pages/PhotographerList";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import Upload from "@/pages/Upload";
import Profile from "@/pages/Profile";

import Following from "@/pages/Following";
import Location from "@/pages/Location";
import { Toaster } from "sonner";
import { preloadPhotos } from "@/data/mockData";

export default function App() {
  // 预加载照片数据
  useEffect(() => {
    preloadPhotos();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/photographers" element={<PhotographerList />} />
          <Route path="/photographer/:id" element={<Photographer />} />
          
          <Route path="/following" element={<Following />} />
          <Route path="/location" element={<Location />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}
