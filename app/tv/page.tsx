// app/tv/page.tsx
export const revalidate = 10; // Auto-refresh data tiap 10 detik di server

async function getBoardData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/board-content`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function TvDisplayPage() {
  const data = await getBoardData();

  return (
    <html lang="id">
      <head>
        <title>Info Board PT Tri Cipta Teknindo - TV Samsung Tizen Browser Mode</title>
        {/* Auto refresh halaman setiap 60 detik agar data selalu paling baru */}
        <meta http-equiv="refresh" content="60" />
        <style>{`
          body { background-color: #0f172a; color: white; font-family: sans-serif; margin: 0; padding: 20px; }
          .container { display: flex; flex-direction: column; gap: 20px; }
          .card { background: #1e293b; border-radius: 8px; padding: 15px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .media { max-width: 100%; height: auto; border-radius: 4px; }
          /* Tag marquee murni native HTML, sangat lancar di Tizen 2014 */
          marquee { font-size: 20px; color: #38bdf8; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="card">
            <marquee behavior="scroll" direction="left" scrollamount="3">
              📢 WELCOME TO PT TRI CIPTA TEKNINDO - REAL-TIME DISPLAY SYSTEM
            </marquee>
          </div>

          {data.map((item: any) => (
            <div key={item.id} className="card">
              <div className="title">{item.title}</div>
              {item.file_url && (
                <img src={item.file_url} alt={item.title} className="media" />
              )}
            </div>
          ))}
        </div>
      </body>
    </html>
  );
}