export const SIGNAL_TYPE_VALUES = [
  "platform_launch",
  "api_tool",
  "open_model",
  "policy",
] as const;

export type SignalType = (typeof SIGNAL_TYPE_VALUES)[number];
