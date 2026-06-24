export const getAuth = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      if ("token" in parsed) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    }
  } catch {
    return;
  }
};

/**
 * Auth headers for the Eden treaty client and the few raw `fetch` call sites
 * that Eden can't serve (streamed/raw-body endpoints). All typed API access
 * goes through the Eden `api` client in `hooks/useQuery`.
 */
