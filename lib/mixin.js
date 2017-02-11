/**
 *
 * Mixin to be provided to all the components that need variable resource loading 
 *
 * It handles multiple possible resources (ui inheritance feature) through straight forward interface,
 */

'use strict';


/**
 * When this mixin gets included into React componet it provides it with two internal methods - getStyles and getDOM
 *
 * Both methods receive ui variant id, uiId and name of component:
 *
 * [id] is ui variant id
 * [uiId] is id of variant [id] inherits from, so it will look for that one before deciding to pick up base one.
 * [name] module name
 */
module.exports = {
		staticGetStyles(id, uiId, name) {
			let styles;
			let cssResources = webpackContextAnalyzer(cssContext, name, 'css');

			if(cssResources.checkExistAndUnique(id) !== null) {
				styles = cssContext(cssResources.checkExistAndUnique(id, true));
			} else if((id !== uiId) && cssResources.checkExistAndUnique(uiId) !== null) {
				styles = cssContext(cssResources.checkExistAndUnique(uiId, true));
			} else {
				styles = cssContext(cssResources.getBase());
			}
			return styles;

		},
		getStyles: function(name) {
			let uiId = this.props.uiId;
			let id = this.props.id;

			return this.staticGetStyles(id, uiId, name);
		},
		staticGetDOM(id, uiId, name) {
			let dom;
			let domResources = webpackContextAnalyzer(domContext, name, 'jsx');

			if(domResources.checkExistAndUnique(id) !== null) {
				dom = domContext(domResources.checkExistAndUnique(id, true));
			} else if((id !== uiId) && domResources.checkExistAndUnique(uiId) !== null) {
				dom = domContext(domResources.checkExistAndUnique(uiId, true));
			} else {
				dom = domContext(domResources.getBase());
			}
			return dom;

		},
		getDOM: function(name) {
			let uiId = this.props.uiId;
			let id = this.props.id;
			return this.staticGetDOM(id, uiId, name);
		}
};