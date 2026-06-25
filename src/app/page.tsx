export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'linear-gradient(135deg, #F5A623, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold', color: '#0B0B0F', marginBottom: '2rem' }}>A</div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #F5A623, #E94560)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Atlas AI Studio</h1>
      <p style={{ fontSize: '1.2rem', color: '#9A9AA5', marginBottom: '0.5rem' }}>Africa's Most Majestic AI Generation Studio</p>
      <p style={{ fontSize: '0.9rem', color: '#6E6E78', marginBottom: '2rem' }}>Owned by Ng'ang'a Makumi</p>
      <div style={{ padding: '0.75rem 1.5rem', background: '#F5A623', color: '#0B0B0F', borderRadius: '8px', fontWeight: 'bold' }}>✨ Full version loading... 🚀</div>
      <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#6E6E78' }}>Kenya · Nigeria · USA · East Africa</p>
    </main>
  );
}
