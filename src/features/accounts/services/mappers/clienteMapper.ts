// features/accounts/services/mappers/clienteMapper.ts
// Adapter: DTO crudo de /accounts/clientes/ -> modelo de dominio Cliente.
// ESTE es el único archivo que hay que tocar si la API cambia nombres de campo.

import type { Cliente, ClienteDTO } from '../../types/cliente';

/** Construye un nombre legible según el tipo de cliente. */
const nombreDeDTO = (dto: ClienteDTO): string => {
    if (dto.razon_social) return dto.razon_social;
    const full = `${dto.nombre ?? ''} ${dto.apellido ?? ''}`.trim();
    return full || dto.email || `Cliente ${dto.id}`;
};

export const toCliente = (dto: ClienteDTO): Cliente => ({
    id: dto.id,
    tipo: dto.tipo_cliente,
    nombre: nombreDeDTO(dto),
    rut: dto.rut_empresa ?? dto.rut ?? '',
    email: dto.email ?? '',
    telefono: dto.telefono ?? '',
    cupoCredito: dto.cupo_credito ?? null,
    creditoUsado: dto.credito_utilizado ?? null,
    activo: dto.activo ?? true,
    fechaRegistro: dto.fecha_registro ?? dto.date_joined ?? null,
});
