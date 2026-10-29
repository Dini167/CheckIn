import LoginForm from '../../components/auth/LoginForm';
import { Link } from 'react-router';
export default function LoginPage() {
    return (
        <div className="auth-card">
            <h1 className="auth-title">התחברות</h1>
            <LoginForm />
            <p className="auth-switch">אין לך חשבון? <Link to="/register">להרשמה</Link></p>
        </div>
    );
}


