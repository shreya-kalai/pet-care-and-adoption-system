import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { imageForPet } from '../utils/images';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState({ Name: '', Breed: '', Species: '', Age: '', HealthStatus: '', VaccinationStatus: '' });

  useEffect(() => {
    api.get('/pets').then(r => setPets(r.data)).catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/pets', form);
    const { data } = await api.get('/pets');
    setPets(data);
    setForm({ Name: '', Breed: '', Species: '', Age: '', HealthStatus: '', VaccinationStatus: '' });
  };

  const imageFor = useMemo(() => (pet) => imageForPet(pet), []);

  const adopt = async (id) => {
    // optimistic update
    let prevPets;
    setPets((current) => {
      prevPets = current;
      return current.map((p) => (p.PetID === id ? { ...p, HealthStatus: 'Adopted' } : p));
    });
    try {
      await api.post(`/pets/${id}/adopt`, {});
    } catch (e) {
      if (e?.response?.status === 409) {
        // already adopted on server; keep optimistic state
        return;
      }
      console.error(e);
      // rollback
      setPets(prevPets);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Available Pets</h2>
        <div className="text-sm text-gray-600">Cute photos from Unsplash</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pets.map((p) => (
          <div key={p.PetID} className="bg-white rounded-2xl shadow overflow-hidden">
            <img alt={p.Name} src={imageFor(p)} className="w-full h-44 object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{p.Name}</div>
                <span className="text-xs px-2 py-0.5 rounded bg-pawmint">{p.HealthStatus === 'Adopted' ? 'Adopted' : 'Available'}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{p.Species} • {p.Breed || '—'} • {typeof p.Age === 'number' ? `${p.Age} yrs` : p.Age || ''}</div>
              <button onClick={() => adopt(p.PetID)} disabled={p.HealthStatus === 'Adopted'} className="mt-3 w-full bg-pawpink hover:opacity-90 rounded py-2 disabled:opacity-60 disabled:cursor-not-allowed">{p.HealthStatus === 'Adopted' ? 'Adopted' : 'Adopt'}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold mb-2">Add a Pet</h3>
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
          {Object.keys(form).map((k) => (
            <input key={k} className="border rounded px-3 py-2" placeholder={k} value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <button className="bg-pawmint px-4 py-2 rounded">Save</button>
        </form>
      </div>
    </div>
  );
}
