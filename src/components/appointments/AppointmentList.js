import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/components.css';

const AppointmentList = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let appointmentsQuery = collection(db, 'appointments');
        
        if (selectedDate) {
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          appointmentsQuery = query(
            appointmentsQuery,
            where('date', '>=', startOfDay.toISOString()),
            where('date', '<=', endOfDay.toISOString())
          );
        }

        const querySnapshot = await getDocs(appointmentsQuery);
        const appointmentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const filteredAppointments = statusFilter === 'all'
          ? appointmentList
          : appointmentList.filter(apt => apt.status === statusFilter);

        setAppointments(filteredAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate, statusFilter]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex flex-between flex-center">
        <h1 className="title">Appointments</h1>
        {(role === 'admin' || role === 'doctor') && (
          <button 
            className="button button-primary"
            onClick={() => navigate('/appointments/new')}
          >
            + New Appointment
          </button>
        )}
      </div>

      <div className="paper">
        <div className="flex gap-2 flex-center">
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            placeholderText="Filter by Date"
            dateFormat="MM/dd/yyyy"
            className="input"
          />
          <select 
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-container paper">
        <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.date).toLocaleString()}</td>
                <td>{appointment.patientName}</td>
                <td>{appointment.doctorName}</td>
                <td>{appointment.purpose}</td>
                <td>
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="button button-secondary"
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;
