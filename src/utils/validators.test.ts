// Ruta destino: src/utils/validators.test.ts
import { describe, it, expect } from 'vitest'
import {
    cleanRut,
    isValidRut,
    formatRut,
    isEmail,
    isStrongPassword,
    isPhoneCL,
    isNotEmpty,
} from './validators'

describe('cleanRut', () => {
    it('deja solo dígitos y K en mayúscula', () => {
        expect(cleanRut('12.345.678-5')).toBe('123456785')
        expect(cleanRut('7.654.321-k')).toBe('7654321K')
    })
})

describe('isValidRut', () => {
    it('acepta un RUT válido (dígito verificador correcto)', () => {
        expect(isValidRut('12.345.678-5')).toBe(true)
        expect(isValidRut('123456785')).toBe(true)
    })

    it('rechaza un RUT con dígito verificador incorrecto', () => {
        expect(isValidRut('12.345.678-9')).toBe(false)
    })

    it('rechaza strings demasiado cortos', () => {
        expect(isValidRut('5')).toBe(false)
        expect(isValidRut('')).toBe(false)
    })

    it('rechaza un cuerpo no numérico', () => {
        // tras limpiar, si el cuerpo queda vacío o no numérico, debe fallar
        expect(isValidRut('-5')).toBe(false)
    })
})

describe('formatRut', () => {
    it('da formato con puntos y guión', () => {
        expect(formatRut('123456785')).toBe('12.345.678-5')
    })

    it('devuelve tal cual si es demasiado corto para formatear', () => {
        expect(formatRut('5')).toBe('5')
    })
})

describe('isEmail', () => {
    it('acepta un correo válido', () => {
        expect(isEmail('cliente@medistock.cl')).toBe(true)
    })

    it('ignora espacios al inicio/fin', () => {
        expect(isEmail('  cliente@medistock.cl  ')).toBe(true)
    })

    it('rechaza correos sin dominio o sin @', () => {
        expect(isEmail('cliente@')).toBe(false)
        expect(isEmail('no-es-correo')).toBe(false)
    })
})

describe('isStrongPassword', () => {
    it('acepta 8+ caracteres con letra y número', () => {
        expect(isStrongPassword('abcdefg1')).toBe(true)
    })

    it('rechaza si falta el número', () => {
        expect(isStrongPassword('abcdefgh')).toBe(false)
    })

    it('rechaza si falta la letra', () => {
        expect(isStrongPassword('12345678')).toBe(false)
    })

    it('rechaza si tiene menos de 8 caracteres', () => {
        expect(isStrongPassword('abc123')).toBe(false)
    })
})

describe('isPhoneCL', () => {
    it('acepta 9XXXXXXXX', () => {
        expect(isPhoneCL('912345678')).toBe(true)
    })

    it('acepta con prefijo +56 y espacios', () => {
        expect(isPhoneCL('+56 9 1234 5678')).toBe(true)
    })

    it('rechaza números que no empiezan con 9', () => {
        expect(isPhoneCL('812345678')).toBe(false)
    })

    it('rechaza largos incorrectos', () => {
        expect(isPhoneCL('91234')).toBe(false)
    })
})

describe('isNotEmpty', () => {
    it('true para texto con contenido', () => {
        expect(isNotEmpty('hola')).toBe(true)
    })

    it('false para vacío o solo espacios', () => {
        expect(isNotEmpty('')).toBe(false)
        expect(isNotEmpty('   ')).toBe(false)
    })
})
