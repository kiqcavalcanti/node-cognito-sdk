import { AwsCredentials, CognitoBaseService } from './cognito-base.service';
import axios from 'axios';
import { CognitoApiError } from '../errors';
import { GetGroupInfoOutput, GetGroupInfoOutputPaginate } from '../interfaces';
export class CognitoGroupService extends CognitoBaseService {
  constructor(
    userPoolId: string,
    region: string,
    credentials: AwsCredentials,
    protected comercAuthApiUrl: string,
  ) {
    super(userPoolId, region, credentials);
  }

  async adminGetGroupInfo(
    m2mToken: string,
    groupName: string,
  ): Promise<GetGroupInfoOutput> {
    try {
      const response = await axios.get(
        `${this.comercAuthApiUrl}/api/admin/groups/${groupName}`,
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      const group = response.data;

      return this.getGroupInfoOutput(group);
    } catch (error) {
      throw new CognitoApiError(
        'Unable to get group info',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminCreateGroup(
    m2mToken: string,
    groupName: string,
    groupDescription: string,
  ): Promise<GetGroupInfoOutput> {
    try {
      const response = await axios.post(
        `${this.comercAuthApiUrl}/api/admin/groups`,
        { group_name: groupName, description: groupDescription },
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      const group = response.data;

      return this.getGroupInfoOutput(group);
    } catch (error) {
      throw new CognitoApiError(
        'Unable to create group',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminUpdateGroup(
    m2mToken: string,
    groupName: string,
    groupDescription: string,
  ): Promise<GetGroupInfoOutput> {
    try {
      const url = `${this.comercAuthApiUrl}/api/admin/users/${groupName}`;
      await axios.patch(
        url,
        { description: groupDescription },
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      return this.adminGetGroupInfo(m2mToken, groupName);
    } catch (error) {
      throw new CognitoApiError(
        'Unable to update group',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminListGroup(
    m2mToken: string,
    perPage = 10,
    nextPage = '',
  ): Promise<GetGroupInfoOutputPaginate> {
    try {
      const response = await axios.get(
        `${this.comercAuthApiUrl}/api/admin/groups`,
        {
          params: { per_page: perPage, next_page: nextPage },
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      const paginate = response.data;

      const nextToken = paginate.meta?.next_token || '';

      const paginateItems = paginate.data.items.map((item) =>
        this.getGroupInfoOutputPaginate(item),
      );

      return {
        items: paginateItems,
        meta: {
          nextPage: nextToken,
        },
      };
    } catch (error) {
      throw new CognitoApiError(
        'Unable to list groups',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminDeleteGroup(
    m2mToken: string,
    groupName: string,
  ): Promise<boolean> {
    try {
      await axios.delete(
        `${this.comercAuthApiUrl}/api/admin/groups/${groupName}`,
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      return true;
    } catch (error) {
      throw new CognitoApiError(
        'Unable to delete group',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminListGroupsForUser(
    m2mToken: string,
    username: string,
  ): Promise<GetGroupInfoOutputPaginate> {
    try {
      const response = await axios.get(
        `${this.comercAuthApiUrl}/api/admin/groups/user/${username}`,
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      const paginate = response.data;

      const nextToken = paginate.meta?.next_token || '';

      const paginateItems = paginate.data.items.map((item) =>
        this.getGroupInfoOutputPaginate(item),
      );

      return {
        items: paginateItems,
        meta: {
          nextPage: nextToken,
        },
      };
    } catch (error) {
      throw new CognitoApiError(
        'Unable to list groups for user',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminDeleteGroupForUser(
    m2mToken: string,
    groupName: string,
    username: string,
  ): Promise<boolean> {
    try {
      await axios.delete(
        `${this.comercAuthApiUrl}/api/admin/groups/${groupName}/user/${username}`,
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      return true;
    } catch (error) {
      throw new CognitoApiError(
        'Unable to delete group for user',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminAddGroupForUser(
    m2mToken: string,
    groupName: string,
    username: string,
  ): Promise<boolean> {
    try {
      await axios.post(`${this.comercAuthApiUrl}/api/admin/groups/add-user`, {
        json: { group_name: groupName, username: username },
        headers: {
          Authorization: `Bearer ${m2mToken}`,
        },
      });

      return true;
    } catch (error) {
      throw new CognitoApiError(
        'Unable to delete group for user',
        error.message,
        error.response?.status,
      );
    }
  }

  protected getGroupInfoOutput(group: any): GetGroupInfoOutput {
    return {
      groupName: group.data.group_name,
      description: group.data.description,
      createdAt: group.data.created_at,
      updatedAt: group.data.updated_at,
    };
  }

  protected getGroupInfoOutputPaginate(group: any): GetGroupInfoOutput {
    return {
      groupName: group.group_name,
      description: group.description,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    };
  }
}
