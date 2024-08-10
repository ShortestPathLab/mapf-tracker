import { SolutionPath } from "models";

const cursor = SolutionPath.collection.find();

while (cursor.hasNext()) {
  // load only one document from the resultset into memory
  const thisdoc = cursor.next();
}
