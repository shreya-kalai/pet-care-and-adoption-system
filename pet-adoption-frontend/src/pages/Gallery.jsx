import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { imageForPet } from '../utils/images';

export default function Gallery() {
  const [pets, setPets] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/pets').then(r => setPets(r.data)).catch(console.error);
  }, []);

  const speciesList = useMemo(() => {
    const set = new Set(pets.map(p => (p.Species || 'Unknown').toLowerCase()));
    return ['all', ...Array.from(set)];
  }, [pets]);

  const view = useMemo(() => {
    return pets.filter(p => filter === 'all' || (p.Species || '').toLowerCase() === filter);
  }, [pets, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Pet Gallery</h2>
        <div className="flex flex-wrap gap-2">
          {speciesList.map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full border ${filter === s ? 'bg-pawmint border-pawmint' : 'bg-white hover:bg-pawpeach'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {view.map(p => (
          <figure key={p.PetID} className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition">
            <img alt={p.Name} src={imageForPet(p)} className="w-full h-44 object-cover" />
            <figcaption className="p-3">
              <div className="font-medium">{p.Name}</div>
              <div className="text-xs text-gray-600">{p.Species} • {p.Breed || '—'}</div>
            </figcaption>
          </figure>
        ))}
      </div>

      {view.length === 0 && (
        <div className="text-center text-gray-600">No pets found for this filter.</div>
      )}
    </div>
  );
}
