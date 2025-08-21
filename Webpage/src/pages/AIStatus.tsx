import { useEffect, useState } from "react";

const AIStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/pyapi/ai-status");
        if (!res.ok) throw new Error("Failed to fetch ai-status");
        const data = await res.json();
        setStatus(data);
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    };
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>AI Status</h1>
      {error && <pre style={{ color: "red" }}>{error}</pre>}
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
};

export default AIStatus;
