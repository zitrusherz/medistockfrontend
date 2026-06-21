// src/features/accounts/services/mappers/workerMapper.ts
// Adapter: DTO crudo de /accounts/trabajadores/ -> modelo de dominio TrabajadorVM.
// ESTE es el único archivo que hay que tocar si la API cambia nombres de campo.

import type { Trabajador } from '../../types';
import type { UsuarioDetalle } from '@/types/models';
import type { TrabajadorVM } from '../../types/trabajador';
import { grupoToRol } from '../../roles';

/** Nombre legible: "Nombre Apellido", con fallback a username/email. */
const nombreDeUsuario = (u: UsuarioDetalle): string => {
    const full = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
    return full || u.username || u.email || 'Trabajador';
};

export const toTrabajador = (dto: Trabajador): TrabajadorVM => ({
    id: Number(dto.id),
    nombre: nombreDeUsuario(dto.usuario),
    email: dto.usuario.email ?? '',
    // El RUT puede venir a nivel trabajador o dentro del usuario; preferimos el del trabajador.
    rut: dto.rut ?? dto.usuario.rut ?? '',
    telefono: dto.telefono ?? '',
    // El rol REAL se deriva de los grupos Django del usuario (no del `cargo`).
    rol: grupoToRol(dto.usuario.grupos),
    cargo: dto.cargo ?? '',
    sucursalId: dto.sucursal != null ? Number(dto.sucursal) : null,
    // `activo` del trabajador manda; si no viniera, caemos a is_active del usuario.
    activo: dto.activo ?? dto.usuario.is_active ?? true,
    fechaIngreso: dto.usuario.date_joined ?? null,
});
