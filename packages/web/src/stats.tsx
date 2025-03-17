import { useState, useEffect } from "react";

// hook that updates the count every 5 seconds
function useCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/stats", {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=0, stale-while-revalidate=5",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json) return;
        setCount(json);
      })
      .catch((error) => {
        console.warn(error);
      });
  }, []);

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
