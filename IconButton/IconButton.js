/**
 * Agate styled button components and behaviors.
 *
 * @example
 * <IconButton small>home</IconButton>
 *
 * @module agate/IconButton
 * @exports IconButton
 * @exports IconButtonBase
 * @exports IconButtonDecorator
 */

import kind from '@enact/core/kind';
import {cap} from '@enact/core/util';
import Spottable from '@enact/spotlight/Spottable';
import {ButtonBase as UiButtonBase, ButtonDecorator as UiButtonDecorator} from '@enact/ui/Button';
import Pure from '@enact/ui/internal/Pure';
import PropTypes from 'prop-types';
import compose from 'ramda/src/compose';

import {IconBase} from '../Icon';
// import {MarqueeDecorator} from '../Marquee';
import Skinnable from '../Skinnable';

import componentCss from './IconButton.less';

// Make a basic Icon in case we need it later. This cuts `Pure` out of icon for a small gain.
const Icon = Skinnable(IconBase);

/**
 * A button component.
 *
 * This component is most often not used directly but may be composed within another component as it
 * is within [IconButton]{@link agate/IconButton.IconButton}.
 *
 * @class IconButtonBase
 * @memberof agate/IconButton
 * @extends ui/IconButton.IconButtonBase
 * @ui
 * @public
 */
const IconButtonBase = kind({
	name: 'IconButton',

	propTypes: /** @lends agate/IconButton.IconButtonBase.prototype */ {
		/**
		 * Customizes the component by mapping the supplied collection of CSS class names to the
		 * corresponding internal Elements and states of this component.
		 *
		 * The following classes are supported:
		 *
		 * * `button` - The root class name
		 * * `bg` - The background node of the button
		 * * `selected` - Applied to a `selected` button
		 * * `small` - Applied to a `small` button
		 *
		 * @type {Object}
		 * @public
		 */
		css: PropTypes.object,

		/**
		 * Provides a way to call special interface attention to this button. It will be "featured"
		 * in some way by the theme's visual rules.
		 *
		 * @type {Boolean}
		 * @public
		 */
		highlighted: PropTypes.bool,

		/**
		 * Provides a way to call special interface attention to this button. It will be "featured"
		 * in some way by the theme's visual rules.
		 *
		 * @type {Boolean}
		 * @public
		 */
		selected: PropTypes.bool,

		/**
		 * Specify how this button will be used. Is it a standalone button, or is it in a grid of
		 * other related buttons.
		 *
		 * @type {String}
		 * @public
		 */
		type: PropTypes.oneOf(['grid', 'standard'])
	},

	defaultProps: {
		type: 'standard'
	},

	styles: {
		css: componentCss,
		publicClassNames: ['button', 'bg', 'client', 'selected', 'small']
	},

	computed: {
		className: ({highlighted, joinedPosition, selected, type, styler}) => styler.append(
			type,
			{highlighted, selected}
		),
		minWidth: ({children}) => (!children)
	},

	render: ({css, children, ...rest}) => {
		delete rest.highlighted;
		delete rest.joinedPosition;
		delete rest.selected;
		delete rest.type;

		return UiButtonBase.inline({
			'data-webos-voice-intent': 'Select',
			...rest,
			css,
			icon: children,
			iconComponent: Icon,
			minWidth: true
		});
	}
});

/**
 * Enforces a minimum width on the IconButton.
 *
 * *NOTE*: This property's default is `true` and must be explicitly set to `false` to allow
 * the button to shrink to fit its contents.
 *
 * @name minWidth
 * @memberof agate/IconButton.IconButtonBase.prototype
 * @type {Boolean}
 * @default true
 * @public
 */


/**
 * Applies Agate specific behaviors to [IconButton]{@link agate/IconButton.IconButtonBase} components.
 *
 * @hoc
 * @memberof agate/IconButton
 * @mixes i18n/Uppercase.Uppercase
 * @mixes agate/Marquee.MarqueeDecorator
 * @mixes ui/IconButton.IconButtonDecorator
 * @mixes spotlight/Spottable.Spottable
 * @mixes agate/Skinnable.Skinnable
 * @public
 */
const IconButtonDecorator = compose(
	Pure,
	UiButtonDecorator,
	Spottable,
	Skinnable
);

/**
 * A button component, ready to use in Agate applications.
 *
 * Usage:
 * ```
 * <IconButton>
 * 	plus
 * </IconButton>
 * ```
 *
 * @class IconButton
 * @memberof agate/IconButton
 * @extends agate/IconButton.IconButtonBase
 * @mixes agate/IconButton.IconButtonDecorator
 * @ui
 * @public
 */
const IconButton = IconButtonDecorator(IconButtonBase);

export default IconButton;
export {
	IconButton,
	IconButtonBase,
	IconButtonDecorator
};
