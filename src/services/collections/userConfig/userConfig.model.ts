export type UserConfigBase = {
  displayName?: string;
};

export type UserConfig = UserConfigBase & {
  id: string;
};
