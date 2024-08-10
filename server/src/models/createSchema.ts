import {
  ApplySchemaOptions,
  DefaultSchemaOptions,
  FlatRecord,
  HydratedDocument,
  Model,
  ObtainDocumentType,
  ResolveSchemaOptions,
  Schema,
  SchemaDefinition,
  SchemaDefinitionType,
  SchemaOptions,
} from "mongoose";

export function createSchema<
  EnforcedDocType = any,
  TModelType = Model<EnforcedDocType, any, any, any>,
  TInstanceMethods = {},
  TQueryHelpers = {},
  TVirtuals = {},
  TStaticMethods = {},
  TSchemaOptions = DefaultSchemaOptions,
  DocType extends ApplySchemaOptions<
    ObtainDocumentType<
      DocType,
      EnforcedDocType,
      ResolveSchemaOptions<TSchemaOptions>
    >,
    ResolveSchemaOptions<TSchemaOptions>
  > = ApplySchemaOptions<
    ObtainDocumentType<
      any,
      EnforcedDocType,
      ResolveSchemaOptions<TSchemaOptions>
    >,
    ResolveSchemaOptions<TSchemaOptions>
  >,
  THydratedDocumentType = HydratedDocument<
    FlatRecord<DocType>,
    TVirtuals & TInstanceMethods
  >
>(
  definition?:
    | SchemaDefinition<SchemaDefinitionType<EnforcedDocType>, EnforcedDocType>
    | DocType,
  options?:
    | SchemaOptions<
        FlatRecord<DocType>,
        TInstanceMethods,
        TQueryHelpers,
        TStaticMethods,
        TVirtuals,
        THydratedDocumentType
      >
    | ResolveSchemaOptions<TSchemaOptions>
) {
  return new Schema<
    EnforcedDocType,
    TModelType,
    TInstanceMethods,
    TQueryHelpers,
    TVirtuals,
    TStaticMethods,
    TSchemaOptions,
    DocType,
    THydratedDocumentType
  >(definition, {
    ...options,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
      },
    },
  });
}
