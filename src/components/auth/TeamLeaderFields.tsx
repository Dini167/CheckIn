import type { RegisterFormValues } from '../../types/register';
import type { UseFormRegister } from 'react-hook-form';
import MyInput from '../common/MyInput';
import type { FieldErrors } from 'react-hook-form';

export default function TeamLeaderFields({ register, errors }: { register: UseFormRegister<RegisterFormValues>; errors: FieldErrors<RegisterFormValues> }) {

return <div>
    <MyInput
    label="שם הצוות" type="text" placeholder='יש להזין שם צוות' {...register("teamName", { required: "יש להזין שם צוות" })} error={errors.teamName?.message}
    />
    <MyInput
    label="שכר" type="number" step="0.01" placeholder='יש להזין שכר'
    {...register("salary", { required: "יש להזין שכר", valueAsNumber: true,
        min:{ value: 0, message: "השכר השעתי לא יכול להיות קטן מ־0" },
         max: { value: 1000, message: "השכר השעתי לא יכול לעלות על 1000" } })} error={errors.salary?.message}
    /> 
</div>
}