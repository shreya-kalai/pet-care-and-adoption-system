import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Vet() {
  const [vets, setVets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ PetID: '', VetID: '', AppointmentDateTime: '', Notes: '' });

  const refresh = async () => {
    const [v, a] = await Promise.all([
      api.get('/vets'),
      api.get('/appointments')
    ]);
    setVets(v.data);
    setAppointments(a.data);
  };

  useEffect(() => { refresh(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/appointments', form);
    await refresh();
    setForm({ PetID: '', VetID: '', AppointmentDateTime: '', Notes: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Vets & Appointments</h2>

      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold mb-2">Book an Appointment</h3>
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
          {Object.keys(form).map((k) => (
            <input key={k} className="border rounded px-3 py-2" placeholder={k} value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <button className="bg-pawsky px-4 py-2 rounded">Create</button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold mb-2">Vets</h3>
          <ul className="space-y-2">
            {vets.map((v) => (
              <li key={v.VetID} className="p-3 border rounded">
                <div className="font-medium">{v.Name}</div>
                <div className="text-sm text-gray-600">{v.Location} • {v.Contact}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold mb-2">Upcoming Appointments</h3>
          <ul className="space-y-2">
            {appointments.map((a) => (
              <li key={a.AppointmentID} className="p-3 border rounded">
                <div className="font-medium">{a.PetName} with {a.VetName}</div>
                <div className="text-sm text-gray-600">{new Date(a.AppointmentDateTime).toLocaleString()}</div>
                {a.Notes && <div className="text-sm">Notes: {a.Notes}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
