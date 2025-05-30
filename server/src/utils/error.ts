function inferErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as { message: string }).message;
  }
  if (typeof error === "object" && error !== null) {
    return JSON.stringify(error);
  }
  return "An unknown error occurred";
}
