<?php

namespace App\Http\Controllers\Catalogo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalogo\StoreFormaPagoRequest;
use App\Http\Requests\Catalogo\UpdateFormaPagoRequest;
use App\Models\Catalogo\FormaPago;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormaPagoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = FormaPago::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('nombre', 'like', "%{$search}%")
                ->orWhere('codigo', 'like', "%{$search}%");
        }

        $formasPago = $query->orderBy('orden')->paginate(15)->withQueryString();

        return Inertia::render('Catalogo/FormasPago/Index', [
            'formasPago' => $formasPago,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Catalogo/FormasPago/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFormaPagoRequest $request): RedirectResponse
    {
        FormaPago::create($request->validated());
        return redirect()->route('formas-pago.index')->with('success', 'Forma de pago creada con éxito.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FormaPago $formaPago): Response
    {
        return Inertia::render('Catalogo/FormasPago/Edit', [
            'formaPago' => $formaPago,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFormaPagoRequest $request, FormaPago $formaPago): RedirectResponse
    {
        $formaPago->update($request->validated());
        return redirect()->route('formas-pago.index')->with('success', 'Forma de pago actualizada con éxito.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FormaPago $formaPago): RedirectResponse
    {
        $formaPago->delete();
        return redirect()->route('formas-pago.index')->with('success', 'Forma de pago eliminada con éxito.');
    }
}