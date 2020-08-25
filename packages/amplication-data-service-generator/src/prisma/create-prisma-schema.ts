import * as PrismaSchemaDSL from "prisma-schema-dsl";
import { EnumDataType, EntityField } from "../models";
import {
  EntityWithFields,
  LookupProperties,
  OptionSetProperties,
  TwoOptionsProperties,
} from "../types";

export const CLIENT_GENERATOR = PrismaSchemaDSL.createGenerator(
  "client",
  "prisma-client-js"
);

export const DATA_SOURCE = {
  name: "postgres",
  provider: PrismaSchemaDSL.DataSourceProvider.PostgreSQL,
  url: new PrismaSchemaDSL.DataSourceURLEnv("POSTGRESQL_URL"),
};

/** @todo remove */
export const USER_MODEL = PrismaSchemaDSL.createModel("User", [
  PrismaSchemaDSL.createScalarField(
    "username",
    PrismaSchemaDSL.ScalarType.String,
    false,
    true,
    true
  ),
  PrismaSchemaDSL.createScalarField(
    "password",
    PrismaSchemaDSL.ScalarType.String,
    false,
    true
  ),
]);

export async function createPrismaSchema(
  entities: EntityWithFields[]
): Promise<string> {
  const models = entities.map(createPrismaModel);

  /** @todo remove from here */
  models.unshift(USER_MODEL);

  const enums = entities
    .flatMap((entity) => entity.fields)
    .map((field) => createPrismaEnum(field))
    .filter((enum_): enum_ is PrismaSchemaDSL.Enum => enum_ !== null);

  const schema = PrismaSchemaDSL.createSchema(models, enums, DATA_SOURCE, [
    CLIENT_GENERATOR,
  ]);

  return PrismaSchemaDSL.print(schema);
}

export function createPrismaEnum(
  field: EntityField
): PrismaSchemaDSL.Enum | null {
  const { dataType, properties } = field;
  switch (dataType) {
    case EnumDataType.MultiSelectOptionSet:
    case EnumDataType.OptionSet: {
      const { optionsSetId } = properties as OptionSetProperties;
      return PrismaSchemaDSL.createEnum(optionsSetId, []);
    }
    case EnumDataType.TwoOptions: {
      const {
        firstOption,
        secondOption,
        default: defaultOption,
      } = properties as TwoOptionsProperties;
      return PrismaSchemaDSL.createEnum(createTwoOptionsEnumName(field.name), [
        firstOption,
        secondOption,
        defaultOption,
      ]);
    }
    default: {
      return null;
    }
  }
}

export function createPrismaModel(
  entity: EntityWithFields
): PrismaSchemaDSL.Model {
  return PrismaSchemaDSL.createModel(
    entity.name,
    entity.fields.map(createPrismaField)
  );
}

export function createPrismaField(
  field: EntityField
): PrismaSchemaDSL.ScalarField | PrismaSchemaDSL.ObjectField {
  const { dataType, name, properties } = field;
  switch (dataType) {
    case EnumDataType.SingleLineText: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.MultiLineText: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.Email: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.State: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.AutoNumber: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Int,
        false,
        true
      );
    }
    case EnumDataType.WholeNumber: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Int,
        false,
        true
      );
    }
    case EnumDataType.DateTime: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.DateTime,
        false,
        true
      );
    }
    case EnumDataType.DecimalNumber: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Float,
        false,
        true
      );
    }
    case EnumDataType.File: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.Image: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.Boolean: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Boolean,
        false,
        true
      );
    }
    case EnumDataType.GeographicAddress: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.Lookup: {
      const {
        relatedEntityId,
        allowMultipleSelection,
      } = properties as LookupProperties;
      return PrismaSchemaDSL.createObjectField(
        name,
        relatedEntityId,
        allowMultipleSelection,
        true
      );
    }
    case EnumDataType.MultiSelectOptionSet: {
      const { optionsSetId } = properties as OptionSetProperties;
      return PrismaSchemaDSL.createObjectField(name, optionsSetId, true, true);
    }
    case EnumDataType.OptionSet: {
      const { optionsSetId } = properties as OptionSetProperties;
      return PrismaSchemaDSL.createObjectField(name, optionsSetId, false, true);
    }
    case EnumDataType.TwoOptions: {
      return PrismaSchemaDSL.createObjectField(
        name,
        createTwoOptionsEnumName(name),
        false,
        true
      );
    }
    case EnumDataType.Id: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true,
        false,
        true,
        false,
        new PrismaSchemaDSL.CallExpression(PrismaSchemaDSL.CUID)
      );
    }
    case EnumDataType.CreatedAt: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.DateTime,
        false,
        true,
        false,
        false,
        false,
        new PrismaSchemaDSL.CallExpression(PrismaSchemaDSL.NOW)
      );
    }
    case EnumDataType.UpdatedAt: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.DateTime,
        false,
        true,
        false,
        false,
        true
      );
    }
    default: {
      throw new Error(`Unfamiliar data type: ${dataType}`);
    }
  }
}

function createTwoOptionsEnumName(name: string): string {
  return `Enum${name}`;
}