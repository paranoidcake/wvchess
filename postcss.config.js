const postcss = require("postcss")
const fs = require('fs')

const generateTypes = (cssFileName, json, outputFileName) => {
    const path = require("path");
    const targetFileName = path.basename(cssFileName);
    const targetDir = path.dirname(cssFileName) + '/';

    fs.writeFileSync(targetDir + 'styles.ts',
        'export const classNames = ' + JSON.stringify(json)
    );
}

module.exports = postcss([
    require("postcss-modules")({
        getJSON: generateTypes,
    }),
]);

// module.exports = {
//     "modules": true,
//     "plugins": [
//         postcss.plugin('postcss-types', opts => {
//             return css => {
//                 generateTypes(css, opts)
//             }
//         })
//     ]
// }