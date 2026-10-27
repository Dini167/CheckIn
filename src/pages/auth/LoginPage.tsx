import LoginForm from '../../components/auth/LoginForm';
import { Link } from 'react-router';
export default function LoginPage() {
    return (
        <div>
            <h1>התחברות</h1>
            <LoginForm />
            <p>אין לך חשבון? <Link to="/register">להרשמה</Link></p>
        </div>
    );
}


