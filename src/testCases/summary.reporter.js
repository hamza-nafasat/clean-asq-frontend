const TEST_STATES = Object.freeze({ PASSED: "passed", FAILED: "failed" });
const ASSERTION_ERROR_NAME = "AssertionError";

// failed a check, not crashed
const isAssertionFailure = (error) => error?.name === ASSERTION_ERROR_NAME;

// passed, failed and error totals after each run
export default class SummaryReporter {
  onTestRunEnd(testModules, unhandledErrors) {
    const totals = { passed: 0, failed: 0, errors: unhandledErrors.length };
    for (const testModule of testModules) {
      // file crashed before its tests ran
      totals.errors += testModule.errors().length;
      for (const testCase of testModule.children.allTests()) {
        const { state, errors = [] } = testCase.result();
        if (state === TEST_STATES.PASSED) totals.passed += 1;
        if (state === TEST_STATES.FAILED) totals[errors.every(isAssertionFailure) ? "failed" : "errors"] += 1;
      }
    }
    console.log(`\n  Report   ${totals.passed} passed | ${totals.failed} failed | ${totals.errors} errors\n`);
  }
}
