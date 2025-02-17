/**
 * Agate styled WindDirectionControl component and behavior.
 *
 * @example
 * <WindDirectionControl />
 *
 * @module agate/WindDirectionControl
 * @exports WindDirectionControl
 * @exports WindDirectionControlBase
 * @exports WindDirectionControlDecorator
 */

import kind from '@enact/core/kind';
import {extractAriaProps} from '@enact/core/util';
import Changeable from '@enact/ui/Changeable';
import PropTypes from 'prop-types';
import compose from 'ramda/src/compose';

import ArcPicker from '../ArcPicker';
import Icon from '../Icon';
import Skinnable from '../Skinnable';

import css from './WindDirectionControl.module.less';

// Children supplied to ArcPicker/WindDirectionControl. The number of items in this array represents the number of
// Arcs rendered on the screen.
const children = ['airDown', 'airRight', 'airUp'];

/**
 * An Agate component for displaying Wind Direction Control.
 *
 * @class WindDirectionControlBase
 * @memberof agate/WindDirectionControl
 * @extends agate/ArcPicker.ArcPicker
 * @ui
 * @public
 */
const WindDirectionControlBase = kind({
	name: 'WindDirectionControlBase',

	propTypes: /** @lends agate/WindDirectionControl.WindDirectionControlBase.prototype */ {
		/**
		 * Whether the component is in a disabled state.
		 *
		 * @type {Boolean}
		 * @public
		 */
		disabled: PropTypes.bool,

		/**
		 * Called when value is changed.
		 *
		 * @type {Function}
		 * @public
		 */
		onChange: PropTypes.func,

		/**
		 * State of WindDirectionControl.
		 *
		 * @type {('airDown'|'airRight'|'airUp')}
		 * @default 'airDown'
		 * @public
		 */
		value:  PropTypes.oneOf(['airDown', 'airRight', 'airUp'])
	},

	defaultProps: {
		value: 'airDown'
	},

	styles: {
		css,
		className: 'windDirectionControl'
	},

	computed: {
		airDirectionIcon: ({value}) => (value.toLowerCase())
	},

	render: ({airDirectionIcon, disabled, onChange, value, ...rest}) => {
		const ariaProps = extractAriaProps(rest);

		return (
			<div {...rest}>
				<ArcPicker
					{...ariaProps}
					disabled={disabled}
					endAngle={210}
					onChange={onChange}
					slotCenter={
						<Icon className={css.airDirectionIcon} css={css}>{airDirectionIcon}</Icon>
					}
					value={value}
				>
					{children}
				</ArcPicker>
			</div>
		);
	}
});

/**
 * Applies Agate specific behaviors to {@link agate/WindDirectionControl.WindDirectionControlBase|WindDirectionControlBase}.
 *
 * @hoc
 * @memberof agate/WindDirectionControl
 * @mixes ui/Changeable.Changeable
 * @mixes agate/Skinnable.Skinnable
 * @public
 */
const WindDirectionControlDecorator = compose(
	Changeable,
	Skinnable
);

/**
 * WindDirectionControl with Agate styling and
 * {@link agate/WindDirectionControl.WindDirectionControlDecorator|WindDirectionControlDecorator} applied.
 *
 * Usage:
 * ```
 * <WindDirectionControl />
 * ```
 *
 * @class WindDirectionControl
 * @memberof agate/WindDirectionControl
 * @extends agate/WindDirectionControl.WindDirectionControlBase
 * @mixes agate/WindDirectionControl.WindDirectionControlDecorator
 * @ui
 * @public
 */
const WindDirectionControl = WindDirectionControlDecorator(WindDirectionControlBase);

export default WindDirectionControl;
export {
	WindDirectionControl,
	WindDirectionControlBase,
	WindDirectionControlDecorator
};
