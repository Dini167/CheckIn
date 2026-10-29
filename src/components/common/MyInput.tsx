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
    <div className="mb-3">
        <label className="form-label" htmlFor={inputId}>{label}</label>
        <input className="form-control" {...rest} id={inputId} />
        {error && <span className="invalid-feedback d-block">{error}</span>}
    </div>
    )
}