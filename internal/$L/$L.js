/* global ILIB_AGATE_PATH */

import {getIStringFromBundle} from '@enact/i18n/src/resBundle';
import ResBundle from 'ilib/lib/ResBundle';

// The ilib.ResBundle for the active locale used by $L
let resBundle;

/**
 * Returns the current ilib.ResBundle
 *
 * @returns {ilib.ResBundle} Current ResBundle
 */
function getResBundle () {
	return resBundle;
}

/**
 * Creates a new ilib.ResBundle for string translation
 *
 * @param  {Object} options Options for ResBundle
 *
 * @returns {Promise|ResBundle} Resolves with a new ilib.ResBundle
 */
function createResBundle (options = {}) {
	let opts = options;

	if (typeof ILIB_AGATE_PATH !== 'undefined') {
		opts.basePath = ILIB_AGATE_PATH;
	}

	if (!opts.onLoad) return;

	// eslint-disable-next-line no-new
	new ResBundle({
		...opts,
		onLoad: (bundle) => {
			opts.onLoad(bundle || null);
		}
	});
}

/**
 * Deletes the current bundle object of strings and clears the cache.
 * @returns {undefined}
 */
function clearResBundle () {
	delete ResBundle.strings;
	delete ResBundle.sysres;
	resBundle = null;
}

/**
 * Set the locale for the strings that $L loads. This may reload the
 * string resources if necessary.
 *
 * @param {ilib.ResBundle} bundle Bundle for setResBundle
 * @returns {ilib.ResBundle} Current ResBundle
 */
function setResBundle (bundle) {
	return (resBundle = bundle);
}

function toIString (str) {
	let rb = getResBundle();

	if (!rb) {
		createResBundle({sync: true, onLoad: setResBundle});
		rb = getResBundle();
	}

	return getIStringFromBundle(str, rb);
}

/**
 * Maps a string or key/value object to a translated string for the current locale.
 *
 * @function
 * @memberof i18n/$L
 * @param  {String|Object} str Source string
 *
 * @returns {String} The translated string
 */
function $L (str) {
	return String(toIString(str));
}

export default $L;
export {
	$L,
	clearResBundle,
	createResBundle,
	setResBundle
};
