"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/micromark-extension-mdx-md";
exports.ids = ["vendor-chunks/micromark-extension-mdx-md"];
exports.modules = {

/***/ "(ssr)/./node_modules/micromark-extension-mdx-md/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/micromark-extension-mdx-md/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   mdxMd: () => (/* binding */ mdxMd)\n/* harmony export */ });\n/**\n * @typedef {import('micromark-util-types').Extension} Extension\n */ /**\n * Create an extension for `micromark` to disable some CommonMark syntax (code\n * (indented), autolinks, and HTML (flow and text)) for MDX.\n *\n * @returns {Extension}\n *   Extension for `micromark` that can be passed in `extensions` to disable\n *   some CommonMark syntax for MDX.\n */ function mdxMd() {\n    return {\n        disable: {\n            null: [\n                \"autolink\",\n                \"codeIndented\",\n                \"htmlFlow\",\n                \"htmlText\"\n            ]\n        }\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLWV4dGVuc2lvbi1tZHgtbWQvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBOztDQUVDLEdBRUQ7Ozs7Ozs7Q0FPQyxHQUNNLFNBQVNBO0lBQ2QsT0FBTztRQUNMQyxTQUFTO1lBQUNDLE1BQU07Z0JBQUM7Z0JBQVk7Z0JBQWdCO2dCQUFZO2FBQVc7UUFBQTtJQUN0RTtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaXB0LXczLy4vbm9kZV9tb2R1bGVzL21pY3JvbWFyay1leHRlbnNpb24tbWR4LW1kL2luZGV4LmpzPzNmYTkiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtaWNyb21hcmstdXRpbC10eXBlcycpLkV4dGVuc2lvbn0gRXh0ZW5zaW9uXG4gKi9cblxuLyoqXG4gKiBDcmVhdGUgYW4gZXh0ZW5zaW9uIGZvciBgbWljcm9tYXJrYCB0byBkaXNhYmxlIHNvbWUgQ29tbW9uTWFyayBzeW50YXggKGNvZGVcbiAqIChpbmRlbnRlZCksIGF1dG9saW5rcywgYW5kIEhUTUwgKGZsb3cgYW5kIHRleHQpKSBmb3IgTURYLlxuICpcbiAqIEByZXR1cm5zIHtFeHRlbnNpb259XG4gKiAgIEV4dGVuc2lvbiBmb3IgYG1pY3JvbWFya2AgdGhhdCBjYW4gYmUgcGFzc2VkIGluIGBleHRlbnNpb25zYCB0byBkaXNhYmxlXG4gKiAgIHNvbWUgQ29tbW9uTWFyayBzeW50YXggZm9yIE1EWC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1keE1kKCkge1xuICByZXR1cm4ge1xuICAgIGRpc2FibGU6IHtudWxsOiBbJ2F1dG9saW5rJywgJ2NvZGVJbmRlbnRlZCcsICdodG1sRmxvdycsICdodG1sVGV4dCddfVxuICB9XG59XG4iXSwibmFtZXMiOlsibWR4TWQiLCJkaXNhYmxlIiwibnVsbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-extension-mdx-md/index.js\n");

/***/ })

};
;