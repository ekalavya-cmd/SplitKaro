import { useQuery } from "@tanstack/react-query";
import { getGroups, getGroup } from "../services/group.service";
import { queryKeys } from "./queryKeys";

export const useAllGroupsQuery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.groups.all(),
    queryFn: getGroups,
    ...options,
  });
};

export const useGroupQuery = (groupId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: () => getGroup(groupId),
    enabled: !!groupId,
    ...options,
  });
};
