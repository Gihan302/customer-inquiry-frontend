import { Navigate, Route, Routes } from 'react-router';
import DashboardLayout from '../layouts/DashboardLayout';
import CreateInquiry from '../pages/CreateInquiry';
import Dashboard from '../pages/Dashboard';
import Inquiries from '../pages/Inquiries';
import InquiryDetails from '../pages/InquiryDetails';
import Login from '../pages/Login';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inquiries" element={<Inquiries />} />
          {/* "new" is listed before ":id" for readability; React Router ranks static segments first anyway. */}
          <Route path="inquiries/new" element={<CreateInquiry />} />
          <Route path="inquiries/:id" element={<InquiryDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
