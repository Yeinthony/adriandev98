import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  // 1. Reglas base recomendadas de JavaScript
  //    Detecta errores comunes como variables sin usar,
  //    comparaciones incorrectas, etc.
  js.configs.recommended,

  // 2. Reglas recomendadas de TypeScript
  //    Detecta errores de tipos, imports incorrectos, etc.
  ...tseslint.configs.recommended,

  // 3. Reglas recomendadas para archivos .astro
  //    Entiende la sintaxis especial de Astro (frontmatter, slots, etc.)
  ...eslintPluginAstro.configs.recommended,

  // 4. Reglas de accesibilidad para JSX en Astro
  //    Asegura que tu sitio sea accesible (alt en imágenes, roles ARIA, etc.)
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],

  // 5. Archivos/carpetas que ESLint debe IGNORAR
  {
    ignores: ['dist/', 'node_modules/', '.astro/'],
  },
];