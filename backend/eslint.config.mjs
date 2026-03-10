import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest';   // ← ADD THIS IMPORT

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
    },

    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    eslintPluginPrettierRecommended,
    // Global settings (Node + Jest globals)
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parserOptions: {
                // Only enable project/type checking where needed
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['test/**/*.ts', '**/*.spec.ts', '**/*.e2e-spec.ts'],
        plugins: {
            jest,
        },
        rules: {
            '@typescript-eslint/unbound-method': 'off',
            'jest/unbound-method': 'error',
            //
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
    {
        files: ['src/**/*.ts'],
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
        },
    },
    {
        rules: {
            'prettier/prettier': ['error', { endOfLine: 'lf' }],
        },
    }
);
