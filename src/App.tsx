import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Department from "@/pages/organization/Department";
import EmployeeList from "@/pages/organization/EmployeeList";
import EmployeeArchive from "@/pages/employee/Archive";
import EntryManagement from "@/pages/employee/Entry";
import TransferManagement from "@/pages/employee/Transfer";
import ResignManagement from "@/pages/employee/Resign";
import AttendanceRecords from "@/pages/attendance/Records";
import AttendanceSummary from "@/pages/attendance/Summary";
import LeaveManagement from "@/pages/attendance/Leave";
import OvertimeManagement from "@/pages/attendance/Overtime";
import FieldworkManagement from "@/pages/attendance/Fieldwork";
import AppealManagement from "@/pages/attendance/Appeal";
import PerformanceTemplate from "@/pages/performance/Template";
import PerformanceReview from "@/pages/performance/Review";
import PerformanceResult from "@/pages/performance/Result";
import SalaryGrade from "@/pages/performance/Salary";

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/organization/department" element={<Department />} />
          <Route path="/organization/employee" element={<EmployeeList />} />
          <Route path="/employee/archive" element={<EmployeeArchive />} />
          <Route path="/employee/entry" element={<EntryManagement />} />
          <Route path="/employee/transfer" element={<TransferManagement />} />
          <Route path="/employee/resign" element={<ResignManagement />} />
          <Route path="/attendance/records" element={<AttendanceRecords />} />
          <Route path="/attendance/summary" element={<AttendanceSummary />} />
          <Route path="/attendance/leave" element={<LeaveManagement />} />
          <Route path="/attendance/overtime" element={<OvertimeManagement />} />
          <Route path="/attendance/fieldwork" element={<FieldworkManagement />} />
          <Route path="/attendance/appeal" element={<AppealManagement />} />
          <Route path="/performance/template" element={<PerformanceTemplate />} />
          <Route path="/performance/review" element={<PerformanceReview />} />
          <Route path="/performance/result" element={<PerformanceResult />} />
          <Route path="/performance/salary" element={<SalaryGrade />} />
          <Route path="*" element={<div className="text-center text-xl py-20 text-gray-500">页面不存在</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
