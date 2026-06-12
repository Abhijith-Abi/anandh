"use client";

import React, { useState, useEffect } from 'react';
import { request } from '../../utils/api';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Eye, 
  X, 
  AlertTriangle,
  Check,
  RefreshCw
} from 'lucide-react';

interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  attendance_percentage: string;
  internal_marks: string;
  assignment_marks: string;
  quiz_marks: string;
  study_hours: string;
  gpa: string;
  risk_level: string;
  predicted_grade: string;
}

export default function StudentsDirectory() {
  // Lists and loading
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search & filter states
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  // Dialog Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form Fields
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('Computer Science & Engineering');
  const [formSem, setFormSem] = useState(1);
  const [formAttendance, setFormAttendance] = useState('80');
  const [formInternal, setFormInternal] = useState('75');
  const [formAssignment, setFormAssignment] = useState('78');
  const [formQuiz, setFormQuiz] = useState('70');
  const [formStudyHours, setFormStudyHours] = useState('12');
  const [formGpa, setFormGpa] = useState('7.5');
  const [formError, setFormError] = useState('');
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchStudents = async (page: number = 1, overrideUrl: string | null = null) => {
    try {
      setLoading(true);
      let endpoint = '/students/';
      
      const params: Record<string, string> = {
        search,
        department: deptFilter,
        semester: semFilter,
        risk_level: riskFilter,
        predicted_grade: gradeFilter,
        page: String(page)
      };

      const res = await request(endpoint, { params });
      if (!res.ok) throw new Error('Could not fetch student profiles');
      const data = await res.json();
      
      // DRF returns pagination as {count, next, previous, results} or plain list
      if (data.results) {
        setStudents(data.results);
        setTotalCount(data.count);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
      } else {
        setStudents(data);
        setTotalCount(data.length);
        setNextUrl(null);
        setPrevUrl(null);
      }
      setCurrentPage(page);
    } catch (err: any) {
      triggerToast(err.message || 'Error loading student directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [deptFilter, semFilter, riskFilter, gradeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const resetFilters = () => {
    setSearch('');
    setDeptFilter('');
    setSemFilter('');
    setRiskFilter('');
    setGradeFilter('');
    fetchStudents(1);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormStudentId('');
    setFormName('');
    setFormEmail('');
    setFormDept('Computer Science & Engineering');
    setFormSem(1);
    setFormAttendance('80');
    setFormInternal('75');
    setFormAssignment('78');
    setFormQuiz('70');
    setFormStudyHours('12');
    setFormGpa('7.5');
    setFormError('');
    setShowAddEditModal(true);
  };

  const openEditModal = (student: Student) => {
    setIsEditing(true);
    setSelectedStudent(student);
    setFormStudentId(student.student_id);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormDept(student.department);
    setFormSem(student.semester);
    setFormAttendance(parseFloat(student.attendance_percentage).toString());
    setFormInternal(parseFloat(student.internal_marks).toString());
    setFormAssignment(parseFloat(student.assignment_marks).toString());
    setFormQuiz(parseFloat(student.quiz_marks).toString());
    setFormStudyHours(parseFloat(student.study_hours).toString());
    setFormGpa(parseFloat(student.gpa).toString());
    setFormError('');
    setShowAddEditModal(true);
  };

  const openViewModal = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const bodyData = {
      student_id: formStudentId,
      name: formName,
      email: formEmail,
      department: formDept,
      semester: Number(formSem),
      attendance_percentage: Number(formAttendance),
      internal_marks: Number(formInternal),
      assignment_marks: Number(formAssignment),
      quiz_marks: Number(formQuiz),
      study_hours: Number(formStudyHours),
      gpa: Number(formGpa)
    };

    try {
      let res;
      if (isEditing && selectedStudent) {
        res = await request(`/students/${selectedStudent.id}/`, {
          method: 'PUT',
          body: JSON.stringify(bodyData)
        });
      } else {
        res = await request('/students/', {
          method: 'POST',
          body: JSON.stringify(bodyData)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMsg = errorData[firstErrorKey];
        throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : `${firstErrorKey}: ${errorMsg}`);
      }

      triggerToast(isEditing ? 'Student profile updated!' : 'Student profile created!');
      setShowAddEditModal(false);
      fetchStudents(currentPage);
    } catch (err: any) {
      setFormError(err.message || 'Error saving student profile');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await request(`/students/${studentToDelete.id}/`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Could not delete student record');
      
      triggerToast('Student profile deleted successfully!');
      setStudentToDelete(null);
      fetchStudents(currentPage);
    } catch (err: any) {
      triggerToast(err.message || 'Error deleting student profile', 'error');
    }
  };

  // Helper styles for badges
  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'High':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    }
  };

  const getGradeBadge = (grade: string) => {
    switch(grade) {
      case 'Excellent':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Good':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Average':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalCount / 10);
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl transition-all duration-300 border ${
          toastType === 'success' 
            ? 'bg-zinc-900 border-zinc-800 text-emerald-400 dark:bg-zinc-900 dark:border-zinc-800' 
            : 'bg-zinc-900 border-zinc-800 text-red-400 dark:bg-zinc-900 dark:border-zinc-800'
        }`}>
          {toastType === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Directory</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage and profile student academic data</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/10"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, or email..."
              className="w-full rounded-xl border border-zinc-250 bg-zinc-50 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:bg-white dark:border-zinc-850 dark:bg-zinc-950 dark:focus:bg-zinc-950 dark:focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Dept Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-zinc-250 bg-zinc-50 px-3 py-2.5 outline-none dark:border-zinc-850 dark:bg-zinc-950 text-sm"
            >
              <option value="">All Departments</option>
              <option value="Computer Science & Engineering">CS & Engineering</option>
              <option value="Electrical & Electronics Engineering">EE Engineering</option>
              <option value="Mechanical Engineering">Mechanical Eng</option>
              <option value="Civil Engineering">Civil Eng</option>
              <option value="Data Science & AI">Data Science & AI</option>
            </select>

            {/* Semester Filter */}
            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="rounded-xl border border-zinc-250 bg-zinc-50 px-3 py-2.5 outline-none dark:border-zinc-850 dark:bg-zinc-950 text-sm"
            >
              <option value="">All Semesters</option>
              {[...Array(8)].map((_, i) => (
                <option key={i+1} value={i+1}>Semester {i+1}</option>
              ))}
            </select>

            {/* Risk Level Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-xl border border-zinc-250 bg-zinc-50 px-3 py-2.5 outline-none dark:border-zinc-850 dark:bg-zinc-950 text-sm"
            >
              <option value="">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            {/* Prediction Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="rounded-xl border border-zinc-250 bg-zinc-50 px-3 py-2.5 outline-none dark:border-zinc-850 dark:bg-zinc-950 text-sm"
            >
              <option value="">All Grades</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-850 dark:hover:bg-zinc-950 flex items-center gap-1.5 transition"
            >
              <RefreshCw size={14} />
              Reset
            </button>
            
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Student List Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-100/80 text-[11px] font-bold uppercase tracking-wider text-zinc-650 dark:bg-zinc-950/60 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-4">Student</th>
                <th scope="col" className="px-6 py-4">Department</th>
                <th scope="col" className="px-6 py-4 text-center">Attendance</th>
                <th scope="col" className="px-6 py-4 text-center">Internals</th>
                <th scope="col" className="px-6 py-4 text-center">Assignments</th>
                <th scope="col" className="px-6 py-4 text-center">Quizzes</th>
                <th scope="col" className="px-6 py-4 text-center">Study Hours</th>
                <th scope="col" className="px-6 py-4 text-center">GPA</th>
                <th scope="col" className="px-6 py-4 text-center">Risk Index</th>
                <th scope="col" className="px-6 py-4 text-center">Prediction</th>
                <th scope="col" className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                [...Array(10)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-1" />
                      <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded opacity-60" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-1" />
                      <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded opacity-60" />
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-12 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-10 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-10 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-10 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-10 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-10 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 font-medium">
                    No student profiles matched the criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors odd:bg-white even:bg-zinc-50/20 dark:odd:bg-zinc-900/10 dark:even:bg-zinc-900/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{student.name}</div>
                      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-450">{student.student_id} • {student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-900 dark:text-zinc-200 font-bold text-xs">{student.department}</div>
                      <div className="text-xs font-semibold text-zinc-500">Sem {student.semester}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-zinc-900 dark:text-zinc-100">
                      {parseFloat(student.attendance_percentage).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      {parseFloat(student.internal_marks).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      {parseFloat(student.assignment_marks).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      {parseFloat(student.quiz_marks).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                      {parseFloat(student.study_hours).toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-zinc-950 dark:text-white">
                      {parseFloat(student.gpa).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${getRiskBadge(student.risk_level)}`}>
                        {student.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-bold border ${getGradeBadge(student.predicted_grade)}`}>
                        {student.predicted_grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openViewModal(student)}
                          className="rounded-lg p-1.5 text-zinc-550 hover:bg-zinc-150 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="rounded-lg p-1.5 text-zinc-550 hover:bg-zinc-150 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          title="Edit Profile"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="rounded-lg p-1.5 text-zinc-550 hover:bg-red-50 hover:text-red-650 dark:text-zinc-400 dark:hover:bg-red-950/35 dark:hover:text-red-400"
                          title="Delete Profile"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-850 dark:bg-zinc-900">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Showing <span className="font-semibold text-zinc-950 dark:text-white">{students.length}</span> of <span className="font-semibold text-zinc-950 dark:text-white">{totalCount}</span> students
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchStudents(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center justify-center rounded-lg border border-zinc-200 p-2 text-zinc-550 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:hover:bg-zinc-950 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={idx} className="px-2.5 py-1 text-sm text-zinc-400">
                    ...
                  </span>
                );
              }
              const isCurrent = currentPage === p;
              return (
                <button
                  key={idx}
                  onClick={() => fetchStudents(Number(p))}
                  disabled={loading}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950 text-zinc-650 dark:text-zinc-400'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            
            <button
              onClick={() => fetchStudents(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalCount / 10) || loading}
              className="flex items-center justify-center rounded-lg border border-zinc-200 p-2 text-zinc-550 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:hover:bg-zinc-950 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowAddEditModal(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-sm">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <h3 className="text-lg font-bold">{isEditing ? 'Edit Student Profile' : 'Add New Student'}</h3>
              <button onClick={() => setShowAddEditModal(false)} className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </div>
            
            {formError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-500">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500 disabled:opacity-50"
                  placeholder="e.g. STU01234"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                  placeholder="e.g. john@school.edu"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Department</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Semester</label>
                <select
                  value={formSem}
                  onChange={(e) => setFormSem(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                >
                  {[...Array(8)].map((_, i) => (
                    <option key={i+1} value={i+1}>Semester {i+1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Attendance Percentage *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formAttendance}
                  onChange={(e) => setFormAttendance(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                  placeholder="0.00 - 100.00"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Internal Marks (out of 100) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formInternal}
                  onChange={(e) => setFormInternal(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Assignment Marks (out of 100) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formAssignment}
                  onChange={(e) => setFormAssignment(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Quiz Marks (out of 100) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formQuiz}
                  onChange={(e) => setFormQuiz(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Study Hours (Weekly) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formStudyHours}
                  onChange={(e) => setFormStudyHours(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">GPA / CGPA (0.00 - 10.00) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formGpa}
                  onChange={(e) => setFormGpa(e.target.value)}
                  className="w-full rounded-xl border border-zinc-250 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition focus:border-blue-500"
                  placeholder="0.00 - 10.00"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-3 border-t border-zinc-150 pt-4 mt-2 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 font-semibold hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10 transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowViewModal(false)} />
          <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-sm">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <h3 className="text-lg font-bold">Student Academic Profile</h3>
              <button onClick={() => setShowViewModal(false)} className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={18} /></button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Profile Top Summary */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 p-4">
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">{selectedStudent.name}</h4>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">ID: {selectedStudent.student_id} | {selectedStudent.email}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRiskBadge(selectedStudent.risk_level)}`}>
                    {selectedStudent.risk_level} Risk
                  </span>
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${getGradeBadge(selectedStudent.predicted_grade)}`}>
                    {selectedStudent.predicted_grade}
                  </span>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-850 p-3">
                  <span className="block text-xs text-zinc-400 font-semibold uppercase">Department</span>
                  <span className="block font-bold text-zinc-800 dark:text-zinc-200 mt-1">{selectedStudent.department}</span>
                </div>
                <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-850 p-3">
                  <span className="block text-xs text-zinc-400 font-semibold uppercase">Semester</span>
                  <span className="block font-bold text-zinc-800 dark:text-zinc-200 mt-1">Semester {selectedStudent.semester}</span>
                </div>
                <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-850 p-3">
                  <span className="block text-xs text-zinc-400 font-semibold uppercase">Attendance Rate</span>
                  <span className="block font-bold text-zinc-800 dark:text-zinc-200 mt-1">{parseFloat(selectedStudent.attendance_percentage).toFixed(1)}%</span>
                </div>
                <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-850 p-3">
                  <span className="block text-xs text-zinc-400 font-semibold uppercase">CGPA / GPA</span>
                  <span className="block font-bold text-zinc-800 dark:text-zinc-200 mt-1">{parseFloat(selectedStudent.gpa).toFixed(2)} / 10.0</span>
                </div>
              </div>

              {/* Marks Details */}
              <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-850 p-4">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3 border-b border-zinc-150 pb-1.5 dark:border-zinc-800">Academic Score Breakdown</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg">
                    <span className="block text-[10px] uppercase text-zinc-400 font-bold">Internals</span>
                    <span className="block font-extrabold text-sm mt-1">{parseFloat(selectedStudent.internal_marks).toFixed(1)}</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg">
                    <span className="block text-[10px] uppercase text-zinc-400 font-bold">Assignments</span>
                    <span className="block font-extrabold text-sm mt-1">{parseFloat(selectedStudent.assignment_marks).toFixed(1)}</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg">
                    <span className="block text-[10px] uppercase text-zinc-400 font-bold">Quizzes</span>
                    <span className="block font-extrabold text-sm mt-1">{parseFloat(selectedStudent.quiz_marks).toFixed(1)}</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg">
                    <span className="block text-[10px] uppercase text-zinc-400 font-bold">Study Hours</span>
                    <span className="block font-extrabold text-sm mt-1">{parseFloat(selectedStudent.study_hours).toFixed(1)}h</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end border-t border-zinc-150 pt-4 mt-5 dark:border-zinc-800">
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-xl bg-zinc-900 px-5 py-2.5 font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStudentToDelete(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-sm">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Confirm Deletion</h3>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 mt-3">
              Are you sure you want to permanently delete student profile <b>{studentToDelete.name}</b> ({studentToDelete.student_id})? This action is irreversible.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-zinc-150 pt-4 dark:border-zinc-800">
              <button
                onClick={() => setStudentToDelete(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 font-semibold hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 transition"
              >
                No, Keep
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-500 shadow-lg shadow-red-500/10 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
