import models from "./app/models/";

const cursor = models.solution_paths.collection.find();

while (cursor.hasNext()) {
  // load only one document from the resultset into memory
  var thisdoc = cursor.next();
}
