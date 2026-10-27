import type {ComponentPropsWithRef} from 'react';
import {useId} from 'react';
export interface MyInputProps extends ComponentPropsWithRef<'input'> {
label: string,
error?: string
}

export default function MyInput({ label, error, ...rest }: MyInputProps) {
    const generatedId = useId();
    const inputId = rest.id ?? generatedId;
    return(
    <div>
        <label htmlFor={inputId}>{label}</label>
        <input {...rest} id={inputId} />
        {error && <span>{error}</span>}
    </div>
    )
}