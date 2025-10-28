<?php

namespace App\Http\Requests\Transaccion;

use Illuminate\Foundation\Http\FormRequest;

class CerrarCajaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'caja_transaccion_id' => 'required|exists:trx__cajas,id',
            'monto_final_real' => 'required|numeric|min:0',
            'supervisor_id' => 'nullable|exists:users,id',
            'clave_diaria' => 'nullable|string|max:50',
            'justificacion' => 'nullable|string|max:500',
            'observaciones' => 'nullable|string|max:500',
        ];
    }
}