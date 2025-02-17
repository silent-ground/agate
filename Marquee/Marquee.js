/**
 * Provides components for displaying and controlling marquee text.
 *
 * @example
 * <Marquee marqueeOn="render">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Marquee>
 *
 * @see {@link ui/Marquee}
 * @module agate/Marquee
 * @exports Marquee
 * @exports MarqueeBase
 * @exports MarqueeController
 * @exports MarqueeDecorator
 */

import hoc from '@enact/core/hoc';
import {I18nContextDecorator} from '@enact/i18n/I18nDecorator';
import {
	MarqueeBase,
	MarqueeController,
	MarqueeDecorator as UiMarqueeDecorator
} from '@enact/ui/Marquee';

const MarqueeDecorator = hoc((config, Wrapped) => {
	return I18nContextDecorator(
		{rtlProp: 'rtl', localeProp: 'locale'},
		UiMarqueeDecorator(
			config,
			Wrapped
		)
	);
});

const Marquee = MarqueeDecorator('div');

export default Marquee;
export {
	/**
	 * A block element which will marquee its contents.
	 *
	 * @see {@link ui/Marquee.Marquee}
	 * @class Marquee
	 * @memberof agate/Marquee
	 * @extends ui/Marquee.Marquee
	 * @ui
	 * @public
	 */
	Marquee,

	/**
	 * Internal component to provide marquee markup.
	 *
	 * @see {@link ui/Marquee.Marquee}
	 * @class MarqueeBase
	 * @memberof agate/Marquee
	 * @extends ui/Marquee.MarqueeBase
	 * @ui
	 * @public
	 */
	MarqueeBase,

	/**
	 * Adds ability to control descendant marquee instances to a component.
	 *
	 * @see {@link ui/Marquee.MarqueeController}
	 * @hoc
	 * @name MarqueeController
	 * @memberof agate/Marquee
	 * @extends ui/Marquee.MarqueeController
	 * @public
	 */
	MarqueeController,

	/**
	 * Adds marquee behavior to a component.
	 *
	 * @see {@link ui/Marquee.MarqueeDecorator}
	 * @hoc
	 * @name MarqueeDecorator
	 * @memberof agate/Marquee
	 * @extends ui/Marquee.MarqueeDecorator
	 * @public
	 */
	MarqueeDecorator
};
