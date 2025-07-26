import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import GuestInstructions from './pages/GuestInstructions';
import Places from './pages/Places';
import Admin from './pages/Admin';
import Login from './pages/Login';
import GuestSurvey from './pages/GuestSurvey';
import { LanguageProvider } from './contexts/LanguageContext';
import ApartmentDetail from './pages/ApartmentDetail';
import ApartmentCalendar from './pages/ApartmentCalendar';
import DefaultApartmentRedirect from './pages/DefaultApartmentRedirect';

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isSurveyPage = location.pathname.startsWith('/survey');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && !isSurveyPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<DefaultApartmentRedirect />} />
          <Route path="/apartments/:slug" element={<ApartmentDetail />} />
          <Route path="/apartments/:apartmentId/calendar" element={<ApartmentCalendar />} />
          <Route path="/places" element={<Places />} />
          <Route path="/survey/:bookingId" element={<GuestSurvey />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {!isAdminPage && !isSurveyPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;