import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/utils/env";
import {
  HTTP_METHODS,
  TEST_CASE_SUB_PATHS,
  TESTING_API_PATHS,
  TESTING_SCREEN,
  TESTING_TABS,
} from "@/modules/testing/utils/testing.constants";
import { getAreaNames, testCasePath, testingRequest } from "@/modules/testing/utils/testing.utils";

const SERVER_URL = getEnv("SERVER_URL");

const useTestingScreenContext = ({
  testCases = [],
  filterArea = null,
  setFilterArea,
  onOpenEditor,
  setActiveTab,
  loadTestCases,
  deleteTestCases,
  seedFromStatic,
}) => {
  useScreenContext({
    screenId: TESTING_SCREEN.ID,
    screenName: TESTING_SCREEN.NAME,
    assistantName: TESTING_SCREEN.ASSISTANT_NAME,
    aiEndpoint: `${SERVER_URL}${TESTING_SCREEN.AI_ENDPOINT_PATH}`,
    greeting: TESTING_SCREEN.GREETING,
    currentState: {
      testCases: testCases.map((tc) => ({
        _id: tc._id,
        testId: tc.testId,
        name: tc.name,
        area: tc.area,
        stepCount: tc.steps?.length ?? tc.stepCount ?? 0,
        smoke: tc.smoke,
        isActive: tc.isActive,
      })),
      areas: getAreaNames(testCases),
      filterArea,
    },
    actions: {
      createTestCase: async ({
        testId,
        name,
        area,
        description,
        requiresLogin,
        requiresFormUrl,
        smoke,
        steps,
        explanation,
      }) => {
        await testingRequest(TESTING_API_PATHS.TEST_CASES, {
          method: HTTP_METHODS.POST,
          body: {
            testId,
            name,
            area,
            description,
            requiresLogin,
            requiresFormUrl,
            smoke,
            steps,
          },
          fallbackMessage: "Create failed",
        });
        loadTestCases?.();
        return explanation;
      },
      updateTestCase: async ({ testCaseId, explanation, ...fields }) => {
        await testingRequest(testCasePath(testCaseId), {
          method: HTTP_METHODS.PATCH,
          body: fields,
          fallbackMessage: "Update failed",
        });
        loadTestCases?.();
        return explanation;
      },
      deleteTestCases: async ({ testCaseIds, explanation }) => {
        await deleteTestCases?.(testCaseIds);
        return explanation;
      },
      duplicateTestCase: async ({ testCaseId, newName, explanation }) => {
        await testingRequest(testCasePath(testCaseId, TEST_CASE_SUB_PATHS.DUPLICATE), {
          method: HTTP_METHODS.POST,
          body: { newName },
          fallbackMessage: "Duplicate failed",
        });
        loadTestCases?.();
        return explanation;
      },
      openEditor: ({ testCaseId, explanation }) => {
        onOpenEditor?.(testCaseId);
        setActiveTab?.(TESTING_TABS.TEST_CASES);
        return explanation;
      },
      setFilterArea: ({ area, explanation }) => {
        setFilterArea?.(area || null);
        setActiveTab?.(TESTING_TABS.TEST_CASES);
        return explanation;
      },
      seedFromStatic: async ({ explanation }) => {
        await seedFromStatic?.();
        return explanation;
      },
    },
    deps: [testCases.length, filterArea],
  });
};

export default useTestingScreenContext;
