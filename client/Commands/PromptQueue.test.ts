import { PromptQueue } from "./PromptQueue";
import { PromptProps } from "../Prompts/PendingPrompts";

function MockPrompt(): PromptProps<{}> {
  return {
    autoFocusSelector: "",
    children: null,
    initialValues: {},
    onSubmit: jest.fn(() => true)
  };
}

function MockPromptWithClass(): PromptProps<{}> {
  return {
    autoFocusSelector: "",
    children: null,
    initialValues: {},
    onSubmit: jest.fn(() => true),
    className: "custom-class"
  };
}

describe("PromptQueue", () => {
  it("Can list prompts", () => {
    const promptQueue = new PromptQueue();
    const prompt = MockPrompt();
    promptQueue.Add(prompt);
    expect(promptQueue.GetPrompts()[0][0]).toBe(prompt);
  });

  it("Does not call onSubmit when dismissing a prompt", () => {
    const promptQueue = new PromptQueue();
    const prompt = MockPrompt();
    const promptId = promptQueue.Add(prompt);
    promptQueue.Remove(promptId);
    expect(prompt.onSubmit).not.toHaveBeenCalled();
  });

  it("Recognizes custom class names", () => {
    const promptQueue = new PromptQueue();
    const prompt = MockPromptWithClass();
    promptQueue.Add(prompt);
    expect(promptQueue.GetPrompts()[0][0].className).toBe('custom-class');
  });
});
