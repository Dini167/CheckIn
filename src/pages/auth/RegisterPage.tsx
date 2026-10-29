import RegisterForm from '../../components/auth/RegisterForm';
import { Link } from 'react-router';

export default function RegisterPage() {
    return (
        <div className="auth-card">
            <h1 className="auth-title">הרשמה</h1>
            <RegisterForm />
            <p className="auth-switch">כבר יש לך חשבון? <Link to="/login">להתחברות</Link></p>
        </div>
    );
}
