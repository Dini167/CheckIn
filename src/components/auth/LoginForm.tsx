import { useForm } from "react-hook-form";
import type { LoginFormValues } from '../../types/login';
import MyInput from '../common/MyInput';
import { loginUser } from '../../api/authApi';
import { ApiError } from '../../api/ApiError';
import { useNavigate } from 'react-router';
import { getHomePath } from '../../utils/getHomePath';
import { useAuth } from '../../hooks/useAuth';


export default function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setError, register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
    async function submitLogin(data: LoginFormValues) {
        try {
            const res = await loginUser(data);
            login(res);
            const defaultPath = getHomePath(res.user, res.token);
            navigate(defaultPath);
        } catch (error) {
            if (error instanceof ApiError) {
                error.details?.forEach((detail) => {
                    setError(detail.field as keyof LoginFormValues,
                        { type: "server", message: detail.message });
                });
                setError("root", { type: "server", message: error.message });
            }
            else {
                setError("root", { type: "server", message: "אירעה תקלה. יש לנסות שוב." });
            }
        }
    }
    return (
        <form onSubmit={handleSubmit((data) => submitLogin(data))}>
            <MyInput label='אימייל' type='email' placeholder='יש להזין אימייל' {...register('email', { required: 'יש להזין אימייל', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'כתובת אימייל לא תקינה' } })} error={errors.email?.message}></MyInput>
            <MyInput label='סיסמה' type='password' placeholder='יש להזין סיסמה' {...register('password', { required: 'יש להזין סיסמה' })} error={errors.password?.message}></MyInput>
            {errors.root && <span>{errors.root.message}</span>}
            <button type="submit">התחברות</button>
        </form>
    );
}

