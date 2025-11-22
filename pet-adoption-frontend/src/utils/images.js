const pools = {
  dog: [
    // portrait on soft background
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop',
    // dog holding flower
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
    // scenic lake
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
    // classics
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507149833265-60c372daea22?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525253013412-55c1a69a5738?q=80&w=800&auto=format&fit=crop'
  ],
  cat: [
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519052236531-89c708e64f90?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=800&auto=format&fit=crop'
  ],
  rabbit: [
    'https://images.unsplash.com/photo-1545468241-1a5a04f2b4a2?q=80&w=800&auto=format&fit=crop'
  ],
  bird: [
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508264165352-258a6beb11f0?q=80&w=800&auto=format&fit=crop'
  ],
  hamster: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop'
  ],
  default: [
    'https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=800&auto=format&fit=crop'
  ]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function imageForSpecies(species) {
  const key = (species || '').toLowerCase();
  const pool = key.includes('cat') ? pools.cat
    : key.includes('dog') ? pools.dog
    : key.includes('rabbit') ? pools.rabbit
    : key.includes('bird') ? pools.bird
    : key.includes('hamster') ? pools.hamster
    : pools.default;
  return pick(pool);
}

export function imageForPet(pet) {
  const b = (pet?.Breed || '').toLowerCase();
  const s = (pet?.Species || '').toLowerCase();
  // Prefer breed hint first
  if (b.includes('dog') || /retriever|shepherd|labrador|pug|beagle|bulldog/.test(b)) return pick(pools.dog);
  if (b.includes('cat') || /siamese|persian|tabby|maine/.test(b)) return pick(pools.cat);
  // Fall back to species
  return imageForSpecies(s);
}
