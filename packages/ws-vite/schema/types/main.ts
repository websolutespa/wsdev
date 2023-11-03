import { Layout, Page } from './core.js';

export type MainSchemaJson = {
  /**
   * The optional [$schema](https://json-schema.org/understanding-json-schema/basics#declaring-a-json-schema) property enables json schema.
   *
   * **Syntax**: `<string>`
   */
  $schema?: string; // only for schema;
  /**
   * The `layout` property contains the current market and locale resolved layout data.
   *
   * **Syntax**: `<Layout>`
   */
  layout: Layout;
  /**
   * The `page` property contains the current route page data.
   *
   * **Syntax**: `<Page>`
   */
  page: Page;
};
