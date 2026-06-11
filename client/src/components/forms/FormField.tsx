import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { ControllerRenderProps, FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

interface TextFormFieldProps<T extends FieldValues> {
  control: UseFormReturn<T>['control']
  name: FieldPath<T>
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
}

function PasswordInput<T extends FieldValues>({
  field,
  placeholder,
  autoComplete,
}: {
  field: ControllerRenderProps<T, FieldPath<T>>
  placeholder?: string
  autoComplete?: string
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...field}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function TextFormField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
}: TextFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === 'password' ? (
              <PasswordInput
                field={field}
                placeholder={placeholder}
                autoComplete={autoComplete}
              />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
