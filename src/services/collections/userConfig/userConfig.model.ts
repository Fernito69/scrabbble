export type UserConfigBase = {
  displayName?: string;
  email?: string;
};

export type UserConfig = UserConfigBase & {
  id: string;
};
