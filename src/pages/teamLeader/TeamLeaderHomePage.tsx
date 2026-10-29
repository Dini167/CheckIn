import LiveClock from '../../components/attendance/LiveClock';
import MyAttendance from '../../components/attendance/MyAttendance';

export default function TeamLeaderHomePage() {
    return (
        <div className="page">
            <h1 className="page-title">דף הבית - ראש צוות</h1>
            <LiveClock></LiveClock>
            <MyAttendance />
        </div>
    );
}





