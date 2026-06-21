// src/utils/image.ts
// Utilidades para validar y previsualizar imágenes en el navegador.
//
// Regla central: NO confiar en la extensión ni solo en `file.type` (ambos
// se deducen del nombre y son falsificables). Verificamos el CONTENIDO real
// del archivo (magic bytes) y, además, confirmamos que el navegador puede
// decodificarlo como imagen.

export type ImageType = 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | 'avif';

export interface ImageValidationOptions {
    /** Tamaño máximo en bytes. Por defecto 5 MB. */
    maxBytes?: number;
    /** Tipos permitidos. Por defecto: jpeg, png, webp. */
    allowed?: ImageType[];
}

export interface ImageValidationResult {
    ok: boolean;
    /** Tipo detectado por contenido (no por extensión). */
    detectedType: ImageType | null;
    /** Mensaje listo para mostrar al usuario cuando ok === false. */
    error?: string;
}

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
// Nota de seguridad: NO incluimos SVG por defecto. Un SVG es XML y puede
// contener <script>, lo que abre la puerta a XSS si se renderiza inline.
const DEFAULT_ALLOWED: ImageType[] = ['jpeg', 'png', 'webp'];

/**
 * Compara los bytes leídos contra una firma.
 * `undefined` en la firma actúa como comodín (cualquier byte sirve).
 */
function matches(
    bytes: Uint8Array,
    signature: (number | undefined)[],
    offset = 0,
): boolean {
    return signature.every((b, i) => b === undefined || bytes[offset + i] === b);
}

/**
 * Lee los primeros bytes del archivo y deduce el tipo REAL de imagen a
 * partir de su "magic number". Devuelve null si no reconoce ninguna firma.
 */
export async function sniffImageType(file: Blob): Promise<ImageType | null> {
    // Con 16 bytes alcanza para todas las firmas que comprobamos.
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());

    // JPEG -> FF D8 FF
    if (matches(header, [0xff, 0xd8, 0xff])) return 'jpeg';

    // PNG -> 89 50 4E 47 0D 0A 1A 0A
    if (matches(header, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return 'png';
    }

    // GIF -> "GIF8" (47 49 46 38)
    if (matches(header, [0x47, 0x49, 0x46, 0x38])) return 'gif';

    // BMP -> "BM" (42 4D)
    if (matches(header, [0x42, 0x4d])) return 'bmp';

    // WEBP -> "RIFF" (52 49 46 46) en offset 0 y "WEBP" (57 45 42 50) en offset 8
    if (
        matches(header, [0x52, 0x49, 0x46, 0x46]) &&
        matches(header, [0x57, 0x45, 0x42, 0x50], 8)
    ) {
        return 'webp';
    }

    // AVIF -> "ftyp" (66 74 79 70) en offset 4 y marca "avif"/"avis" en offset 8
    if (
        matches(header, [0x66, 0x74, 0x79, 0x70], 4) &&
        (matches(header, [0x61, 0x76, 0x69, 0x66], 8) ||
            matches(header, [0x61, 0x76, 0x69, 0x73], 8))
    ) {
        return 'avif';
    }

    return null;
}

/**
 * Confirma que el archivo es realmente una imagen decodificable por el
 * navegador. `sniffImageType` valida la firma; esto valida que los bytes
 * formen una imagen completa (no un archivo truncado o corrupto con una
 * cabecera falsificada).
 */
export async function canDecode(file: Blob): Promise<boolean> {
    try {
        const bitmap = await createImageBitmap(file);
        bitmap.close(); // liberar memoria
        return true;
    } catch {
        return false;
    }
}

/**
 * Validación completa de un archivo subido. Comprueba, en orden:
 * 1) que sea un File no vacío, 2) tamaño, 3) tipo por CONTENIDO,
 * 4) que el tipo esté permitido, 5) que el navegador pueda decodificarlo.
 *
 * Devuelve un resultado con `error` listo para mostrar (encaja con M12).
 */
export async function validateImage(
    file: File,
    options: ImageValidationOptions = {},
): Promise<ImageValidationResult> {
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    const allowed = options.allowed ?? DEFAULT_ALLOWED;

    if (!(file instanceof File) || file.size === 0) {
        return {
            ok: false,
            detectedType: null,
            error: 'El archivo está vacío o no es válido.',
        };
    }

    if (file.size > maxBytes) {
        const mb = (maxBytes / (1024 * 1024)).toFixed(0);
        return {
            ok: false,
            detectedType: null,
            error: `La imagen supera el máximo de ${mb} MB.`,
        };
    }

    // El chequeo clave: tipo deducido del contenido, no de la extensión.
    const detectedType = await sniffImageType(file);
    if (!detectedType) {
        return {
            ok: false,
            detectedType: null,
            error:
                'El archivo no es una imagen reconocida (su contenido no coincide ' +
                'con ningún formato válido).',
        };
    }

    if (!allowed.includes(detectedType)) {
        return {
            ok: false,
            detectedType,
            error: `Formato ${detectedType.toUpperCase()} no permitido. Usa: ${allowed
                .join(', ')
                .toUpperCase()}.`,
        };
    }

    if (!(await canDecode(file))) {
        return {
            ok: false,
            detectedType,
            error: 'La imagen parece estar dañada o incompleta.',
        };
    }

    return { ok: true, detectedType };
}

export interface ThumbOptions {
    /** Lado máximo (ancho o alto) del thumbnail en px. Por defecto 320. */
    maxSize?: number;
    /** Calidad 0..1 para JPEG/WEBP. Por defecto 0.8. */
    quality?: number;
    /** Tipo de salida. Por defecto 'image/webp'. */
    mime?: 'image/webp' | 'image/jpeg' | 'image/png';
}

/**
 * Genera una miniatura redimensionada (data URL) para previsualizar antes de
 * subir, manteniendo la proporción y sin agrandar imágenes pequeñas.
 *
 * NO valida: pásale un archivo que ya haya pasado por `validateImage`.
 */
export async function fileToThumb(
    file: Blob,
    options: ThumbOptions = {},
): Promise<string> {
    const maxSize = options.maxSize ?? 320;
    const quality = options.quality ?? 0.8;
    const mime = options.mime ?? 'image/webp';

    const bitmap = await createImageBitmap(file);

    // scale <= 1: nunca escalamos hacia arriba.
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        bitmap.close();
        throw new Error('No se pudo crear el contexto de canvas.');
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    return canvas.toDataURL(mime, quality);
}