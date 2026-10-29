
export default function DailyWorkSummary({ workedMinutes }: { workedMinutes: number }) {
return (
    <div className="summary-card">
        <h2 className="section-title">סיכום שעות עבודה</h2>
        <p>שעות עבודה: {String(Math.floor(workedMinutes / 60)).padStart(2, '0')}:{String(workedMinutes % 60).padStart(2, '0')}</p>
    </div>
);
}