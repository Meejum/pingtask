export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  SetProfile: undefined;
};

export type MainTabParamList = {
  ChatTab: undefined;
  ContactTab: undefined;
  TaskTab: undefined;
  SettingsTab: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { conversationId: string; title: string };
  ChatInfo: { conversationId: string };
  NewChat: undefined;
  NewGroup: undefined;
};

export type ContactStackParamList = {
  ContactList: undefined;
  AddContact: { pin?: string };
  ContactProfile: { uid: string };
  QRScan: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  EditProfile: undefined;
  MyPin: undefined;
};
