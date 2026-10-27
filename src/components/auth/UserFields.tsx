
import type {FieldErrors, UseFormRegister} from 'react-hook-form';
import type { RegisterFormValues } from '../../types/register';
import MyInput from '../common/MyInput';
export type UserFieldsProps = {
    register:UseFormRegister<RegisterFormValues>,
    errors:FieldErrors<RegisterFormValues> 
}
export default function UserFields({ register, errors }: UserFieldsProps) { 
return(
    <>
  <MyInput label='שם מלא' type='text' placeholder='יש להזין שם מלא' {...register('name', { required: 'יש להזין שם מלא', minLength: { value: 2, message: 'שם חייב להכיל לפחות 2 תווים' }, maxLength: { value: 30, message: 'שם יכול להכיל עד 30 תווים' } })} error={errors.name?.message}></MyInput>
  <MyInput label='אימייל' type='email' placeholder='יש להזין אימייל' {...register('email', { required: 'יש להזין אימייל' ,pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'כתובת אימייל לא תקינה' } })} error={errors.email?.message}></MyInput>
    <MyInput label='סיסמה' type='password' placeholder='יש להזין סיסמה' {...register('password',
         { required: 'יש להזין סיסמה', minLength: { value: 8, message: 'סיסמה חייבת להכיל לפחות 8 תווים' }, maxLength: { value: 72, message: 'סיסמה יכולה להכיל עד 72 תווים' }, validate: value => {
            if (!/[A-Za-z]/.test(value)) return 'סיסמה חייבת להכיל לפחות אות אחת באנגלית';
            if (!/\d/.test(value)) return 'סיסמה חייבת להכיל לפחות ספרה אחת';
            return true;
         } })} error={errors.password?.message}></MyInput>
    </>
)
}

