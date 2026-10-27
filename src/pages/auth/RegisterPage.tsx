import RegisterForm from '../../components/auth/RegisterForm';
import { Link } from 'react-router';

export default function RegisterPage() {
    return (
        <div>
            <h1>הרשמה</h1>
            <RegisterForm />
            <p>כבר יש לך חשבון? <Link to="/login">להתחברות</Link></p>
        </div>
    );
}
