import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  User,
  GripVertical,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Check,
  X,
  Stethoscope,
  Scissors,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import * as Types from '../../types';

interface UpcomingAppointmentsSchedulerProps {
  setActiveModule?: (module: string) => void;
}

const DEFAULT_TIME_SLOTS = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const UpcomingAppointmentsScheduler: React.FC<UpcomingAppointmentsSchedulerProps> = ({ setActiveModule }) => {
  const {
    doctorBookings = [],
    groomingBookings = [],
    customers = [],
    pets = [],
    rescheduleDoctorBooking,
    updateDoctorBookingStatus,
    checkInDoctorBooking,
    rescheduleGroomingBooking,
    addDoctorBooking,
    addClinicVisit
  } = useData();

  const { addToast } = useToast();

  // State: Selected date (default today)
  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filter state
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<'all' | 'doctor' | 'grooming'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drag and drop state
  const [draggedBooking, setDraggedBooking] = useState<{
    id: string;
    type: 'doctor' | 'grooming';
    bookingNo: string;
    petName: string;
    currentSlot: string;
    currentDate: string;
    doctorName?: string;
  } | null>(null);

  const [hoveredDropSlot, setHoveredDropSlot] = useState<string | null>(null);

  // Manual Reschedule Modal
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Types.DoctorBooking | Types.GroomingBooking | null>(null);
  const [modalTargetDate, setModalTargetDate] = useState<string>(todayStr);
  const [modalTargetSlot, setModalTargetSlot] = useState<string>('09:00');
  const [modalTargetDoctor, setModalTargetDoctor] = useState<string>('');

  // Conflict / Swap confirmation state
  const [conflictModalData, setConflictModalData] = useState<{
    sourceBooking: any;
    targetBooking: any;
    targetSlot: string;
    targetDate: string;
    targetDoctorName?: string;
  } | null>(null);

  // Create New Booking Modal
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    customerId: '',
    petId: '',
    doctorName: 'drh. Ananda Putri',
    doctorId: 'u2',
    date: todayStr,
    timeSlot: '10:00',
    complaint: ''
  });

  // Doctor roster list for filtering & swimlanes
  const doctorRoster = [
    { id: 'u2', name: 'drh. Ananda Putri', title: 'Poli Umum & Bedah Minor' },
    { id: 'e6', name: 'drh. Citra Prasetyo', title: 'Poli Feline & Eksotik' },
    { id: 'u1', name: 'drh. Hendrawan', title: 'Senior Vet & Bedah Mayor' },
    { id: 'u4', name: 'Binta Amalia', title: 'Senior Pet Groomer' }
  ];

  // Helper date shortcuts
  const getDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().substring(0, 10);
  };

  const tomorrowStr = useMemo(() => getDateOffset(1), []);
  const dayAfterTomorrowStr = useMemo(() => getDateOffset(2), []);

  const formatDateDisplay = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Combine & filter all bookings
  const filteredDoctorBookings = useMemo(() => {
    return (doctorBookings || []).filter((b) => {
      if (selectedServiceCategory === 'grooming') return false;
      const matchDoctor = selectedDoctorFilter === 'all' || b.doctorName?.toLowerCase().includes(selectedDoctorFilter.toLowerCase());
      const matchSearch = !searchQuery || 
        b.petName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.complaint?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDoctor && matchSearch;
    });
  }, [doctorBookings, selectedServiceCategory, selectedDoctorFilter, searchQuery]);

  const filteredGroomingBookings = useMemo(() => {
    return (groomingBookings || []).filter((b) => {
      if (selectedServiceCategory === 'doctor') return false;
      const matchSearch = !searchQuery || 
        b.petName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingNo?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [groomingBookings, selectedServiceCategory, searchQuery]);

  // Bookings specifically for the selected date
  const bookingsForSelectedDate = useMemo(() => {
    const docs = filteredDoctorBookings.filter((b) => b.date === selectedDate);
    const grms = filteredGroomingBookings.filter((b) => b.date === selectedDate);
    return { docs, grms, total: docs.length + grms.length };
  }, [filteredDoctorBookings, filteredGroomingBookings, selectedDate]);

  // Bookings grouped by time slot for selected date
  const bookingsBySlot = useMemo(() => {
    const map: Record<string, { docs: Types.DoctorBooking[]; grms: Types.GroomingBooking[] }> = {};
    DEFAULT_TIME_SLOTS.forEach((slot) => {
      map[slot] = { docs: [], grms: [] };
    });

    bookingsForSelectedDate.docs.forEach((b) => {
      if (!map[b.timeSlot]) map[b.timeSlot] = { docs: [], grms: [] };
      map[b.timeSlot].docs.push(b);
    });

    bookingsForSelectedDate.grms.forEach((b) => {
      if (!map[b.timeSlot]) map[b.timeSlot] = { docs: [], grms: [] };
      map[b.timeSlot].grms.push(b);
    });

    return map;
  }, [bookingsForSelectedDate]);

  // Upcoming unscheduled or waiting bookings shelf (all dates or active)
  const pendingOrUpcomingBookings = useMemo(() => {
    const activeDocs = filteredDoctorBookings.filter((b) => b.status !== 'Selesai' && b.status !== 'Batal');
    return activeDocs.sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot));
  }, [filteredDoctorBookings]);

  // ---------------------------------------------------------------------------
  // DRAG & DROP EVENT HANDLERS
  // ---------------------------------------------------------------------------
  const handleDragStart = (
    e: React.DragEvent,
    booking: Types.DoctorBooking | Types.GroomingBooking,
    type: 'doctor' | 'grooming'
  ) => {
    const payload = {
      id: booking.id,
      type,
      bookingNo: booking.bookingNo,
      petName: booking.petName,
      currentSlot: booking.timeSlot,
      currentDate: booking.date,
      doctorName: (booking as any).doctorName || (booking as any).groomerName || ''
    };

    setDraggedBooking(payload);
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedBooking(null);
    setHoveredDropSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoveredDropSlot !== slot) {
      setHoveredDropSlot(slot);
    }
  };

  const handleDragLeave = (e: React.DragEvent, slot: string) => {
    if (hoveredDropSlot === slot) {
      setHoveredDropSlot(null);
    }
  };

  const handleDropOnSlot = (
    e: React.DragEvent,
    targetSlot: string,
    targetDoctorName?: string
  ) => {
    e.preventDefault();
    setHoveredDropSlot(null);

    let droppedData = draggedBooking;
    if (!droppedData) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) droppedData = JSON.parse(raw);
      } catch (err) {
        console.error(err);
      }
    }

    if (!droppedData) return;

    // Check if slot has existing booking for this doctor/date
    const existingInSlot = (doctorBookings || []).find(
      (b) => b.date === selectedDate && b.timeSlot === targetSlot && b.id !== droppedData?.id && b.status !== 'Batal'
    );

    if (existingInSlot) {
      // Prompt conflict / swap modal
      setConflictModalData({
        sourceBooking: droppedData,
        targetBooking: existingInSlot,
        targetSlot,
        targetDate: selectedDate,
        targetDoctorName: targetDoctorName || existingInSlot.doctorName
      });
      return;
    }

    // Direct reschedule
    executeReschedule(droppedData.id, droppedData.type, selectedDate, targetSlot, targetDoctorName);
  };

  const executeReschedule = (
    bookingId: string,
    type: 'doctor' | 'grooming',
    newDate: string,
    newSlot: string,
    targetDoctorName?: string
  ) => {
    if (type === 'doctor') {
      rescheduleDoctorBooking(bookingId, newDate, newSlot, undefined, targetDoctorName);
      addToast(
        `Jadwal booking berhasil di-reschedule ke ${formatDateDisplay(newDate)} pk ${newSlot} WIB.`,
        'success'
      );
    } else {
      rescheduleGroomingBooking(bookingId, newDate, newSlot, targetDoctorName);
      addToast(
        `Jadwal grooming berhasil di-reschedule ke ${formatDateDisplay(newDate)} pk ${newSlot} WIB.`,
        'success'
      );
    }
    setDraggedBooking(null);
  };

  // Swap bookings between two slots
  const handleConfirmSwap = () => {
    if (!conflictModalData) return;
    const { sourceBooking, targetBooking, targetSlot, targetDate } = conflictModalData;

    // Move source to target slot
    rescheduleDoctorBooking(sourceBooking.id, targetDate, targetSlot);
    // Move existing target back to source's original slot
    rescheduleDoctorBooking(targetBooking.id, sourceBooking.currentDate, sourceBooking.currentSlot);

    addToast(
      `Jadwal berhasil ditukar (Swap)! ${sourceBooking.petName} ke pk ${targetSlot}, dan ${targetBooking.petName} ke pk ${sourceBooking.currentSlot}.`,
      'success'
    );
    setConflictModalData(null);
    setDraggedBooking(null);
  };

  // Overwrite / move target to next available slot
  const handleConfirmShift = () => {
    if (!conflictModalData) return;
    const { sourceBooking, targetBooking, targetSlot, targetDate } = conflictModalData;

    // Find next available slot for the displaced booking
    const currentIndex = DEFAULT_TIME_SLOTS.indexOf(targetSlot);
    let nextSlot = DEFAULT_TIME_SLOTS[currentIndex + 1] || '17:00';
    
    // Look for first unoccupied slot
    for (let i = currentIndex + 1; i < DEFAULT_TIME_SLOTS.length; i++) {
      const slotCandidate = DEFAULT_TIME_SLOTS[i];
      const isOccupied = (doctorBookings || []).some(
        (b) => b.date === targetDate && b.timeSlot === slotCandidate && b.status !== 'Batal'
      );
      if (!isOccupied) {
        nextSlot = slotCandidate;
        break;
      }
    }

    rescheduleDoctorBooking(sourceBooking.id, targetDate, targetSlot);
    rescheduleDoctorBooking(targetBooking.id, targetDate, nextSlot);

    addToast(
      `Jadwal ${sourceBooking.petName} ditempatkan di pk ${targetSlot}, dan ${targetBooking.petName} digeser ke pk ${nextSlot}.`,
      'info'
    );
    setConflictModalData(null);
    setDraggedBooking(null);
  };

  // Manual reschedule submit
  const handleManualRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalBooking) return;
    executeReschedule(
      rescheduleModalBooking.id,
      'doctor',
      modalTargetDate,
      modalTargetSlot,
      modalTargetDoctor || (rescheduleModalBooking as any).doctorName
    );
    setRescheduleModalBooking(null);
  };

  // Quick Check-in to Live Clinic Queue
  const handleQuickCheckIn = (booking: Types.DoctorBooking) => {
    checkInDoctorBooking(booking.id);
    addToast(
      `Pasien ${booking.petName} (${booking.bookingNo}) berhasil di-check-in ke antrean poli ${booking.doctorName}!`,
      'success'
    );
  };

  // Handle New Booking Creation
  const handleCreateNewBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingForm.customerId || !newBookingForm.petId) {
      addToast('Harap pilih pemilik dan hewan peliharaan terlebih dahulu.', 'error');
      return;
    }

    const cust = customers.find((c) => c.id === newBookingForm.customerId);
    const pet = pets.find((p) => p.id === newBookingForm.petId);

    addDoctorBooking({
      customerId: newBookingForm.customerId,
      customerName: cust?.name || 'Pelanggan',
      petId: newBookingForm.petId,
      petName: pet?.name || 'Pasien',
      petSpecies: pet?.species || 'Anjing',
      doctorId: newBookingForm.doctorId,
      doctorName: newBookingForm.doctorName,
      date: newBookingForm.date,
      timeSlot: newBookingForm.timeSlot,
      status: 'Terkonfirmasi',
      complaint: newBookingForm.complaint || 'Pemeriksaan rutin & konsultasi'
    });

    addToast(
      `Booking baru untuk ${pet?.name} pada ${formatDateDisplay(newBookingForm.date)} jam ${newBookingForm.timeSlot} berhasil dibuat!`,
      'success'
    );

    setShowNewBookingModal(false);
    setSelectedDate(newBookingForm.date);
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* SECTION HEADER & CONTROL BAR                                              */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-[#E1D6BE] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E1D6BE]/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1B2A45] text-[#FFFDF9] rounded-xl shadow-xs shrink-0">
              <CalendarCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-[#1B2A45] font-display">
                  Jadwal Janji Temu & Drag-and-Drop Reschedule
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-amber-700" />
                  Drag & Drop Aktif
                </span>
              </div>
              <p className="text-xs text-[#1B2A45]/70 mt-0.5">
                Tarik (drag) kartu reservasi pasien dan jatuhkan (drop) ke slot waktu target untuk memindahkan jam periksa secara instan.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="px-3.5 py-2 bg-[#1B2A45] hover:bg-[#2A3E60] text-[#FFFDF9] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Buat Janji Temu Baru</span>
            </button>
            <button
              onClick={() => setActiveModule && setActiveModule('booking')}
              className="px-3 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] border border-[#E1D6BE] rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>Semua Modul Reservasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date Selector & Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
          {/* Quick Date Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#1B2A45] mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#B8905A]" /> Tanggal:
            </span>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === todayStr
                  ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-xs'
                  : 'bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] hover:bg-[#E1D6BE]'
              }`}
            >
              Hari Ini ({new Date(todayStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
            </button>
            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === tomorrowStr
                  ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-xs'
                  : 'bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] hover:bg-[#E1D6BE]'
              }`}
            >
              Besok ({new Date(tomorrowStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
            </button>
            <button
              onClick={() => setSelectedDate(dayAfterTomorrowStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === dayAfterTomorrowStr
                  ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-xs'
                  : 'bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] hover:bg-[#E1D6BE]'
              }`}
            >
              Lusa ({new Date(dayAfterTomorrowStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
            </button>

            {/* Native Date Picker */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold bg-white text-[#1B2A45] border border-[#E1D6BE] rounded-lg focus:outline-none focus:border-[#1B2A45] cursor-pointer"
              />
            </div>
          </div>

          {/* Doctor & Service Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="text-xs font-bold bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#1B2A45] cursor-pointer"
            >
              <option value="all">Semua Dokter & Groomer</option>
              {doctorRoster.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-[#F6F1E6] p-1 rounded-lg border border-[#E1D6BE]">
              <button
                onClick={() => setSelectedServiceCategory('all')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  selectedServiceCategory === 'all'
                    ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                    : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedServiceCategory('doctor')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  selectedServiceCategory === 'doctor'
                    ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                    : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
                }`}
              >
                Poli Medis
              </button>
              <button
                onClick={() => setSelectedServiceCategory('grooming')}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  selectedServiceCategory === 'grooming'
                    ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                    : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
                }`}
              >
                Grooming
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN DND RESCHEDULER WORKSPACE: TWO-COLUMN LAYOUT                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: UPCOMING APPOINTMENTS DOCK / DRAG SOURCE SHELF (4 COLS)   */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#E1D6BE] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1D6BE]/60">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h4 className="font-bold text-xs text-[#1B2A45] uppercase tracking-wider">
                Daftar Janji Temu Aktif
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#F6F1E6] text-[#1B2A45] font-extrabold text-[11px] border border-[#E1D6BE]">
              {pendingOrUpcomingBookings.length} Reservasi
            </span>
          </div>

          <p className="text-[11px] text-[#1B2A45]/70">
            Pegang & seret (drag) kartu di bawah ini ke slot kosong di papan jadwal sebelah kanan:
          </p>

          {/* Draggable Upcoming Cards List */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {pendingOrUpcomingBookings.length > 0 ? (
              pendingOrUpcomingBookings.map((b) => {
                const isCurrentDate = b.date === selectedDate;
                const isDraggingThis = draggedBooking?.id === b.id;

                return (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, b, 'doctor')}
                    onDragEnd={handleDragEnd}
                    className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none relative group ${
                      isDraggingThis
                        ? 'opacity-40 border-dashed border-[#1B2A45] bg-amber-50 scale-95'
                        : isCurrentDate
                        ? 'bg-[#FAF7F2] hover:bg-[#F3EDE2] border-[#E1D6BE] hover:border-[#1B2A45] hover:shadow-sm'
                        : 'bg-white hover:bg-[#FAF7F2] border-[#E1D6BE]/80 hover:border-[#1B2A45]/60 hover:shadow-2xs'
                    }`}
                  >
                    {/* Card Top Row: Grip + Booking No + Date & Time Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-4 h-4 text-[#1B2A45]/40 group-hover:text-[#1B2A45] transition-colors" />
                        <div>
                          <span className="font-mono text-[10px] font-bold text-[#1B2A45]/70 block">
                            {b.bookingNo}
                          </span>
                          <h5 className="font-extrabold text-xs text-[#1B2A45] flex items-center gap-1.5">
                            <span>{b.petName}</span>
                            <span className="text-[10px] font-normal text-[#1B2A45]/60">
                              ({b.petSpecies})
                            </span>
                          </h5>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-md bg-[#1B2A45] text-[#FFFDF9] font-mono text-[10px] font-bold block">
                          {b.timeSlot} WIB
                        </span>
                        <span className="text-[9px] text-[#1B2A45]/60 font-semibold block mt-0.5">
                          {b.date === todayStr ? 'Hari Ini' : b.date}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Doctor Information */}
                    <div className="space-y-1 text-[11px] bg-white/80 p-2 rounded-lg border border-[#E1D6BE]/40 mb-2.5">
                      <div className="flex items-center justify-between text-[#1B2A45]">
                        <span className="text-[#1B2A45]/60">Pemilik:</span>
                        <span className="font-bold">{b.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#1B2A45]">
                        <span className="text-[#1B2A45]/60">Dokter:</span>
                        <span className="font-semibold text-emerald-800">{b.doctorName}</span>
                      </div>
                      {b.complaint && (
                        <p className="text-[10px] text-[#1B2A45]/80 italic pt-1 border-t border-[#E1D6BE]/30 line-clamp-1">
                          "{b.complaint}"
                        </p>
                      )}
                    </div>

                    {/* Quick Action Footer */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E1D6BE]/40">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          b.status === 'Terkonfirmasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleModalBooking(b);
                            setModalTargetDate(b.date);
                            setModalTargetSlot(b.timeSlot);
                            setModalTargetDoctor(b.doctorName);
                          }}
                          className="px-2 py-1 bg-white hover:bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Ubah Jadwal secara manual tanpa drag"
                        >
                          <Clock className="w-3 h-3 text-[#B8905A]" />
                          <span>Ubah Jam</span>
                        </button>

                        {b.date === todayStr && b.status !== 'Selesai' && (
                          <button
                            type="button"
                            onClick={() => handleQuickCheckIn(b)}
                            className="px-2 py-1 bg-[#1B2A45] hover:bg-[#2A3E60] text-amber-300 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Check-in langsung ke Antrean Poli Hari Ini"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Check-in</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#E1D6BE] text-[#1B2A45]/60 space-y-2">
                <CalendarCheck className="w-6 h-6 mx-auto text-[#1B2A45]/30" />
                <p className="font-bold text-xs text-[#1B2A45]">Tidak ada janji temu aktif</p>
                <p className="text-[10px]">Klik tombol "+ Buat Janji Temu Baru" untuk menambahkan reservasi pasien.</p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE DAILY SCHEDULE TIME SLOTS GRID (8 COLS)       */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-[#E1D6BE] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E1D6BE]/60">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B8905A]" />
                <h4 className="font-bold text-sm text-[#1B2A45]">
                  Papan Slot Waktu — {formatDateDisplay(selectedDate)}
                </h4>
              </div>
              <p className="text-[11px] text-[#1B2A45]/70 mt-0.5">
                Total {bookingsForSelectedDate.total} reservasi terdaftar pada tanggal ini.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#1B2A45]/70">
                Tersedia {DEFAULT_TIME_SLOTS.filter(s => bookingsBySlot[s]?.docs.length === 0 && bookingsBySlot[s]?.grms.length === 0).length} Slot Kosong
              </span>
            </div>
          </div>

          {/* Drag Instruction Banner */}
          {draggedBooking && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-700" />
                <span>
                  Sedang menyeret booking <strong>{draggedBooking.petName}</strong> ({draggedBooking.bookingNo}). Lepaskan (drop) pada salah satu slot waktu di bawah ini.
                </span>
              </div>
              <button
                onClick={() => setDraggedBooking(null)}
                className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 rounded text-[10px] font-bold text-amber-900 cursor-pointer"
              >
                Batal Seret
              </button>
            </div>
          )}

          {/* Time Slot Grid (2 columns on desktop for spacious layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {DEFAULT_TIME_SLOTS.map((slot) => {
              const slotData = bookingsBySlot[slot] || { docs: [], grms: [] };
              const isOccupied = slotData.docs.length > 0 || slotData.grms.length > 0;
              const isDropHovered = hoveredDropSlot === slot;

              return (
                <div
                  key={slot}
                  onDragOver={(e) => handleDragOver(e, slot)}
                  onDragLeave={(e) => handleDragLeave(e, slot)}
                  onDrop={(e) => handleDropOnSlot(e, slot)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 min-h-[105px] flex flex-col justify-between ${
                    isDropHovered
                      ? 'border-2 border-dashed border-amber-600 bg-amber-50/80 scale-[1.02] shadow-md ring-2 ring-amber-300'
                      : isOccupied
                      ? 'bg-[#FAF7F2] border-[#E1D6BE] shadow-2xs hover:border-[#1B2A45]/40'
                      : 'bg-white border-dashed border-[#E1D6BE] hover:border-[#B8905A] hover:bg-[#FCFAF6]'
                  }`}
                >
                  {/* Slot Header */}
                  <div className="flex items-center justify-between border-b border-[#E1D6BE]/40 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#1B2A45] text-[#FFFDF9] font-mono text-xs font-black rounded-md shadow-2xs">
                        {slot} WIB
                      </span>
                      <span className="text-[10px] text-[#1B2A45]/60 font-semibold">
                        Slot 30 Menit
                      </span>
                    </div>

                    {isOccupied ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Terisi ({slotData.docs.length + slotData.grms.length})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Slot Tersedia
                      </span>
                    )}
                  </div>

                  {/* Slot Content: Occupied Card OR Empty Drop Target */}
                  {isOccupied ? (
                    <div className="space-y-2">
                      {slotData.docs.map((docBooking) => (
                        <div
                          key={docBooking.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, docBooking, 'doctor')}
                          onDragEnd={handleDragEnd}
                          className="p-2.5 rounded-lg bg-white border border-[#E1D6BE] shadow-2xs space-y-1.5 cursor-grab active:cursor-grabbing hover:border-[#1B2A45] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3.5 h-3.5 text-[#1B2A45]/40" />
                              <span className="font-extrabold text-xs text-[#1B2A45]">
                                {docBooking.petName}
                              </span>
                              <span className="text-[10px] text-[#1B2A45]/60">
                                ({docBooking.petSpecies})
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#1B2A45]/70">
                              {docBooking.bookingNo}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-[#1B2A45]/80">
                            <span>Klien: <strong>{docBooking.customerName}</strong></span>
                            <span className="text-emerald-700 font-semibold">{docBooking.doctorName}</span>
                          </div>

                          {docBooking.complaint && (
                            <p className="text-[10px] text-[#1B2A45]/70 italic line-clamp-1">
                              Keluhan: {docBooking.complaint}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-[#E1D6BE]/30 text-[10px]">
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {docBooking.status}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRescheduleModalBooking(docBooking);
                                  setModalTargetDate(docBooking.date);
                                  setModalTargetSlot(docBooking.timeSlot);
                                  setModalTargetDoctor(docBooking.doctorName);
                                }}
                                className="px-1.5 py-0.5 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] rounded text-[10px] font-bold"
                              >
                                Ubah
                              </button>
                              {selectedDate === todayStr && docBooking.status !== 'Selesai' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickCheckIn(docBooking)}
                                  className="px-1.5 py-0.5 bg-[#1B2A45] hover:bg-[#2A3E60] text-amber-300 rounded text-[10px] font-bold"
                                >
                                  Check-in Poli
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {slotData.grms.map((grmBooking) => (
                        <div
                          key={grmBooking.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, grmBooking, 'grooming')}
                          onDragEnd={handleDragEnd}
                          className="p-2.5 rounded-lg bg-pink-50/50 border border-pink-200 shadow-2xs space-y-1.5 cursor-grab active:cursor-grabbing hover:border-pink-400 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Scissors className="w-3.5 h-3.5 text-pink-600" />
                              <span className="font-extrabold text-xs text-[#1B2A45]">
                                {grmBooking.petName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#1B2A45]/70">
                              {grmBooking.bookingNo}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#1B2A45]/80">
                            <span>Groomer: <strong>{grmBooking.groomerName}</strong></span>
                            <span className="font-semibold text-pink-700">{grmBooking.packageType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`h-full py-4 rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                        isDropHovered
                          ? 'bg-amber-100/60 text-amber-900 font-bold'
                          : 'text-[#1B2A45]/40 hover:text-[#1B2A45]/80'
                      }`}
                    >
                      {isDropHovered ? (
                        <div className="space-y-1 animate-bounce">
                          <ArrowRightLeft className="w-5 h-5 mx-auto text-amber-800" />
                          <p className="text-xs font-black text-amber-900">
                            Lepaskan untuk Reschedule ke {slot}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Plus className="w-4 h-4 mx-auto text-[#1B2A45]/30" />
                          <p className="text-[10px] font-semibold text-[#1B2A45]/50">
                            Tarik booking ke sini untuk jadwalkan ke {slot}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CONFLICT & SWAP / SHIFT CONFIRMATION DIALOG                      */}
      {/* ========================================================================= */}
      {conflictModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E1D6BE] shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-[#E1D6BE]">
              <div className="flex items-center gap-2.5 text-amber-700">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-[#1B2A45]">
                  Slot Waktu Sudah Terisi (Konflik Jadwal)
                </h4>
              </div>
              <button
                onClick={() => setConflictModalData(null)}
                className="p-1 hover:bg-[#F6F1E6] rounded-md text-[#1B2A45]/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#1B2A45]/80 leading-relaxed">
              Slot waktu <strong>{conflictModalData.targetSlot} WIB</strong> pada tanggal{' '}
              <strong>{formatDateDisplay(conflictModalData.targetDate)}</strong> saat ini telah terisi oleh{' '}
              <strong>{conflictModalData.targetBooking.petName}</strong> ({conflictModalData.targetBooking.customerName}).
            </p>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E1D6BE] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#1B2A45]/60">Pasien yang dipindahkan:</span>
                <span className="font-bold text-[#1B2A45]">{conflictModalData.sourceBooking.petName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1B2A45]/60">Pasien yang menempati slot:</span>
                <span className="font-bold text-[#1B2A45]">{conflictModalData.targetBooking.petName}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmSwap}
                className="w-full py-2.5 bg-[#1B2A45] hover:bg-[#2A3E60] text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>1. Tukar Jadwal Antar Kedua Pasien (Swap Slots)</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmShift}
                className="w-full py-2.5 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-[#E1D6BE] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#B8905A]" />
                <span>2. Geser Pasien Lama ke Slot Waktu Berikutnya</span>
              </button>

              <button
                type="button"
                onClick={() => setConflictModalData(null)}
                className="w-full py-2 bg-transparent hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batalkan Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUAL RESCHEDULE DIALOG (FOR TOUCH OR CLICK ACCESS)             */}
      {/* ========================================================================= */}
      {rescheduleModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleManualRescheduleSubmit}
            className="bg-white rounded-2xl border border-[#E1D6BE] shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E1D6BE]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#1B2A45] text-amber-300 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B2A45]">
                    Ubah Jam & Tanggal Janji Temu
                  </h4>
                  <p className="text-[10px] text-[#1B2A45]/60">
                    {rescheduleModalBooking.bookingNo} • Pasien: {rescheduleModalBooking.petName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalBooking(null)}
                className="p-1 hover:bg-[#F6F1E6] rounded-md text-[#1B2A45]/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1B2A45] mb-1">Pilih Tanggal Baru</label>
                <input
                  type="date"
                  required
                  value={modalTargetDate}
                  onChange={(e) => setModalTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] text-[#1B2A45] font-semibold border border-[#E1D6BE] rounded-xl focus:outline-none focus:border-[#1B2A45]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1B2A45] mb-1">Pilih Dokter / Praktisi</label>
                <select
                  value={modalTargetDoctor}
                  onChange={(e) => setModalTargetDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] text-[#1B2A45] font-semibold border border-[#E1D6BE] rounded-xl focus:outline-none focus:border-[#1B2A45]"
                >
                  {doctorRoster.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} — {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1B2A45] mb-1.5">Pilih Slot Waktu Baru</label>
                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const isOccupied = (doctorBookings || []).some(
                      (b) => b.date === modalTargetDate && b.timeSlot === slot && b.id !== rescheduleModalBooking.id && b.status !== 'Batal'
                    );
                    const isSelected = modalTargetSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setModalTargetSlot(slot)}
                        className={`py-2 px-1 text-center rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B2A45] text-amber-300 border-[#1B2A45] shadow-xs'
                            : isOccupied
                            ? 'bg-amber-50/70 text-amber-800 border-amber-300'
                            : 'bg-[#FAF7F2] text-[#1B2A45] border-[#E1D6BE] hover:bg-[#E1D6BE]'
                        }`}
                      >
                        {slot}
                        {isOccupied && <span className="block text-[8px] text-amber-700 font-sans">Terisi</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E1D6BE]">
              <button
                type="button"
                onClick={() => setRescheduleModalBooking(null)}
                className="px-4 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1B2A45] hover:bg-[#2A3E60] text-amber-300 font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Simpan Jadwal Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW APPOINTMENT MODAL                                     */}
      {/* ========================================================================= */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewBooking}
            className="bg-white rounded-2xl border border-[#E1D6BE] shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E1D6BE]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#1B2A45] text-amber-300 rounded-lg">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B2A45]">
                    Buat Reservasi Janji Temu Baru
                  </h4>
                  <p className="text-[10px] text-[#1B2A45]/60">
                    Jadwalkan konsultasi dokter atau tindakan poliklinik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewBookingModal(false)}
                className="p-1 hover:bg-[#F6F1E6] rounded-md text-[#1B2A45]/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1B2A45] mb-1">Pilih Pemilik (Klien)</label>
                  <select
                    required
                    value={newBookingForm.customerId}
                    onChange={(e) => {
                      const custId = e.target.value;
                      const matchedPet = (pets || []).find((p) => p.customerId === custId);
                      setNewBookingForm((prev) => ({
                        ...prev,
                        customerId: custId,
                        petId: matchedPet ? matchedPet.id : ''
                      }));
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] text-[#1B2A45] font-semibold border border-[#E1D6BE] rounded-xl focus:outline-none focus:border-[#1B2A45]"
                  >
                    <option value="">-- Pilih Pemilik --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1B2A45] mb-1">Pilih Pasien Hewan</label>
                  <select
                    required
                    value={newBookingForm.petId}
                    onChange={(e) => setNewBookingForm((prev) => ({ ...prev, petId: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] text-[#1B2A45] font-semibold border border-[#E1D6BE] rounded-xl focus:outline-none focus:border-[#1B2A45]"
                  >
                    <option value="">-- Pilih Hewan --</option>
                    {pets
                      .filter((p) => !newBookingForm.customerId || p.customerId === newBookingForm.customerId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species} - {p.breed})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1B2A45] mb-1">Tanggal Janji Temu</label>
                  <input
                    type="date"
                    required
                    value={newBookingForm.date}
                    onChange={(e) => setNewBookingForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] text-[#1B2A45] font-semibold border border-[#E1D6BE] rounded-xl focus:outline-none focus:border-[#1B2A45]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1B2A45] mb-1">Dokter Bertugas</label>
                  <select
                    value={newBookingForm.doctorName}
                    onChange={(e) => {
                      const doc = doctorRoster.find((d) => d.name === e.target.value);
                      setNewBookingForm((prev) => ({
                        ...prev,
                        doctorName: e.target.value,
                        doctorId: doc?.id || 'u2'
                      }));
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] text-[#1B2A45] font-semibold border border-[#E1D6BE] rounded-xl focus:outline-none focus:border-[#1B2A45]"
                  >
                    {doctorRoster.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1B2A45] mb-1.5">Slot Waktu</label>
                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const isOccupied = (doctorBookings || []).some(
                      (b) => b.date === newBookingForm.date && b.timeSlot === slot && b.status !== 'Batal'
                    );
                    const isSelected = newBookingForm.timeSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setNewBookingForm((prev) => ({ ...prev, timeSlot: slot }))}
                        className={`py-2 text-center rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B2A45] text-amber-300 border-[#1B2A45] shadow-xs'
                            : isOccupied
                            ? 'bg-amber-50/70 text-amber-800 border-amber-300'
                            : 'bg-[#FAF7F2] text-[#1B2A45] border-[#E1D6BE] hover:bg-[#E1D6BE]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1B2A45] mb-1">Keluhan / Catatan Pemeriksaan</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Vaksinasi tahunan, nafsu makan menurun, atau pemeriksaan telinga..."
                  value={newBookingForm.complaint}
                  onChange={(e) => setNewBookingForm((prev) => ({ ...prev, complaint: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] text-[#1B2A45] font-medium border border-[#E1D6BE] rounded-xl focus:outline-none focus:border-[#1B2A45] placeholder-[#1B2A45]/40 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E1D6BE]">
              <button
                type="button"
                onClick={() => setShowNewBookingModal(false)}
                className="px-4 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1B2A45] hover:bg-[#2A3E60] text-amber-300 font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Konfirmasi Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
