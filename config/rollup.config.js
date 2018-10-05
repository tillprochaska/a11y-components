import postcss from 'rollup-plugin-postcss';
import url from 'postcss-url';
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
        postcss({
            inject: false,
            plugins: [
                url({ url: 'inline' }),
            ],
        }),
    ],

};
