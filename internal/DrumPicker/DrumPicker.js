/* eslint-disable react/jsx-no-bind */

/**
 * A internal DrumPicker component.
 *
 * @module agate/internal/DrumPicker
 * @exports DrumPicker
 * @exports DrumPickerDecorator
 * @private
 */

import classnames from 'classnames';
import {adaptEvent, forward, handle} from '@enact/core/handle';
import hoc from '@enact/core/hoc';
import {is} from '@enact/core/keymap';
import kind from '@enact/core/kind';
import {clamp} from '@enact/core/util';
import Spottable from '@enact/spotlight/Spottable';
import Changeable from '@enact/ui/Changeable';
import IdProvider from '@enact/ui/internal/IdProvider';
import Touchable from '@enact/ui/Touchable';
import PropTypes from 'prop-types';
import compose from 'ramda/src/compose';
import {Children, Component} from 'react';
import ReactDOM from 'react-dom';

import $L from '../$L';
import Skinnable from '../../Skinnable';

import DrumPickerItem from './DrumPickerItem';

import css from './DrumPicker.module.less';

const DrumPickerRoot = Touchable(Spottable('div'));

// Set-up event forwarding
const forwardKeyDown = forward('onKeyDown');

const isDown = is('down');
const isLeft = is('left');
const isRight = is('right');
const isUp = is('up');

/**
 * The base component for {@link agate/internal/DrumPicker.DrumPicker}.
 *
 * @class DrumPicker
 * @memberof agate/internal/DrumPicker
 * @ui
 * @private
 */
