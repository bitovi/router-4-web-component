/*****************************
  Route types
*****************************/

/**
 * This Route's path is being activated.
 * @callback Activate
 * @returns {void}
 */

/**
 * This Route's path is being deactivated.
 * @callback Deactivate
 * @returns {void}
 */

/**
 * @callback Match
 * @param {string} path
 * @returns {boolean}
 */

/**
 * @typedef RouteActivation
 * @property {Activate} activate This Route's path is being activated.
 * @property {Deactivate} deactivate This Route's path is being deactivated.
 */

/**
 * @typedef RouteMatch
 * @property {Match} matchPath
 */

/*****************************
  Route child types
*****************************/

/**
 * @callback RouteChildModuleInit
 * @returns {HTMLElement | void}
 */

/**
 * @typedef RouteChildModule
 * @property {RouteChildModuleInit} init
 */
