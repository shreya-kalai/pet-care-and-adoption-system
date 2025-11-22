import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

export default function Grooming() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ UserID: '', PetID: '', ServiceID: '', StaffID: '', Date: '', Notes: '' });
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');
  const [quotedPrice, setQuotedPrice] = useState(null);
  const [lastBill, setLastBill] = useState(null); // { serviceType, price }

  const refresh = async () => {
    const results = await Promise.allSettled([
      api.get('/grooming/services'),
      api.get('/grooming/bookings'),
      api.get('/users'),
      api.get('/pets'),
      api.get('/staff')
    ]);
    const pick = (idx, fallback=[]) => results[idx].status === 'fulfilled' ? results[idx].value.data : fallback;
    setServices(pick(0));
    setBookings(pick(1));
    setUsers(pick(2));
    setPets(pick(3));
    setStaff(pick(4));
  };

  useEffect(() => { refresh(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.UserID || !form.PetID || !form.ServiceID || !form.StaffID || !form.Date) {
      setError('Please fill User, Pet, Service, Staff and Date.');
      return;
    }
    try {
      const { data } = await api.post('/grooming/bookings', form);
      await refresh();
      const bookedService = services.find(s => String(s.ServiceID) === String(form.ServiceID));
      setLastBill({ serviceType: bookedService?.ServiceType || '-', price: data?.price ?? quotedPrice });
      setForm({ UserID: '', PetID: '', ServiceID: '', StaffID: '', Date: '', Notes: '' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create booking';
      setError(msg);
    }
  };

  useEffect(() => {
    const fetchPrice = async () => {
      const sid = form.ServiceID;
      if (!sid) { setQuotedPrice(null); return; }
      try {
        const { data } = await api.get(`/grooming/services/${sid}/price`);
        setQuotedPrice(data?.price ?? null);
      } catch (e) {
        setQuotedPrice(null);
      }
    };
    fetchPrice();
  }, [form.ServiceID]);

  const imgForService = useMemo(() => {
    const map = [
      { k: 'bath', url: 'https://images.unsplash.com/photo-1601758064134-88d06fbe3afa?q=80&w=600&auto=format&fit=crop' },
      { k: 'hair', url: 'https://images.unsplash.com/photo-1623157066498-39b7309b9b5a?q=80&w=600&auto=format&fit=crop' },
      { k: 'nail', url: 'https://images.unsplash.com/photo-1583512603691-1b6fd3b1aef2?q=80&w=600&auto=format&fit=crop' },
      { k: 'ear', url: 'https://images.unsplash.com/photo-1525253013412-55c1a69a5738?q=80&w=600&auto=format&fit=crop' },
      { k: 'spa', url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=600&auto=format&fit=crop' },
    ];
    return (name) => {
      const key = (name || '').toLowerCase();
      const found = map.find(m => key.includes(m.k));
      return (found ? found.url : 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop');
    };
  }, []);

  const defaultServices = [
    { ServiceID: -1, ServiceType: 'Full Grooming (Bath & Haircut)', Price: 1500.00, Notes: 'Includes nail trim and ear clean', img: 'https://images.unsplash.com/photo-1623157066498-39b7309b9b5a?q=80&w=800&auto=format&fit=crop' },
    { ServiceID: -2, ServiceType: 'Basic Bath', Price: 700.00, Notes: 'Shampoo + conditioning', img: 'https://images.unsplash.com/photo-1601758064134-88d06fbe3afa?q=80&w=800&auto=format&fit=crop' },
    { ServiceID: -3, ServiceType: 'Pawdicure (Nail Trim)', Price: 500.00, Notes: 'Quick and gentle', img: 'https://images.unsplash.com/photo-1583512603691-1b6fd3b1aef2?q=80&w=800&auto=format&fit=crop' },
    { ServiceID: -4, ServiceType: 'Ear Cleaning', Price: 450.00, Notes: 'Keep ears fresh', img: 'https://images.unsplash.com/photo-1525253013412-55c1a69a5738?q=80&w=800&auto=format&fit=crop' },
    { ServiceID: -5, ServiceType: 'Spa & De-shedding', Price: 1200.00, Notes: 'Relax & de-shed', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=800&auto=format&fit=crop' }
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl overflow-hidden">
        <img alt="grooming hero" className="w-full h-48 object-cover" src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop" />
      </div>

      <h2 className="text-2xl font-semibold">Grooming Services</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(services.length ? services : defaultServices).map(s => (
          <div key={s.ServiceID} className="bg-white rounded-xl shadow overflow-hidden">
            <img src={s.img || imgForService(s.ServiceType)} alt={s.ServiceType} className="w-full h-36 object-cover" />
            <div className="p-4">
              <div className="font-semibold">{s.ServiceType}</div>
              <div className="text-sm text-gray-600">₹{s.Price}</div>
              {s.Notes && <div className="text-sm mt-1">{s.Notes}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold mb-2">Book a Service</h3>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
          <select className="border rounded px-3 py-2" value={form.UserID} onChange={(e)=>setForm({...form, UserID: e.target.value})}>
            <option value="">Select User</option>
            {users.map(u => <option key={u.UserID} value={u.UserID}>{u.Name} (#{u.UserID})</option>)}
          </select>

          <select className="border rounded px-3 py-2" value={form.PetID} onChange={(e)=>setForm({...form, PetID: e.target.value})}>
            <option value="">Select Pet</option>
            {pets.map(p => <option key={p.PetID} value={p.PetID}>{p.Name} (#{p.PetID})</option>)}
          </select>

          <select className="border rounded px-3 py-2" value={form.ServiceID} onChange={(e)=>setForm({...form, ServiceID: e.target.value})}>
            <option value="">Select Service</option>
            {services.map(s => <option key={s.ServiceID} value={s.ServiceID}>{s.ServiceType} - ₹{s.Price}</option>)}
          </select>

          <select className="border rounded px-3 py-2" value={form.StaffID} onChange={(e)=>setForm({...form, StaffID: e.target.value})}>
            <option value="">Select Staff</option>
            {staff.map(s => <option key={s.StaffID} value={s.StaffID}>{s.Name} • {s.Role}</option>)}
          </select>

          <input className="border rounded px-3 py-2" type="datetime-local" value={form.Date} onChange={(e)=>setForm({...form, Date: e.target.value.replace('T',' ') + ':00'})} />
          <input className="border rounded px-3 py-2" placeholder="Notes (optional)" value={form.Notes} onChange={(e)=>setForm({...form, Notes: e.target.value})} />
          <button className="bg-pawpink px-4 py-2 rounded">Book</button>
        </form>
        <div className="mt-4 p-3 border rounded bg-pawpeach/40">
          <div className="font-semibold">Bill</div>
          <div className="text-sm text-gray-700 mt-1">Service: {lastBill?.serviceType || services.find(s=>String(s.ServiceID)===String(form.ServiceID))?.ServiceType || '-'}</div>
          <div className="text-sm">Price: {
            lastBill?.price != null
              ? `₹${lastBill.price}`
              : (quotedPrice != null
                  ? `₹${quotedPrice}`
                  : (services.find(s=>String(s.ServiceID)===String(form.ServiceID))?.Price != null
                      ? `₹${services.find(s=>String(s.ServiceID)===String(form.ServiceID))?.Price}`
                      : (form.ServiceID ? 'Fetching…' : '-')))
          }</div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold mb-2">Recent Bookings</h3>
        <div className="space-y-2">
          {bookings.map(b => (
            <div key={b.BookingID} className="p-3 border rounded flex items-center gap-3">
              <img alt="pet" className="w-12 h-12 object-cover rounded-full" src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=200&auto=format&fit=crop" />
              <div>
                <div className="font-medium">{b.ServiceType} • {b.PetName}</div>
                <div className="text-sm text-gray-600">By {b.UserName} with {b.StaffName} on {new Date(b.Date).toLocaleString()}</div>
                {b.Notes && <div className="text-sm">Notes: {b.Notes}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          'https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1558944351-045b4c2f4d4a?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?q=80&w=600&auto=format&fit=crop'
        ].map((src, i) => (
          <img key={i} alt="happy pet" src={src} className="rounded-xl shadow object-cover w-full h-40" />
        ))}
      </div>
    </div>
  );
}
