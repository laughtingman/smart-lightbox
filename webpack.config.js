const path = require('path');
const miniCss = require('mini-css-extract-plugin');
module.exports = {
   entry: './lightbox.js',
	 mode: "production",
	 devtool: 'source-map',
   output: {
      filename: 'smart-lightbox.min.js',
      path: path.resolve(__dirname, 'dist'),
			library: {
				name: "smartLightbox",
				type: "window",
				export: "default"
			}
   },
   module: {
      rules: [{
         test:/\.(s*)css$/,
         use: [
            miniCss.loader,
            'css-loader',
            'sass-loader',
         ]
      }]
   },
   plugins: [
      new miniCss({
         filename: 'smart-lightbox.min.css',
      }),
   ]
};