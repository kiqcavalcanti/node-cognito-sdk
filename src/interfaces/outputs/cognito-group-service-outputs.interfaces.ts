export interface GetGroupInfoOutput {
  description?: string | undefined;
  groupName: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetGroupInfoOutputPaginate {
  items: GetGroupInfoOutput[];
  meta: {
    nextPage: string;
  };
}
