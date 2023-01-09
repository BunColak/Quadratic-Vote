import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Textarea } from '@chakra-ui/react'
import React from 'react'

type TextFieldProps = {
    label: string
    name: string
    multiline?: boolean
    helperText?: string
    error?: string
    type?: React.HTMLInputTypeAttribute
    attr?: React.InputHTMLAttributes<HTMLInputElement>
    defaultValue?: string | number | null
}

export const TextField: React.FC<TextFieldProps> = ({ error, defaultValue, multiline, helperText, label, name, type = 'text', attr }) => {
    return (
        <FormControl isInvalid={!!error} isRequired={attr?.required} mt={6}>
            <FormLabel>
                {label}
            </FormLabel>
            {multiline
                ?
                <Textarea name={name} defaultValue={defaultValue || undefined} />
                :
                <Input type={type} name={name} {...attr} defaultValue={defaultValue || undefined} size="md" />
            }
            {error ? <FormErrorMessage>
                {error}
            </FormErrorMessage>
                :
                <FormHelperText>
                    {helperText}
                </FormHelperText>}
        </FormControl>
    )
}

