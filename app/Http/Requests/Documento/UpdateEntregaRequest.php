<?php

namespace App\Http\Requests\Documento;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEntregaRequest extends FormRequest
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
        $entrega = $this->route('entrega');

        return [
            'estado' => [
                'required',
                'string',
                Rule::in(['pendiente_pago', 'pagada', 'lista_entrega', 'entregada', 'anulada']),
                function ($attribute, $value, $fail) use ($entrega) {
                    if ($value === 'entregada' && $entrega->saldo_pendiente > 0) {
                        $fail('No se puede marcar como entregada una orden con saldo pendiente.');
                    }
                },
            ],
            'usuario_entrega_id' => 'nullable|exists:users,id',
            'observaciones' => 'nullable|string|max:65535',
        ];
    }
}