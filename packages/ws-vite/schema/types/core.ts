export type IMenuBase = {
  abstract?: string;
  extra?: string;
  customClass?: string;
  id?: IEquatable;
  items?: IMenuItem[];
  media?: IMedia;
  title: string;
};

export type IMenuCategory = IMenuBase & {
  type?: 'category';
  href: string;
  category?: IEquatable;
};

export type IMenuGroup = IMenuBase & {
  type: 'group';
};

export type IMenuLink = IMenuBase & {
  type?: 'link';
  href: string;
  target?: string;
};

export type IMenuRoute = IMenuBase & {
  type?: 'route';
  href: string;
  page?: IEquatable;
  schema?: string;
};

export type IMenuPage = IMenuBase & {
  type?: 'page';
  href: string;
  page?: IEquatable;
  schema?: string;
};

export type INav = IMenuPage;

export type IMenuItem = IMenuCategory | IMenuGroup | IMenuLink | IMenuPage | IMenuRoute;

/**
 * An object containing a menu tree.
 */
export type IMenu = {
  id: string;
  items: IMenuItem[];
};

/**
 * An id ot type number or string.
 */
export type IEquatable = number | string;

/**
 * An object containing information for a category.
 */
export type ICategory = {
  category?: IEquatable | ICategory;
  id: IEquatable;
  media?: IMedia;
  order?: number;
  slug: string;
  title: string;
};

/**
 * An object containing information for an anchor.
 */
export type IAnchor = {
  id: string;
  title?: string;
};

/**
 * The list of media types.
 */
export type IMediaType = 'image' | 'video' | string;

/**
 * An object containing information for a media.
 */
export type IMedia = {
  src: string;
  type: IMediaType;
  alt?: string;
  title?: string;
  abstract?: string;
  width?: number;
  height?: number;
  url?: string;
  media?: IMedia;
};

/**
 * An object containing information for a route link.
 */
export type IRouteLink = {
  category?: IEquatable;
  href: string;
  id?: IEquatable;
  items?: IRouteLink[];
  media?: IMedia;
  schema?: string;
  title: string;
};

/**
 * An object containing information for a route.
 */
export type IRoute = {
  category?: IEquatable | ICategory;
  id: string;
  isDefault?: boolean;
  locale?: string;
  market?: string;
  media?: IMedia;
  order?: number;
  page?: IEquatable;
  schema?: string;
  template?: string;
  title: string;
  updatedAt?: Date;
  useSplat?: boolean;
};

/**
 * An object containing information for the market.
 */
export type IMarket = {
  isActive?: boolean;
  // isHidden?: boolean;
  countries?: string[];
  defaultLanguage?: string;
  id: string;
  isDefault?: boolean;
  languages?: string[];
  schema?: 'market';
  title: string;
};

/**
 * An object containing meta information for the page.
 */
export type IMeta = {
  /**
   * The meta title of the document.
   */
  title?: string;
  /**
   * The meta description of the document.
   */
  description?: string;
  /**
   * The meta keywords of the document.
   */
  keywords?: string;
  /**
   * The meta robots of the document.
   */
  robots?: string;
};

/**
 * An object containing information for the label.
 */
export type ILabel = {
  /**
   * The id of the label.
   */
  id: string;
  schema?: 'label';
  /**
   * The text of the label.
   */
  text: string;
};

/**
 * An object containing information for the locale.
 */
export type ILocale = {
  isActive?: boolean;
  // isHidden?: boolean;
  id: string;
  isDefault?: boolean;
  schema?: 'locale';
  title: string;
};

/**
 * Represents a lazy-loaded component with a schema and optional anchor and navigation properties.
 */
export type ILazyComponent = {
  /**
   * The schema of the component.
   */
  schema: string;
  /**
   * The anchor of the component.
   */
  anchor?: IAnchor;
  /**
   * The navigation of the component.
   */
  nav?: INav;
  /**
   * Additional properties of the component.
   */
  [key: string]: unknown;
};

/**
 * Represents the layout of a website or application.
 */
export type Layout = {
  /**
   * An array of labels used in the application.
   */
  labels: ILabel[];
  /**
   * The locale of the application.
   */
  locale: string;
  /**
   * An array of available locales for the application.
   */
  locales: ILocale[];
  /**
   * The market of the application.
   */
  market: string;
  /**
   * An array of available markets for the application.
   */
  markets: IMarket[];
  /**
   * A record of menus in the application.
   */
  menu: Record<string, IMenu>;
  /**
   * A record of top-level hrefs in the application.
   */
  topLevelHrefs: Record<string, string>;
  /**
   * A record of top-level routes in the application.
   */
  topLevelRoutes: Record<string, IRouteLink>;
  /**
   * The root of the application's route tree.
   */
  tree?: IRouteLink;
};

/**
 * Represents an object that can be categorized.
 */
export type Categorized = {
  // isDefault?: boolean;
  // markets?: string[];
  // order?: number;
  // schema?: string;
  // slug?: string;
  // useSplat?: boolean;
  /**
   * A brief summary of the object.
   */
  abstract?: string;
  /**
   * The category of the object.
   */
  category?: IEquatable | ICategory;
  /**
   * The date the object was created.
   */
  createdAt?: Date;
  /**
   * The unique identifier of the object.
   */
  id: IEquatable;
  /**
   * The media associated with the object.
   */
  media?: IMedia;
  /**
   * The template used to render the object.
   */
  template?: string;
  /**
   * The title of the object.
   */
  title: string;
  /**
   * The date the object was last updated.
   */
  updatedAt?: Date;
};

/**
 * Represents a page in the application.
 */
export type Page = Categorized & {
  // content?: string;
  /**
   * The locale of the page.
   */
  locale?: string;
  /**
   * The market of the page.
   */
  market?: string;
  /**
   * An array of alternate routes for the page.
   */
  alternates?: IRoute[];
  /**
   * An array of breadcrumb links for the page.
   */
  breadcrumb?: IRouteLink[];
  /**
   * An array of lazy-loaded components for the page.
   */
  components?: ILazyComponent[];
  /**
   * The description of the page.
   */
  description?: string;
  /**
   * The href of the page.
   */
  href: string;
  /**
   * An object containing meta information for the page.
   */
  meta?: IMeta;
  /**
   * The parent route of the page.
   */
  parentRoute?: IRouteLink;
};
