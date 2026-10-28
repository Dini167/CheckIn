import LiveClock from '../../components/attendance/LiveClock';
import MyAttendance from '../../components/attendance/MyAttendance';

export default function TeamLeaderHomePage() {
    return (
        <div>
            <h1>דף הבית - ראש צוות</h1>
            <LiveClock></LiveClock>
            <MyAttendance />
        </div>
    );
}





