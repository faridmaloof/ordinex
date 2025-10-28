<?php

namespace App\Http\Requests\Catalogo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
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
        $itemId = $this->route('item')->id;

        return [
            'codigo' => ['required', 'string', 'max:50', Rule::unique('cat__items', 'codigo')->ignore($itemId)],
            'nombre' => 'required|string|max:200',
            'descripcion' => 'nullable|string|max:1000',
            'categoria_id' => 'required|exists:cat__categorias_items,id',
            'tipo' => 'required|in:producto,servicio,insumo',
            'unidad_medida' => 'required|string|max:20',
            'precio_venta' => 'required|numeric|min:0',
            'precio_costo' => 'nullable|numeric|min:0',
            'aplica_iva' => 'boolean',
            'porcentaje_iva' => 'nullable|numeric|min:0|max:100',
            'maneja_inventario' => 'boolean',
            'stock_minimo' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ];
    }
}