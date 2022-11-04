import React from 'react'

type TextFieldProps = {
    label: string
    name: string
    multiline?: boolean
    error?: string
    type?: React.HTMLInputTypeAttribute
    attr?: React.InputHTMLAttributes<HTMLInputElement>
    defaultValue?: string | number | null
}

export const TextField: React.FC<TextFieldProps> = ({ error, defaultValue,  multiline, label, name, type = 'text', attr }) => {
    return (
        <div className="form-control">
            <label htmlFor={name} className="label">
                {label}
            </label>
            {multiline
                ?
                <textarea className="input" name={name} defaultValue={defaultValue || undefined} />
                :
                <input className="input" type={type} name={name} {...attr} defaultValue={defaultValue || undefined}/>
            }
            <p
                className="mt-0 text-red-500 label label-text-alt"
                hidden={!error}
            >
                {error}
            </p>
        </div>
    )
}

