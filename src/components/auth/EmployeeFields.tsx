import type { RegisterFormValues } from '../../types/register';
import type { UseFormRegister } from 'react-hook-form';
import MyInput from '../common/MyInput';
import type { FieldErrors } from 'react-hook-form';
export default function EmployeeFields({ register, errors }: { register: UseFormRegister<RegisterFormValues>; errors: FieldErrors<RegisterFormValues> }) {
    return <div>
        <MyInput label="קוד הצטרפות" type="text" placeholder='יש להזין קוד הצטרפות' {...register("joinCode", { required: "יש להזין קוד הצטרפות" })} error={errors.joinCode?.message} />
    </div>
}