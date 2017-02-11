'use_strict'
/**
 *
 * Using webpack context feature to get list of resources we want to use - we get into client folder,
 * walk all subfolders and get list of resources:
 * https://webpack.github.io/docs/context.html#require-context
 *
 * Getting CSS context is little more complex then getting all DOM resources, since there are general styles that
 * are not getting loaded directly in modules but are inherited from in different modules' styles,
 * we do not need them and if they are loaded we get various webpack errors because these are not ment to be loaded that way.
 *
 * This is why we are using more complex, and more resource consuming regex to find css resources,
 * comparing to simple dom context regex.
 *
 * Contexts are further used to require resources found.
 */
const cssContext = require.context('../', true, /^((?!general-styles).)*\.css$/);
const domContext = require.context('../', true, /\.jsx$/);


/**
 * webpackContextAnalyzer parses resource lists we fetched and gets us moduel resources
 *
 * @param  {webpack require context} webpackRequireContext - resource context
 * @param  {string} name - module name
 * @param  {string} ext - resource extension
 */
var webpackContextAnalyzer = function(webpackRequireContext, name, ext) {
	//Getting list of resources as an array
	var itemList = webpackRequireContext.keys();

	/**
	 * Method created to be used with reduced list of resources that should contain
	 * one req string or be empty if there are no resources.
	 *
	 * In case when we get mroe then one resouce in this list, it means that we made an error in module naming
	 * so we get detailed notification about it
	 */
	var checkExistAndUniqueList = function(list, get) {
		if(list.length === 0) {
			return null;
		} else if(list.length === 1) {
			return get ? list[0] : true;
		} else {
			console.log('%cQuantum blox resource loader, module resource loader', 'color: #009E60; font-size: 1.3em; font-weight: bold; text-decoration: underline;');
			console.log('%cWarning: There is more then one module fitting your query: ', 'color: #900; font-size: 1.2em;');
			console.log(JSON.stringify(list, null, 4));
			console.log('%cNOTE: first item on the list is returned as a falback in this case', 'color: #900; font-size: 1.2em;');
			return get ? list[0] : false;
		}
	};
	return {
		/**
		 * get list of module resources strings for this ui variant id
		 *
		 * if everything is right, list will have exactly one element
		 *
		 * following is the same thing just for base resource
		 */
		findReqString: function(id) {
			return itemList.filter((item) => (item.indexOf(`/${id}.${name}.${ext}`) !== -1));
		},
		findBaseReqString: function() {
			return this.findReqString('base');
		},
		/**
		 * check if resource is unique
		 *
		 * Second param is boolean defining if resource should also be returned
		 *
		 * If resource does NOT EXIST we get null in return in both cases
		 *
		 * If resource is UNIQUE we get either true or resource link
		 *
		 * If resource is NOT UNIQUE we get first item on the list in return, and detailed notification in console
		 */
		checkExistAndUnique: function(id, get) {
			return checkExistAndUniqueList(this.findReqString(id), get);
		},
		/**
		 * getBase gets invoked as last resort when looking for resources, base should always EXIST
		 *
		 * if there is no base resource, we get exception.
		 */
		getBase() {
			var base = checkExistAndUniqueList(this.findBaseReqString(), true);
			if(base === null) {
				throw new Error('Can not proceed without base module for ' + name);
			} else {
				return base;
			}
		},

		/**
		 * following methods are fetching resource string and returning null if they do not exist
		 */
		getReqString: function(id) {
			return this.checkExistAndUnique(this.getReqString(id, name,ext), true);
		},
		getBaseReqString: function() {
			return this.checkExistAndUnique(this.getBaseReqString(name, ext), true);
		}
	};
};