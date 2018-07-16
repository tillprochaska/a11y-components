import string from 'rollup-plugin-string';
import pkg from '../package.json';

const name = pkg.name
    .replace(/^\w/, m => m.toUpperCase())
    .replace(/-\w/g, m => m[1].toUpperCase());

export default {

    input: {
        select: 'src/index.js',
    },

    output: {
        dir: 'dist/',
        format: 'es',
        name,
    },

    experimentalCodeSplitting: true,

    plugins: [
        string({
            include: '**/*.css',
        }),
    ]
    
};