const DrumPickerBase = class extends Component {
	static displayName = 'DrumPicker';

	static propTypes = /** @lends agate/internal/DrumPicker.DrumPicker.prototype */ {
		/**
		 * The maximum value selectable by the picker (inclusive).
		 *
		 * The range between `min` and `max` should be evenly divisible by
		 * [step]{@link agate/internal/Picker.Picker.step}.
		 *
		 * @type {Number}
		 * @required
		 * @public
		 */
		max: PropTypes.number.isRequired,

		/**
		 * The minimum value selectable by the picker (inclusive).
		 *
		 * The range between `min` and `max` should be evenly divisible by
		 * [step]{@link agate/internal/Picker.Picker.step}.
		 *
		 * @type {Number}
		 * @required
		 * @public
		 */
		min: PropTypes.number.isRequired,

		/**
		 * Accessibility hint
		 *
		 * For example, `hour`, `year`, and `meridiem`
		 *
		 * @type {String}
		 * @default ''
		 * @public
		 */
		accessibilityHint: PropTypes.string,

		/**
		 * The "aria-label" for the picker.
		 *
		 * By default, `aria-valuetext` is set to the current value.
		 * This should only be used when the parent controls the value of
		 * the picker directly through the props.
		 *
		 * @type {String}
		 * @public
		 */
		'aria-label': PropTypes.string,

		/**
		 * Overrides the `aria-valuetext` for the picker. By default, `aria-valuetext` is set
		 * to the current value. This should only be used when the parent controls the value of
		 * the picker directly through the props.
		 *
		 * @type {String|Number}
		 * @memberof agate/internal/DrumPicker.DrumPicker.prototype
		 * @public
		 */
		'aria-valuetext': PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

		/**
		 * Children from which to pick
		 *
		 * @type {Node}
		 * @public
		 */
		children: PropTypes.node,

		/**
		 * Class name for component.
		 *
		 * @type {String}
		 * @public
		 */
		className: PropTypes.string,

		/**
		 * Customize component style
		 *
		 * @type {Object}
		 * @private
		 */
		css: PropTypes.object,

		/**
		 * Sets the hint string read when focusing the decrement button.
		 *
		 * @type {String}
		 * @default 'previous item'
		 * @public
		 */
		decrementAriaLabel: PropTypes.string,

		/**
		 * Disables the picker.
		 *
		 * @type {Boolean}
		 * @public
		 */
		disabled: PropTypes.bool,

		/**
		 * The picker id reference for setting aria-controls.
		 *
		 * @type {String}
		 * @private
		 */
		id: PropTypes.string,

		/**
		 * Sets the hint string read when focusing the increment button.
		 *
		 * @default 'next item'
		 * @type {String}
		 * @public
		 */
		incrementAriaLabel: PropTypes.string,

		/**
		 * A function to run when the control should increment or decrement.
		 *
		 * @type {Function}
		 * @public
		 */
		onChange: PropTypes.func,

		/**
		 * A function to run when the picker is removed while retaining focus.
		 *
		 * @type {Function}
		 * @private
		 */
		onSpotlightDisappear: PropTypes.func,

		/**
		 * Orientation of the picker.
		 *
		 * Controls whether the buttons are arranged horizontally or vertically around the value.
		 *
		 * * Values: `'horizontal'`, `'vertical'`
		 *
		 * @type {String}
		 * @default 'vertical'
		 * @public
		 */
		orientation: PropTypes.oneOf(['horizontal', 'vertical']),

		/**
		 * When `true`, the component cannot be navigated using spotlight.
		 *
		 * @type {Boolean}
		 * @public
		 */
		spotlightDisabled: PropTypes.bool,

		/**
		 * Allow the picker to only increment or decrement by a given value.
		 *
		 * A step of `2` would cause a picker to increment from 10 to 12 to 14, etc. It must evenly
		 * divide into the range designated by `min` and `max`.
		 *
		 * @type {Number}
		 * @default 1
		 * @public
		 */
		step: PropTypes.number,


		/**
		 * The type of picker. It determines the aria-label for the next and previous buttons.
		 *
		 * Depending on the `type`, `decrementAriaLabel`, and `incrementAriaLabel`,
		 * the screen readers read out differently when Spotlight is on the next button, the previous button,
		 * or the picker itself.
		 *
		 * For example, if Spotlight is on the next button
		 * and aria label props(`decrementAriaLabel` and `incrementAriaLabel`) are not defined,
		 * then the screen readers read out as follows.
		 *	`'string'` type: `'next item'`
		 * 	`'number'` type: `'increase the value'`
		 *
		 * @type {('number'|'string')}
		 * @default 'string'
		 * @public
		 */
		type: PropTypes.oneOf(['number', 'string']),

		/**
		 * Index of the selected child.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		value: PropTypes.number,

		/**
		 * Choose a specific size for your picker. `'small'`, `'medium'`, `'large'`, or set to `null` to
		 * assume auto-sizing. `'small'` is good for numeric pickers, `'medium'` for single or short
		 * word pickers, `'large'` for maximum-sized pickers.
		 *
		 * You may also supply a number. This number will determine the minimum size of the DrumPicker.
		 * Setting a number to less than the number of characters in your longest value may produce
		 * unexpected results.
		 *
		 * @type {('small'|'medium'|'large'|Number)}
		 * @public
		 */
		width: PropTypes.oneOfType([
			PropTypes.oneOf([null, 'small', 'medium', 'large']),
			PropTypes.number
		]),

		/**
		 * Should the picker stop incrementing when the picker reaches the last element? Set `wrap`
		 * to `true` to allow the picker to continue from the opposite end of the list of options.
		 *
		 * @type {Boolean}
		 * @public
		 */
		wrap: PropTypes.bool
	};

	static defaultProps = {
		accessibilityHint: '',
		orientation: 'vertical',
		step: 1,
		type: 'string',
		value: 0
	};

	constructor (props) {
		super(props);

		this.initContentRef = this.initRef('contentRef');
		this.initRootRef = this.initRef('rootRef');
		this.initIndicatorRef = this.initRef('indicatorRef');

		const {min, max, step, value} = this.props;
		this.children = this.calculateChildren(min, max, step, value);

		let selectedValue;
		if (value || value === 0) {
			selectedValue = this.children.findIndex((element) => element.props.children === value);
		}

		if (selectedValue < 0 ) {
			selectedValue = 0;
		}

		this.state = {
			selectedValue: selectedValue
		};

		this.scrollY = -1;
		this.lastY = 0;
		this.startY = 0;
		this.isMoving = false;
	}

	componentDidMount () {
		const {children} = this;

		for (let i = 0, length = children.length; i < length; i++) {
			if (children[i].props.children === this.state.selectedValue) {
				this.scrollTo(i, false);
				return;
			}
		}
		this.scrollTo(0, false);
	}

	setTransform = (nodeStyle, value) => {
		nodeStyle.transform = value;
	};

	setTransition= (nodeStyle, value) => {
		nodeStyle.transition = value;
	};

	calculateChildren= (min, max, step, value) => {
		if (this.props.type === 'number') {
			const childrenArray = Array(Math.floor((max - min) / step) + 1).fill(min).map( ((x, i) => (x + i * step)) );
			return (Children.map(childrenArray, (child) => (
				<DrumPickerItem key={value} marqueeDisabled style={{direction: 'ltr'}}>{child}</DrumPickerItem>
			)));
		} else return this.props.children;

	};

	scrollTo = (y, isAnimated) => {
		const itemHeight = this.indicatorRef.getBoundingClientRect().height;
		if (this.scrollY !== y * itemHeight) {
			this.scrollY = y * itemHeight;

			if (isAnimated) {
				this.setTransition(this.contentRef.style, 'transform 300ms');
			}
			this.setTransform(this.contentRef.style, `translate(0,${-((y + 1) * itemHeight)}px)`);

			if (this.scrollY >= 0) {
				const {children} = this;
				const index = Math.min(y, children.length - 1);
				const child = children[index].props.children;
				if (child || child === 0) {
					this.changeValue(child, index);
				}
			}
		}
	};

	onStart = (y) => {
		if (this.props.disabled) {
			return;
		}
		this.isMoving = true;
		this.startY = y;
		this.lastY = this.scrollY;
	};

	onMove = (y) => {
		const itemHeight = this.indicatorRef.getBoundingClientRect().height;

		if (this.props.disabled || !this.isMoving) {
			return;
		}
		this.scrollY = this.lastY - y + this.startY;
		this.setTransform(this.contentRef.style, `translate(0,${-this.scrollY - itemHeight}px)`);
	};

	onFinish = () => {
		const itemHeight = this.indicatorRef.getBoundingClientRect().height;

		this.isMoving = false;
		let targetY = this.scrollY;
		const height = ((this.children).length - 1) * itemHeight;
		if (targetY % itemHeight !== 0) {
			targetY = Math.round(targetY / itemHeight) * itemHeight;
		}

		if (targetY < 0) {
			targetY = 0;
		} else if (targetY > height) {
			targetY = height;
		}
		this.scrollTo(targetY / itemHeight, false);
	};

	changeValue = (selectedValue, selectedValueIndex) => {
		const {onChange} = this.props;
		if (selectedValue !== this.state.selectedValue) {
			this.setState({
				selectedValue
			});
			onChange({value: selectedValueIndex});
		}
	};

	currentValueText = () => {
		const {accessibilityHint, 'aria-valuetext': ariaValueText, children, value} = this.props;
		if (ariaValueText != null) {
			return ariaValueText;
		}

		let valueText = value;

		if (children && Array.isArray(children)) {
			if (children[value] && children[value].props) {
				valueText = children[value].props.children;
			} else {
				valueText = children[value];
			}
		}

		if (accessibilityHint) {
			valueText = `${valueText} ${accessibilityHint}`;
		}

		return valueText;
	};

	decrementAriaLabel = () => {
		const {decrementAriaLabel, type} = this.props;
		if (decrementAriaLabel != null) {
			return decrementAriaLabel;
		}

		if (type === 'number') {
			return `${$L('decrease the value')}`;
		} else {
			return `${$L('previous item')}`;
		}
	};

	incrementAriaLabel= () => {
		const {incrementAriaLabel, type} = this.props;
		if (incrementAriaLabel != null) {
			return incrementAriaLabel;
		}

		if (type === 'number') {
			return `${$L('increase the value')}`;
		} else {
			return `${$L('next item')}`;
		}
	};

	calcAriaLabel = () => {
		const {'aria-label': ariaLabel} = this.props;
		if (ariaLabel != null) {
			return ariaLabel;
		}
		return this.currentValueText();
	};

	handleKeyDown = (ev) => {
		const {orientation} = this.props;
		const {keyCode} = ev;
		forwardKeyDown(ev, this.props);

		if (!this.props.disabled) {
			const itemHeight = this.indicatorRef.getBoundingClientRect().height;

			if (orientation === 'horizontal' && isLeft(keyCode)) {
				ev.stopPropagation();
				// decrement
			} else if (orientation === 'horizontal' && isRight(keyCode) ) {
				ev.stopPropagation();
				// increment
			} else if (orientation === 'vertical' && isUp(keyCode)) {
				ev.stopPropagation();
				this.scrollTo(clamp(0, (this.children).length - 1, this.scrollY / itemHeight - 1), true);
			} else if (orientation === 'vertical' && isDown(keyCode) ) {
				ev.stopPropagation();
				this.scrollTo(clamp(0, (this.children).length - 1, this.scrollY / itemHeight + 1), true);
			}
		}
	};

	valueId =  ({id}) => `${id}_value`;

	initRef (prop) {
		return (ref) => {
			// eslint-disable-next-line react/no-find-dom-node
			this[prop] = ref && ReactDOM.findDOMNode(ref);
		};
	}

	render ()  {
		const {
			// children: values,
			className,
			disabled,
			onSpotlightDisappear,
			width,
			...rest
		} = this.props;

		const {children: values} = this;

		const currentValueText = this.currentValueText();
		const decAriaLabel = this.decrementAriaLabel();
		const incAriaLabel = this.incrementAriaLabel();
		const decrementAriaLabel = `${currentValueText} ${decAriaLabel}`;
		const incrementAriaLabel = `${currentValueText} ${incAriaLabel}`;
		const indicatorAriaLabel = this.calcAriaLabel();

		let sizingPlaceholder = null;
		if (typeof width === 'number' && width > 0) {
			sizingPlaceholder = <div aria-hidden className={css.sizingPlaceholder}>{'0'.repeat(width)}</div>;
		}

		delete rest['aria-valuetext'];
		delete rest.accessibilityHint;
		delete rest.decrementAriaLabel;
		delete rest.incrementAriaLabel;
		delete rest.noAnimation;
		delete rest.onChange;
		delete rest.orientation;
		delete rest.reverseTransition;
		delete rest.spotlightDisabled;
		delete rest.type;
		delete rest.value;
		delete rest.wrap;

		const mapItems = (item) => {
			return (
				<div className={this.state.selectedValue === item.props.children ? classnames(css.selectedItem, css.item) : css.item}>
					{sizingPlaceholder}
					{item}
				</div>
			);
		};

		const items = Children ? Children.map(values, mapItems) : ([]).concat(values).map(mapItems);

		return (
			<div {...rest} className={classnames(className, css.drumPicker)} ref={this.initRootRef}>
				<div
					aria-controls={this.valueId}
					aria-disabled={disabled}
					aria-label={decrementAriaLabel}
					className={classnames(css.itemDecrement, css.item, className)}
					disabled={disabled}
				/>
				<div
					aria-label={indicatorAriaLabel}
					aria-valuetext={currentValueText}
					className={classnames(css.indicator, css.item, className)}
					ref={this.initIndicatorRef}
					disabled={disabled}
				/>
				<div
					aria-controls={this.valueId}
					aria-disabled={disabled}
					aria-label={incrementAriaLabel}
					className={classnames(css.itemIncrement, css.item, className)}
					disabled={disabled}
				/>
				<DrumPickerRoot
					className={css.root}
					disabled={disabled}
					onKeyDown={this.handleKeyDown}
					onMouseDown={(evt) => this.onStart(evt.pageY)}
					onMouseMove={(evt) => {
						evt.preventDefault(); this.onMove(evt.pageY);
					}}
					onMouseUp={this.onFinish}
					onSpotlightDisappear={onSpotlightDisappear}
					onTouchCancel={this.onFinish}
					onTouchEnd={this.onFinish}
					onTouchMove={(evt) => {
						evt.preventDefault(); this.onMove(evt.touches[0].pageY);
					}}
					onTouchStart={(evt) => this.onStart(evt.touches[0].pageY)}
					ref={this.initContentRef}
				>
					{items}
				</DrumPickerRoot>
			</div>
		);
	}
};

/**
 * A higher-order component that filters the values returned by the onChange event on {@link agate/internal/DrumPicker.DrumPicker}
 *
 * @class ChangeAdapter
 * @hoc
 * @memberof agate/internal/DrumPicker
 * @private
 */
const ChangeAdapter = hoc((config, Wrapped) => {
	return kind({
		name: 'ChangeAdapter',

		handlers: {
			onChange: handle(
				adaptEvent(({value}) => {
					return ({value});
				},
				forward('onChange'))
			)
		},

		render: (props) => {
			return <Wrapped {...props} />;
		}
	});
});

/**
 * Applies Agate specific behaviors to [DrumPicker]{@link agate/DrumPicker.DrumPicker}.
 *
 * @hoc
 * @memberof agate/internal/DrumPicker
 * @mixes ui/Changeable.Changeable
 * @mixes agate/Skinnable.Skinnable
 * @private
 */
const DrumPickerDecorator = compose(
	IdProvider({generateProp: null}),
	Changeable,
	Skinnable
);

const DrumPicker = DrumPickerDecorator(DrumPickerBase);

export default DrumPicker;
export {
	ChangeAdapter,
	DrumPicker,
	DrumPickerBase
};
export DrumPickerItem from './DrumPickerItem';
