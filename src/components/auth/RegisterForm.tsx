import { useForm } from "react-hook-form";
import UserFields from './UserFields';
import TeamLeaderFields from './TeamLeaderFields';
import type { RegisterFormValues } from '../../types/register';
import EmployeeFields from "./EmployeeFields";
import { registerUser } from '../../api/authApi';
import { ApiError } from '../../api/ApiError';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from "../../utils/getHomePath";


export default function RegisterForm() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setError, register, handleSubmit, watch, formState: { errors } }
        = useForm<RegisterFormValues>({
            shouldUnregister: true, defaultValues:
                { name: "", email: "", password: "", role: "", teamName: "", joinCode: "" }
        });
    const selectedRole = watch("role");
    async function submitRegister(data: RegisterFormValues) {
        try {
            const res = await registerUser(data);
            login(res);
            const defaultPath = getHomePath(res.user, res.token);
            navigate(defaultPath);
        } catch (error) {
            if (error instanceof ApiError) {
                error.details?.forEach((detail) => {
                    setError(detail.field as keyof RegisterFormValues,
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
        <form onSubmit={handleSubmit((data) => submitRegister(data))}>
            {errors.role && <span className="invalid-feedback d-block">{errors.role?.message}</span>}
            <select className="form-select mb-3" {...register("role", { required: "יש לבחור תפקיד" })}>
                <option value="">בחר תפקיד</option>
                <option value="EMPLOYEE">עובד</option>
                <option value="TEAM_LEADER">ראש צוות</option>
            </select>
            <UserFields register={register} errors={errors} />
            {selectedRole === "TEAM_LEADER" && <TeamLeaderFields register={register} errors={errors} />}
            {selectedRole === "EMPLOYEE" && <EmployeeFields register={register} errors={errors} />}
            {errors.root && <span className="alert alert-danger d-block py-2">{errors.root.message}</span>}
            <button className="btn btn-primary w-100" type="submit">הרשמה</button>
        </form>
    )
}

