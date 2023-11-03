import { Page } from './core.js';

export type PageSchemaJson = {
  /**
   * The optional [$schema](https://json-schema.org/understanding-json-schema/basics#declaring-a-json-schema) property enables json schema.
   *
   * **Syntax**: `<string>`
   */
  $schema?: string; // only for schema;
  /**
   * The `page` property contains the current route resolved page data.
   *
   * method icon	Methods and Functions	@method, @function, @constructor
   * variable icon	Variables	@variable
   * field icon	Fields	@field
   * type parameter	Type parameters	@typeParameter
   * constant	Constants	@constant
   * class	Classes	@class
   * interface	Interfaces	@interface
   * structure	Structures	@struct
   * event	Events	@event
   * operator	Operators	@operator
   * module	Modules	@module
   * property	Properties and Attributes	@property
   * enumeration icon	Values and Enumerations	@value, @enum
   * reference	References	@reference
   * keyword	Keywords	@keyword
   * file	Files	@file
   * folder	Folders	@folder
   * color	Colors	@color
   * unit	Unit	@unit
   * a square with ellipses forming the bottom show snippet prefix	Snippet prefixes	@snippet
   * a square with letters abc word completion	Words	@text
   *
   *
   *
   *
   * **Syntax**: `<Page>`
   */
  page: Page;
};
