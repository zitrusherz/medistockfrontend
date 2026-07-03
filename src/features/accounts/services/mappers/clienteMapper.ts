

import type { Cliente, ClienteDTO, TipoInstitucion } from '../../types/cliente';
import { TIPO_INSTITUCION_LABEL } from '../../types/cliente';

const TIPOS_INSTITUCION_VALIDOS = new Set(Object.keys(TIPO_INSTITUCION_LABEL));

/** Construye un nombre legible según el tipo de cliente. */
const nombreDeDTO = (dto: ClienteDTO): string => {
    if (dto.institucion?.razon_social) return dto.institucion.razon_social;
    const full = `${dto.usuario?.first_name ?? ''} ${dto.usuario?.last_name ?? ''}`.trim();
    return full || dto.usuario?.email || dto.usuario?.username || `Cliente ${dto.id}`;
};

/**
 * "Particular" para clientes B2C. Para institucionales: el subtipo (Hospital,
 * Clínica...) SOLO si el backend lo envía Y es uno de los valores conocidos;
 * si viene null (caso real confirmado) o algo fuera de la whitelist, cae al
 * genérico "Institución".
 */
const tipoLabelDeDTO = (dto: ClienteDTO): string => {
    if (dto.tipo_cliente !== 'INSTITUCIONAL') return 'Particular';
    const tipo = dto.institucion?.tipo_institucion;
    if (tipo && TIPOS_INSTITUCION_VALIDOS.has(tipo)) {
        return TIPO_INSTITUCION_LABEL[tipo as TipoInstitucion];
    }
    return 'Institución';
};

/**
 * Comuna de la dirección principal del cliente. Si ninguna dirección está
 * marcada `es_principal`, usa la primera. "—" si no tiene direcciones.
 */
const comunaDeDTO = (dto: ClienteDTO): string => {
    const direcciones = dto.direcciones ?? [];
    const principal = direcciones.find((d) => d.es_principal) ?? direcciones[0];
    return principal?.comuna_detalle?.nombre ?? '—';
};

export const toCliente = (dto: ClienteDTO): Cliente => ({
    id: dto.id,
    tipo: dto.tipo_cliente,
    nombre: nombreDeDTO(dto),
    tipoLabel: tipoLabelDeDTO(dto),
    rut: dto.rut ?? dto.institucion?.rut_empresa ?? '',
    email: dto.usuario?.email ?? '',
    telefono: dto.telefono ?? '',
    comuna: comunaDeDTO(dto),
    cupoCredito: dto.cupo_credito ?? null,
    creditoUsado: dto.credito_utilizado ?? null,
    activo: dto.activo ?? true,
    fechaRegistro: dto.fecha_registro ?? dto.usuario?.date_joined ?? null,
});