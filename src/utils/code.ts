import Manager from "../manager";

export const generateCode = async (userPrompt: string, manager: Manager) => {
  const providerManager = manager.chatProviders.get(Providers.zulip);
  if (!providerManager) {
    return '';
  }
  if (!providerManager.isAuthenticated()) {
    return '';
  }

  const completionResult = await providerManager.aiCompleteCode(userPrompt);
  // Remove code fences for any language
  const cleanedResult = completionResult.replace(/^```[^\n]*/, '').replace(/```$/, '');

  return cleanedResult;
};
