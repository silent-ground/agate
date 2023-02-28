const {runTest} = require('@enact/ui-test-utils/utils');
const Page = require('../AgatePage');

runTest({
	testName: 'Agate Gallium',
	Page: Page,
	skin: 'gallium',
	concurrency: 9
});
