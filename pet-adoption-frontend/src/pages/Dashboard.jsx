import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: us } = await api.get('/users');
        setUsers(us);
        if (us?.length) setUserId(String(us[0].UserID));
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}/adoptions/count`);
        setCount(data?.count || 0);
      } catch (e) {
        setCount(0);
      }
    };
    fetchCount();
  }, [userId]);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-xl shadow bg-pawpeach`}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">Adoptions</div>
            <select className="text-sm border rounded px-2 py-1 bg-white" value={userId} onChange={(e)=>setUserId(e.target.value)}>
              {users.map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}
            </select>
          </div>
          <div className="text-3xl mt-2">{count}</div>
          <div className="text-sm text-gray-700 mt-1">total adopted pets</div>
        </div>
        <div className={`p-6 rounded-xl shadow bg-pawmint`}>
          <div className="font-semibold">Bookings</div>
          <div className="text-sm text-gray-700 mt-2">See Grooming page for details.</div>
        </div>
        <div className={`p-6 rounded-xl shadow bg-pawsky`}>
          <div className="font-semibold">Appointments</div>
          <div className="text-sm text-gray-700 mt-2">Coming soon.</div>
        </div>
      </div>
    </div>
  );
}
