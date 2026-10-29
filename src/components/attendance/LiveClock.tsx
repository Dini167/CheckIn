import { useEffect, useState } from 'react';
export default function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="live-clock">
            {time.toLocaleTimeString("he-IL")}
            <p className="live-clock-date">{time.toLocaleDateString("he-IL")}</p>
        </div>
    );
}
