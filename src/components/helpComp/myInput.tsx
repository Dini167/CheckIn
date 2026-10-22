import React, { Children } from "react"
import { Control, FieldError } from "react-hook-form"
import { Controller } from "react-hook-form"
interface makeInput{
    name:string,
    type:string,
    control:Control<any>,
    label?:string,
    error:FieldError,
    placeholder?:string,
    component?: React.ReactNode
    pattern?:string,
    patternMessage?:string,
    required?:boolean,
    minLength?:number,
    maxLength?:number,
    rows?:number
}

export default function myInput({name, type, control}: makeInput){
    return(

        <>
        </>
    )
}

