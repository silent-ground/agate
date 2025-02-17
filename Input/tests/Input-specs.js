import Spotlight from '@enact/spotlight';
import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from '../Input';

const isPaused = () => Spotlight.isPaused() ? 'paused' : 'not paused';

const keyDownUp = (keyCode) => (elm) => {
	fireEvent.keyDown(elm, {keyCode});
	return fireEvent.keyUp(elm, {keyCode});
};
const pressEnterKey = keyDownUp(13);
const pressLeftKey = keyDownUp(37);
const pressRightKey = keyDownUp(39);

describe('Input Specs', () => {
	test('should have an input element', () => {
		render(<Input />);

		const expected = 'INPUT';
		const actual = screen.getByLabelText('Input field').lastElementChild.tagName;

		expect(actual).toBe(expected);
	});

	test('should include a placeholder if specified', () => {
		const placeholder = 'hello';
		render(<Input placeholder={placeholder} />);

		const expected = 'placeholder';
		const actual = screen.getByLabelText('hello Input field').children[0];

		expect(actual).toHaveAttribute(expected, placeholder);
	});

	test('should have size large by default', () => {
		render(<Input />);

		const expected = 'large';
		const actual = screen.getByLabelText('Input field');

		expect(actual).toHaveClass(expected);
	});

	test('should have size small when size prop equals "small"', () => {
		render(<Input size="small" />);

		const expected = 'small';
		const actual = screen.getByLabelText('Input field');

		expect(actual).toHaveClass(expected);
	});

	test('should support iconAfter', () => {
		render(<Input iconAfter="0x0F0014" />);

		const expected = 983060; // decimal converted charCode of `happyface` character
		const actual = screen.getByLabelText('Input field').children[1].textContent.codePointAt();

		expect(actual).toBe(expected);
	});

	test('should support iconBefore', () => {
		render(<Input iconBefore="0x0F0014" />);

		const expected = 983060; // decimal converted charCode of `happyface` character
		const actual = screen.getByLabelText('Input field').children[0].textContent.codePointAt();

		expect(actual).toBe(expected);
	});

	test('should have icon size large by default', () => {
		render(<Input iconAfter="happyface" />);

		const expected = 'large';
		const actual = screen.getByLabelText('Input field').children[1];

		expect(actual).toHaveClass(expected);
	});

	test('should set icon size to small when size equals small', () => {
		render(<Input iconAfter="happyface" size="small" />);

		const expected = 'small';
		const actual = screen.getByLabelText('Input field').children[1];

		expect(actual).toHaveClass(expected);
	});

	test('should set `spellcheck=false` attribute when type is `password`', () => {
		render(<Input minLength={8} type="password" value="passwordValue" />);
		const input = screen.getByLabelText('13 characters Input field').children[0];

		const expectedAttribute = 'spellcheck';
		const expectedValue = 'false';

		expect(input).toHaveAttribute(expectedAttribute, expectedValue);
	});

	test('should callback onChange when the text changes', () => {
		const handleChange = jest.fn();
		const value = 'blah';
		const evt = {target: {value: value}};
		render(<Input onChange={handleChange} />);
		const input = screen.getByLabelText('Input field').lastElementChild;

		fireEvent.change(input, evt);

		const actual = handleChange.mock.calls[0][0].value;

		expect(actual).toBe(value);
	});

	test('should forward an event with a stopPropagation method from onChange handler', () => {
		const handleChange = jest.fn();
		const value = 'blah';
		const evt = {
			target: {value},
			stopPropagation: jest.fn()
		};

		render(<Input onChange={handleChange} />);
		const inputField = screen.getByLabelText('Input field').children[0];

		fireEvent.change(inputField, evt);

		const actual = typeof handleChange.mock.calls[0][0].stopPropagation === 'function';

		expect(actual).toBeTruthy();
	});

	test('should blur input on enter if `dismissOnEnter`', () => {
		const handleChange = jest.fn();
		render(<Input dismissOnEnter onBlur={handleChange} />);
		const inputText = screen.getByLabelText('Input field').children[0];

		fireEvent.mouseDown(inputText);
		pressEnterKey(inputText);

		expect(handleChange).toHaveBeenCalled();
	});

	test('should not call onBlur event on enter if `dismissOnEnter` and `autofocus`', () => {
		const handleChange = jest.fn();
		render(<Input autoFocus dismissOnEnter onBlur={handleChange} />);
		const inputText = screen.getByLabelText('Input field').children[0];

		fireEvent.mouseDown(inputText);
		pressEnterKey(inputText);

		expect(handleChange).not.toHaveBeenCalled();
	});

	test('should prevent onChange if onBeforeChange prevents', async () => {
		const handleBeforeChange = jest.fn(ev => ev.preventDefault());
		const handleChange = jest.fn();
		const user = userEvent.setup();
		const value = 'blah';
		render(<Input onBeforeChange={handleBeforeChange} onChange={handleChange} />);
		const inputText = screen.getByLabelText('Input field').children[0];

		await user.type(inputText, value);
		// blurring input onSpotlightRight for code coverage purposes
		pressRightKey(inputText);
		pressRightKey(inputText);
		pressRightKey(inputText);
		pressRightKey(inputText);
		pressRightKey(inputText);
		pressRightKey(inputText);

		expect(handleChange).not.toHaveBeenCalled();
	});

	test('should not bubble the native event when stopPropagation from onChange is called', async () => {
		const handleChange = jest.fn();
		const user = userEvent.setup();
		const value = 'smt';
		function stop (ev) {
			ev.stopPropagation();
		}

		render(
			<div onChange={handleChange}>
				<Input onChange={stop} />
			</div>
		);
		const inputText = screen.getByLabelText('Input field').children[0];

		await user.type(inputText, value);

		expect(handleChange).not.toHaveBeenCalled();
	});

	test('should callback onBeforeChange before the text changes', async () => {
		const handleBeforeChange = jest.fn();
		const user = userEvent.setup();
		const value = 'blah';
		render(<Input onBeforeChange={handleBeforeChange} />);
		const inputText = screen.getByLabelText('Input field').children[0];

		await user.type(inputText, value);
		// blurring input onSpotlightLeft for code coverage purposes
		pressLeftKey(inputText);

		expect(handleBeforeChange).toHaveBeenCalled();
	});

	test('should activate input on enter', () => {
		const handleChange = jest.fn();
		render(<Input onActivate={handleChange} />);
		const inputText = screen.getByLabelText('Input field').children[0];

		pressEnterKey(inputText);

		expect(handleChange).toHaveBeenCalled();
	});

	test('should not activate input on enter when disabled', () => {
		const handleChange = jest.fn();
		render(<Input disabled onActivate={handleChange} />);
		const inputText = screen.getByLabelText('Input field').children[0];

		pressEnterKey(inputText);

		expect(handleChange).not.toHaveBeenCalled();
	});

	test('should be able to be disabled', () => {
		render(<Input disabled />);

		const actual = screen.getByLabelText('Input field');
		const expected = 'disabled';

		expect(actual).toHaveAttribute(expected);
	});

	test('should reflect the value if specified', () => {
		render(<Input value="hello" />);

		const actual = screen.getByLabelText('hello Input field').children[0];
		const expected = 'hello';

		expect(actual).toHaveAttribute('value', expected);
	});

	test('should have dir equal to rtl when there is rtl text', () => {
		render(<Input value="שועל החום הזריז קפץ מעל הכלב העצלן.ציפור עפה השעועית עם שקי" />);
		const inputField = screen.getByLabelText( 'שועל החום הזריז קפץ מעל הכלב העצלן.ציפור עפה השעועית עם שקי' + ' Input field').children[0];

		const expectedAttribute = 'dir';
		const expectedValue = 'rtl';

		expect(inputField).toHaveAttribute(expectedAttribute, expectedValue);
	});

	test('should have dir equal to ltr when there is ltr text', () => {
		render(<Input value="content" />);
		const inputField = screen.getByLabelText('content Input field').children[0];

		const expectedAttribute = 'dir';
		const expectedValue = 'ltr';

		expect(inputField).toHaveAttribute(expectedAttribute, expectedValue);
	});

	test('should have dir equal to rtl when there is rtl text in the placeholder', () => {
		render(<Input placeholder="שועל החום הזריז קפץ מעל הכלב העצלן.ציפור עפה השעועית עם שקי" />);
		const inputField = screen.getByLabelText('שועל החום הזריז קפץ מעל הכלב העצלן.ציפור עפה השעועית עם שקי' + ' Input field').children[0];

		const expectedAttribute = 'dir';
		const expectedValue = 'rtl';

		expect(inputField).toHaveAttribute(expectedAttribute, expectedValue);
	});

	test('should have dir equal to ltr when there is ltr text in the placeholder', () => {
		render(<Input placeholder="content" />);
		const inputField = screen.getByLabelText('content Input field').children[0];

		const expectedAttribute = 'dir';
		const expectedValue = 'ltr';

		expect(inputField).toHaveAttribute(expectedAttribute, expectedValue);
	});

	test('should have dir equal to rtl when there is ltr text in the placeholder, but rtl text in value', () => {
		render(<Input placeholder="content" value="שועל החום הזריז קפץ מעל הכלב העצלן.ציפור עפה השעועית עם שקי" />);
		const inputField = screen.getByLabelText('שועל החום הזריז קפץ מעל הכלב העצלן.ציפור עפה השעועית עם שקי' + ' Input field').children[0];

		const expectedAttribute = 'dir';
		const expectedValue = 'rtl';

		expect(inputField).toHaveAttribute(expectedAttribute, expectedValue);
	});

	test('should have dir equal to ltr when there is rtl text in the placeholder, but ltr text in value', () => {
		render(<Input placeholder="שועל החום הזריז קפץ מעל הכלב העצלן.ציפור עפה השעועית עם שקי" value="content" />);
		const inputField = screen.getByLabelText('content Input field').children[0];

		const expectedAttribute = 'dir';
		const expectedValue = 'ltr';

		expect(inputField).toHaveAttribute(expectedAttribute, expectedValue);
	});

	test('should pause spotlight when input has focus', () => {
		render(<Input />);
		const inputField = screen.getByLabelText('Input field').children[0];

		fireEvent.mouseDown(inputField);

		const expected = 'paused';
		const actual = isPaused();

		Spotlight.resume();

		expect(actual).toBe(expected);
	});

	test('should resume spotlight on unmount', () => {
		const {unmount} = render(<Input />);
		const inputField = screen.getByLabelText('Input field').children[0];

		fireEvent.mouseDown(inputField);

		unmount();

		const expected = 'not paused';
		const actual = isPaused();

		Spotlight.resume();

		expect(actual).toBe(expected);
	});

	test('should display invalid message if it invalid and invalid message exists', () => {
		render(<Input invalid invalidMessage="invalid message" />);
		const actual = screen.getByText('invalid message');

		const expected = 'tooltipLabel';

		expect(actual).toHaveClass(expected);
	});

	test('should not display invalid message if it is valid', () => {
		render(<Input invalidMessage="invalid message" />);

		const actual = screen.queryByText('invalid message');

		expect(actual).toBeNull();
	});

	test('should support clearButton', () => {
		render(<Input clearButton />);

		const expected = 983097; // decimal converted charCode of character
		const actual = screen.getByLabelText('Input field').children[1].textContent.codePointAt();

		expect(actual).toBe(expected);
	});

	test('should support custom icon for clearButton', () => {
		render(<Input clearButton clearIcon="0x0F0014" />);

		const expected = 983060; // decimal converted charCode of character
		const actual = screen.getByLabelText('Input field').children[1].textContent.codePointAt();

		expect(actual).toBe(expected);
	});

	test('should clear input value when clearButton is clicked', async () => {
		const handleChange = jest.fn();
		const user = userEvent.setup();
		render(<Input clearButton onChange={handleChange} value="Hello Input" />);
		const clearButton = screen.getByLabelText('Hello Input Input field').children[1];

		await user.click(clearButton);

		const expectedValue = '';

		// waitFor is used here to give input some time to call onChange
		await waitFor(() => {
			const actual = handleChange.mock.calls[0][0].value;

			expect(actual).toBe(expectedValue);
		});
	});

	test('should not call onChange when clearButton is disabled', async () => {
		const handleChange = jest.fn();
		const user = userEvent.setup();
		const value = 'Hello Input';
		render(<Input clearButton disabled onChange={handleChange} value={value} />);
		const clearButton = screen.getByLabelText('Hello Input Input field').children[1];

		await user.click(clearButton);

		const expectedValue = 0;

		// waitFor is used here to give input some time to call onChange
		await waitFor(() => {
			const actual = handleChange.mock.calls.length;

			expect(actual).toBe(expectedValue);
		});
	});
});
