/**
 * Tipos públicos de la feature `locations`.
 *
 * `locations` es el dominio dueño de ubicaciones (regiones, comunas, sucursales,
 * cobertura Chilexpress). Los modelos viven centralizados en `@/types/models`
 * porque los consumen varias features (accounts en el registro, orders en el
 * checkout, logistics al cotizar). Aquí solo se RE-EXPORTAN para dar una
 * superficie de tipos estable a quien consuma la feature, sin que tengan que
 * importar desde `@/types/models` directamente.
 */
export type {
    RegionRef,
    Region,
    ComunaRef,
    Comuna,
    ChilexpressComuna,
    RegionConComunas,
    Sucursal,
} from '@/types/models';
