<?php

namespace App\Http\Requests\Catalogo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFormaPagoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated user can update a payment method for now.
        // You might want to add specific authorization logic here.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $formaPagoId = $this->route('forma_pago')->id;

        return [
            'codigo' => ['required', 'string', 'max:20', Rule::unique('cat_formas_pago', 'codigo')->ignore($formaPagoId)],
            'nombre' => 'required|string|max:100',
            'tipo' => ['required', 'string', Rule::in(['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'cheque', 'otro'])],
            'requiere_referencia' => 'required|boolean',
            'afecta_caja' => 'required|boolean',
            'orden' => 'nullable|integer',
            'activo' => 'required|boolean',
        ];
    }
}