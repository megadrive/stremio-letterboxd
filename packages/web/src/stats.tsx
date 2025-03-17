import { useState, useEffect } from "react";

// hook that updates the count every 5 seconds
function useCount() {
  const [count, setCount] = useState(0);

  const base = window.location.origin.includes(":4321")
    ? "http://localhost:3030"
    : window.location.origin;

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${base}/stats`, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=0, stale-while-revalidate=5",
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (!json) return;
          setCount(json.lists);
        })
        .catch((error) => {
          console.warn(error);
        });
    }, 500);
    return () => clearInterval(interval);
  }, [base]);

  return count;
}

export default function Stats() {
  const count = useCount();

  return (
    <div>
      <small>Serving {count} lists and counting...</small>
    </div>
  );
}
