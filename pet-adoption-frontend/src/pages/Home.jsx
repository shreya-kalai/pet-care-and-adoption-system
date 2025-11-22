import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pawpeach to-pawsky p-8 flex flex-col md:flex-row items-center gap-8 shadow">
        <div className="absolute -top-20 -left-10 w-72 h-72 bg-pawpink/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-pawmint/40 rounded-full blur-3xl" />

        <div className="relative w-64 h-64 shrink-0">
          <img
            alt="Dog"
            className="absolute left-0 top-6 w-40 h-40 object-cover rounded-full ring-4 ring-white shadow bg-white/60"
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=400&auto=format&fit=crop"
          />
          <img
            alt="Cat"
            className="absolute right-0 top-0 w-36 h-36 object-cover rounded-3xl ring-4 ring-white shadow bg-white/60"
            src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=400&auto=format&fit=crop"
          />
          <img
            alt="Puppy"
            className="absolute left-10 bottom-0 w-36 h-36 object-cover rounded-2xl ring-4 ring-white shadow bg-white/60"
            src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=400&auto=format&fit=crop"
          />
        </div>

        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Find your new best friend</h1>
          <p className="mt-2 text-gray-700">Adopt loving cats and dogs, book grooming, and schedule vet appointments—everything in one cozy place. Made with extra cuddles.</p>
          <div className="mt-4 flex gap-3">
            <NavLink to="/pets" className="px-4 py-2 rounded bg-pawmint hover:opacity-90">Browse Pets</NavLink>
            <NavLink to="/grooming" className="px-4 py-2 rounded bg-pawpink hover:opacity-90">Grooming</NavLink>
            <NavLink to="/vet" className="px-4 py-2 rounded bg-pawsky hover:opacity-90">Vet</NavLink>
          </div>
        </div>
      </section>

      <section className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507149833265-60c372daea22?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1519052236531-89c708e64f90?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600&auto=format&fit=crop"
        ].map((src, i) => (
          <img key={i} alt="pet" src={src} className="rounded-xl shadow object-cover w-full h-52" />
        ))}
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          { title: 'Gentle Grooming', text: 'Baths, haircuts, nails – handled with love.', c: 'bg-white', img: 'https://images.unsplash.com/photo-1623157066498-39b7309b9b5a?q=80&w=600&auto=format&fit=crop' },
          { title: 'Healthy & Happy', text: 'Easy vet bookings for regular check-ups.', c: 'bg-white', img: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=600&auto=format&fit=crop' },
          { title: 'Adopt, Don\'t Shop', text: 'Give a furball a forever home today.', c: 'bg-white', img: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=600&auto=format&fit=crop' }
        ].map((f, i) => (
          <div key={i} className={`rounded-2xl shadow overflow-hidden ${f.c}`}>
            <img src={f.img} alt="feature" className="w-full h-36 object-cover" />
            <div className="p-4">
              <div className="font-semibold">{f.title}</div>
              <div className="text-sm text-gray-700">{f.text}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
