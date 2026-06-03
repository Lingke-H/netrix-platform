import type { CreateMessageInput, Message, MessagePermissionStatus, MessageThread } from "./schemas";

export type MessageThreadData = {
  thread: MessageThread;
  messages: Message[];
};

export type MessageComposerState = {
  permissionStatus: MessagePermissionStatus;
  sending: boolean;
};

export type MessageComposerPayload = CreateMessageInput;
