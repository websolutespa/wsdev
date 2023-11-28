import * as CSS from 'csstype';
export interface CSSProperties extends CSS.Properties<string | number> {
  /**
   * The index signature was removed to enable closed typing for style
   * using CSSType. You're able to use type assertion or module augmentation
   * to add properties or an index signature of your own.
   *
   * For examples and more information, visit:
   * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
   */
}

type CSSToPickProperties =
  | 'alignContent' // Aligns items in a flex container along flex lines.
  | 'alignItems' // Aligns evenly spaced items in a flex container.
  | 'alignSelf' // Aligns an item inside a flex container.
  // | 'all' // Resets all element properties to its default or inherited values.
  // | 'animation' // Creates an animating element.
  // | 'animationDelay' // Sets a delay before an animation begins.
  // | 'animationDirection' // Sets how, in which direction, an animation is played.
  // | 'animationDuration' // Defines the duration of an animation cycle.
  // | 'animationFillMode' // Defines how styles are applied before and after animation.
  // | 'animationIterationCount' // Sets the number of times an animation is played.
  // | 'animationName' // Defines a name for the animation.
  // | 'animationPlayState' // Sets the animation play state to running or paused.
  // | 'animationTimingFunction' // Specifies the animation speed curve.
  // | 'backfaceVisibility' // Shows or hides the backface visibility of an element.
  | 'background' // Sets the background of an element.
  | 'backgroundAttachment' // Defines how the background is attached to an element.
  | 'backgroundBlendMode' // Defines the background layer blending mode.
  | 'backgroundClip' // Defines how background extends beyond the element.
  | 'backgroundColor' // Sets the background color of the element.
  | 'backgroundImage' // Specifies a background image for an element.
  | 'backgroundOrigin' // Specifies the background image origin position.
  | 'backgroundPosition' // Sets the position of a background image.
  | 'backgroundRepeat' // Specifies how the background image is repeated.
  | 'backgroundSize' // Sets the size of the background image.
  | 'border' // Specifies a border for an element
  | 'borderBottom' // Specifies a bottom border for an element.
  // | 'borderBottomColor' // Sets the color of a bottom border .
  // | 'borderBottomLeftRadius' // Sets the border radius of the bottom left corner.
  // | 'borderBottomRightRadius' // Sets the border radius of the bottom right corner
  // | 'borderBottomStyle' // Sets the style of the bottom border.
  // | 'borderBottomWidth' // Sets the width of the bottom border
  // | 'borderCollapse' // Sets table borders to single collapsed line or separated.
  | 'borderColor' // Sets the color of the border.
  | 'borderImage' // Defines an image as border, instead of a color.
  // | 'borderImageOutset' // Sets how far a border image extends beyond the border.
  // | 'borderImageRepeat' // Defines if and how the border image is repeated.
  // | 'borderImageSlice' // Defines how the border image will be sliced.
  // | 'borderImageSource' // Specifies the url of the border image file.
  // | 'borderImageWidth' // Sets the width of the image border.
  | 'borderLeft' // Sets the left border of the element.
  // | 'borderLeftColor' // Sets the color of the left border.
  // | 'borderLeftStyle' // Sets the style of the left border.
  // | 'borderLeftWidth' // Sets the width of the left border.
  | 'borderRadius' // Sets the radius of the border.
  | 'borderRight' // Sets the right border of the element.
  // | 'borderRightColor' // Sets the color of the right border.
  // | 'borderRightStyle' // Sets the style of the right border.
  // | 'borderRightWidth' // Sets the width of the right border.
  | 'borderSpacing' // Sets the adjacent table cell distance.
  | 'borderStyle' // Defines the style of the border
  | 'borderTop' // Sets the top border of the element.
  // | 'borderTopColor' // Sets the color of the top border.
  // | 'borderTopLeftRadius' // Sets the border radius of the top left corner.
  // | 'borderTopRightRadius' // Sets the border radius of the top right corner.
  // | 'borderTopStyle' // Sets the style of the top border.
  // | 'borderTopWidth' // Sets the width of the top border.
  | 'borderWidth' // Sets the border width of the element.
  // | 'bottom' // Positions the element from the bottom of the relative container.
  | 'boxShadow' // Adds a shadow effect to an element.
  // | 'boxSizing' // Sets how element height and width are calculated.
  // | 'captionSide' // Defines on which side of the table a caption is placed.
  | 'caretColor' // Sets the color of the blinking mouse caret.
  // | '@charset' // Specifies the character encoding of the stylesheet.
  // | 'clear' // Sets the element side that does not allow floating elements.
  // | 'clip' // Sets how an image is cropped or clipped inside a container.
  // | 'clipPath' // Clips an element inside a specific shape or SVG.
  | 'color' // Specifies the color of text in an element.
  | 'columnCount' // Divides an element into the specified number of columns.
  | 'columnFill' // Specifies how divided columns are filled.
  | 'columnGap' // Specifies the space between divided columns.
  | 'columnRule' // Sets the style, width, and color of a column divider.
  | 'columnRuleColor' // Sets the color of a column divider.
  | 'columnRuleStyle' // Sets the style of a column divider.
  | 'columnRuleWidth' // Sets the width of a column divider.
  | 'columnSpan' // Sets number of divided columns an element should span.
  | 'columnWidth' // Specifies the width of a divided column.
  | 'columns' // Divide an element into columns of a certain width.
  | 'content' // Used to insert content before or after an element.
  | 'counterIncrement' // Increase or decrease a CSS counter.
  | 'counterReset' // Initialize or reset CSS counter.
  // | 'cursor' // Specifies the shape of the mouse cursor.
  // | 'direction' // Specifies the text writing direction of a blockLevel element.
  // | 'display' // Specify an element's display behavior.
  // | 'emptyCells' // Specifies whether empty table cell borders will be displayed.
  | 'filter' // Adds an image enhancing effect to an image.
  | 'flex' // Specifies the width of the flexible items.
  // | 'flexBasis' // Specifies the initial width of a flex item.
  // | 'flexDirection' // Specifies the direction for the flex item to align.
  // | 'flexFlow' // Controls the direction and wrapping of flexible items.
  // | 'flexGrow' // Specifies how a flex item can grow inside the container.
  // | 'flexShrink' // Specifies how a flex item can shrink inside the container.
  // | 'flexWrap' // Specifies how flexible items wrap inside the container.
  // | 'float' // Sets how an element is positioned relative to other elements.
  // | 'font' // Sets font family, variant, weight, height, and size for an element.
  // | '@fontFace' // Embeds a custom font inside a web page
  | 'fontFamily' // Sets the font family for an element.
  | 'fontKerning' // Sets the spacing between the font's characters.
  | 'fontSize' // Sets the size of the font for an element.
  | 'fontSizeAdjust' // Specifies a fallBack font size.
  | 'fontStretch' // Sets the text characters to a wider or narrower variant.
  | 'fontStyle' // Set the font style to normal, italic, or oblique.
  | 'fontVariant' // Specifies that text is displayed in a smallCaps font.
  | 'fontWeight' // Sets the weight or thickness of the font.
  | 'gap'
  | 'grid' // Defines a grid layout with responsive rows and columns.
  | 'gridArea' // Sets the size and location of grid items in a grid container.
  | 'gridAutoColumns' // Specifies the size of the columns in a grid container.
  | 'gridAutoFlow' // Specifies the initial placement of items in a grid container.
  | 'gridAutoRows' // Specifies the initial size of the items in a grid container.
  | 'gridColumn' // Specifies the size and location of a grid item in a grid container.
  | 'gridColumnEnd' // Specifies in which columnLine the grid item will end.
  | 'gridColumnGap' // Specifies the gap size between columns in a grid container.
  | 'gridColumnStart' // Specifies in which column line the grid item will start.
  | 'gridGap' // Specifies the gap size between grid rows and columns.
  | 'gridRow' // Specifies the grid item size and location in a grid container.
  | 'gridRowEnd' // Specifies in which rowLine the grid item will end.
  | 'gridRowGap' // Specifies the gap size between rows in a grid container.
  | 'gridRowStart' // Specifies in which row line the grid item will start
  | 'gridTemplate' // Divides a page into sections with a size, position, and layer.
  | 'gridTemplateAreas' // Specifies area in a grid container.
  | 'gridTemplateColumns' // Sets the number and width of columns in a grid container.
  | 'gridTemplateRows' // Sets the number and height of rows in a grid container.
  | 'height' // Sets the height of an element.
  // | 'hyphens' // Specifies hyphenation with wrap opportunities in a line of text.
  // | '@import' // Imports a style sheet inside another style sheet.
  | 'justifyContent' // Defines the alignment of items in a flex container.
  // | '@keyframes' // Defines the CSS style to animate.
  // | 'left' // Positions the element from the left of the relative container.
  | 'letterSpacing' // Sets the spacing between characters.
  | 'lineHeight' // Sets the vertical spacing between lines of text.
  // | 'listStyle' // Defines the markers (bullet points) for items in a list.
  // | 'listStyleImage' // Defines an image markers (bullet points) for items in a list.
  // | 'listStylePosition' // Sets the marker (bullet point) positions for items in a list
  // | 'listStyleType' // Defines the marker types (bullet points) for items in a list
  | 'margin' // Sets the margin (outside spacing) for an element.
  | 'marginBottom' // Sets the bottom margin (outside spacing) for an element.
  | 'marginLeft' // Sets the left margin (outside spacing) for an element.
  | 'marginRight' // Sets the right margin (outside spacing) for an element.
  | 'marginTop' // Sets the top margin (outside spacing) for an element.
  | 'maxHeight' // Sets the maximumn height for an element.
  | 'maxWidth' // Sets the maximum width for an element.
  // | '@media' // Applies media queries to a page.
  | 'minHeight' // Sets the minimum height for an element.
  | 'minWidth' // Sets the minimum width for an element.
  | 'objectFit' // Specifies how an image or video fits inside a container.
  | 'objectPosition' // Specifies the image or video position inside a container.
  | 'opacity' // Sets the opacity (transparency) of the element.
  | 'order' // Specifies the order of an item in a flex container.
  | 'outline' // Adds an outline (highlighted border) to an element.
  | 'outlineColor' // Sets the color of an outline.
  | 'outlineOffset' // Sets the space between the outline and border.
  | 'outlineStyle' // Sets the style of an outline.
  | 'outlineWidth' // Sets the width of an outline.
  // | 'overflow' // Specifies the flow of content that exceeds the container.
  // | 'overflowX' // Specifies the flow of content that exceeds the container width.
  // | 'overflowY' // Specifies the flow of content that exceeds the container height.
  | 'padding' // Sets the spacing between content and element border.
  // | 'paddingBottom' // Sets the spacing between content and bottom element border.
  // | 'paddingLeft' // Sets the spacing between content and left element border.
  // | 'paddingRight' // Sets the spacing between content and right element border.
  // | 'paddingTop' // Sets the spacing between content and top element border.
  // | 'pageBreakAfter' // Adds a print pageBreak after an element.
  // | 'pageBreakBefore' // Adds a print pageBreak before an element.
  // | 'pageBreakInside' // Specifies if print pageBreak is allowed inside an element.
  // | 'perspective' // Adds perspective to a 3DPositioned element.
  // | 'perspectiveOrigin' // Sets the origin of the perspective for a 3DPositioned element.
  // | 'pointerEvents' // Specifies whether element reacts to pointer events or not.
  // | 'position' // Sets the element's positioning method.
  // | 'quotes' // Defines the quotation marks to be used on text.
  // | 'resize'
  // | 'right' // Positions the element from the right of the relative container.
  // | 'rotate'
  | 'rowGap'
  // | 'rubyAlign'
  // | 'rubyMerge'
  // | 'rubyPosition'
  // | 'scrollBehavior' // Specifies the scrolling behavior of an element
  // | 'tableLayout' // Aligns elements according to a table with rows and columns.
  | 'textAlign' // Sets the alignment of text inside an element.
  // | 'textAlignLast' // Sets the alignment for the last line of text.
  | 'textDecoration' // Defines the style and color of underlined text.
  // | 'textDecorationColor' // Defines the color of underlined text.
  // | 'textDecorationLine' // Defines the kind of line to use with text.
  // | 'textDecorationStyle' // Defines the style of underlined text.
  | 'textIndent' // Sets the indentation to the beginning of text.
  | 'textJustify' // Defines the text justification inside a container.
  | 'textOverflow' // Sets the display behavior of text that overflows a container.
  | 'textShadow' // Adds a shadow effect to text.
  | 'textTransform' // Defines text capitalization or casing.
  // | 'top' // Positions the element from the top of the relative container
  // | 'transform' // Applies a 2D or 3D transformation to an element.
  // | 'transformOrigin' // Sets the origin for the transformation of the element.
  // | 'transformStyle' // Specifies the display behavior of 3D space nested elements.
  | 'transition' // Creates transitions from one property value to another.
  // | 'transitionDelay' // Creates a delay before the transition effect starts.
  // | 'transitionDuration' // Specifies the time the transition will take.
  // | 'transitionProperty' // Specifies the CSS property that will transition.
  // | 'transitionTimingFunction' // Defines the speed curve function of the transition.
  // | 'userSelect' // Specifies how text can be selected (highlighted)
  | 'verticalAlign' // Specifies vertical alignment of an element.
  // | 'visibility' // Specifies the visibility of an element.
  // | 'whiteSpace' // Specifies how whiteSpace is handled inside an element.
  | 'width' // Sets the width of an element.
  | 'wordBreak' // Specifies how line breaks take place.
  | 'wordSpacing' // Sets the spacing between words.
  | 'wordWrap' // Specifies how long words can be wrapped.
  // | 'writingMode' // Sets the text reading orientation: top to bottom, etc.
  | 'zIndex'; // Sets the vertical stacking order relative to other elements.

export type CSSGlobalValues =
  | '-moz-initial'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type CSSFontSizeValues =
  | 'large'
  | 'medium'
  | 'small'
  | 'x-large'
  | 'x-small'
  | 'xx-large'
  | 'xx-small'
  | 'xxx-large';

type CSSIncrementalFontSizeValues = 'larger' | 'smaller';
type CSSToExcludeValues = CSSGlobalValues | 'always' | 'auto' | 'never' | 'none';

type CSSPickedProps = Pick<CSSProperties, CSSToPickProperties>;

export type CSSExcludedValues<T = CSSPickedProps> = {
  [Key in keyof T]: Exclude<T[Key], CSSToExcludeValues>;
};

export type CSSRequiredProps = Required<CSSExcludedValues>;

export type CSSExtendedValues<T = CSSExcludedValues> = {
  [Key in keyof T]: Extract<T[Key], number> extends number
  ? T[Key] | ListOfTwo
  : T[Key];
};

// breakpoints

/**
 * The breakpoint variants in the media query of the responsive css.
 */
export type BreakpointVariants = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * The css variant of the values resolved in the media query by each breakpoint.
 *
 * **Syntax**: {`
 *  xs: <value>,
 *  sm: <value>,
 *  md: <value>,
 *  lg: <value>,
 *  xl: <value>,
 * }`
 */
export type CSSResponsive<T> = {
  /**
   * The css variant of the values resolved in the media query by each breakpoint.
   *
   * **Syntax**: {`
   *  xs: <value>,
   *  sm: <value>,
   *  md: <value>,
   *  lg: <value>,
   *  xl: <value>,
   * }`
   */
  [key in BreakpointVariants]: T;
};

export type CSSProps<T = CSSExtendedValues> = {
  [Key in keyof T]: T[Key] | CSSResponsive<T[Key]>;
};

/*
color
line-height
letter-spacing
text-align
text-decoration
text-indent
text-transform

font
font-family
font-size
font-style
font-variant
font-weight
*/

// variants

export type IVariant<T> = T | (string & {});

export type IThemeVariant<T> = {
  /**
   * The default property of the variants group.
   *
   * **Syntax**: `<CSSProps>`
   */
  default: T;
  /**
   * variant of the variants group.
   *
   * **Syntax**: `<CSSProps>`
   */
  [key: string]: T;
};

/**
 * pixel unit.
 *
 * **Syntax**: `<number> | <pixel>`
 */
export type Unit = number | `${number}px`;

/**
 * pixel unit or
 * array of min / max value for fluid transition between sm / lg breakpoints.
 *
 * **Syntax**: `[<number> | <pixel>, <number> | <pixel>]`
 */
export type ListOfTwo = [Unit, Unit];

/**
 * array of min / max value for fluid transition between sm / lg breakpoints.
 *
 * **Syntax**: `<number> | <pixel> | [<number> | <pixel>, <number> | <pixel>]`
 */
export type Units = Unit | ListOfTwo;

/**
 * array of unit values used in scss helpers for tailwind style spacing classes generation.
 *
 * **Syntax**: `(<number> | <pixel> | [<number> | <pixel>, <number> | <pixel>])[]`
 */
export type ListOfMany = Units[];

/**
 * the theme record accept one of this props.
 *
 * **Syntax**: `<CSSProps> | <ListOfMany> | <IThemeGroup> | <IThemeVariant<IThemeGroup>>`
 */
export interface IThemeGroup {
  /**
   * property of the group.
   *
   * **Syntax**: `<CSSProps> | <ListOfMany> | <IThemeGroup> | <IThemeVariant<IThemeGroup>>`
   */
  [key: string]:
  | CSSProps
  | ListOfMany
  | IThemeGroup
  | IThemeVariant<IThemeGroup>;
}

/**
 * IThemeItem
 */
export type IThemeItem = CSSProps | IThemeGroup;

// typography

export type CSSTypographyProperties =
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'letterSpacing'
  | 'lineHeight';

/**
 * typography object containing info aboud the variant.
 *
 * **Syntax**: `{
 *  fontFamily: <css>,
 *  fontSize: <css>,
 *  fontWeight: <css>,
 *  letterSpacing: <css>,
 *  lineHeight: <css>
 * }`
 */
export type Typography = Pick<CSSProps, CSSTypographyProperties>;

type D1 = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type D2 = '0';

type TypographyVariantsSizes = `${D1}${D2}`;

type TypographyVariantsKeys = 'display' | 'heading' | 'paragraph' | 'label';

export type TypographyVariants = 'default' | IVariant<`${TypographyVariantsKeys}${TypographyVariantsSizes}`>;

/**
 * variant of the typography group.
 *
 * **Syntax**: `{
 *  default: <Typography>,
 *  display10: <Typography>,
 *  ...
 * }`
 */
export type Typographies = Partial<{
  /**
   * variant of the typography group.
   *
   * **Syntax**: `{
   *  default: <Typography>,
   *  display10: <Typography>,
   *  ...
   * }`
   */
  [key in TypographyVariants]: Typography;
}>;

// breakpoints

export type Breakpoints = {
  /**
   * property width associated to the breakpoint of the media query.
   *
   * **Syntax**: `{
   *  xs: <number> | <pixel>,
   *  sm: <number> | <pixel>,
   *  md: <number> | <pixel>,
   *  lg: <number> | <pixel>,
   *  xl: <number> | <pixel>,
   * }`
   */
  // [key in BreakpointVariants]: CSSProps['width'];
  /**
   * Property **`width`** associated to the breakpoint of the media query.
   *
   * **Syntax**: `<number> | <pixel>`
   *
   * @see https://developer.mozilla.org/docs/Web/CSS/width
   */
  [key in BreakpointVariants]: Unit;
};

// colors

export type ColorVariants = IVariant<
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950'
>;

export type Color = {
  /**
   * variant of the color group.
   *
   * **Syntax**: `{
   *  50: <color>,
   *  100: <color>,
   *  ...
   * }`
   */
  [key in ColorVariants]: CSSProps['color'];
};

export type Colors = {
  /**
   * neutral variant of the color group.
   *
   * **Syntax**: `{
   *  50: <color>,
   *  100: <color>,
   *  ...
   * }`
   */
  neutral: Color;
  /**
   * primary variant of the color group.
   *
   * **Syntax**: `{
   *  50: <color>,
   *  100: <color>,
   *  ...
   * }`
   */
  primary: Color;
  /**
   * variant of the color group.
   *
   * **Syntax**: `{
   *  50: <color>,
   *  100: <color>,
   *  ...
   * }`
   */
  [key: string]: Color;
};

// containers

export type Container = Pick<CSSProps, 'maxWidth'>;

export type Containers = {
  /**
     * default variant of the container group.
     *
     * **Syntax**: `{
     *  maxWidth: <value>;
     * }`
     */
  default: Container;
  /**
     * fluid variant of the container group.
     *
     * **Syntax**: `{
     *  maxWidth: <value>;
     * }`
     */
  fluid: Container;
  /**
     * variant of the container group.
     *
     * **Syntax**: `{
     *  maxWidth: <value>;
     * }`
     */
  [key: string]: Container;
};

// grid

export type Grid = {
  /**
   * number of columns of the grid.
   *
   * **Syntax**: `<number>`
   *
   * **Initial value**: `12`
   */
  columns: CSSProps['columns'];
  /**
   * fraction size of the grid.
   *
   * **Syntax**: `<string>`
   *
   * **Initial value**: `1fr`
   */
  size: string; // CSSProps['gridTemplateColumns'];
} & Pick<CSSProps, 'columnGap' | 'rowGap'>;

export type Grids = {
  /**
     * default variant of the grid group.
     *
     * **Syntax**: `{
     *  columns: <number>,
     *  size: <string>,
     *  columnGap: <value>,
     *  rowGap: <value>,
     * }`
     */
  default: Grid;
  /**
     * variant of the grid group.
     *
     * **Syntax**: `{
     *  columns: <number>,
     *  size: <string>,
     *  columnGap: <value>,
     *  rowGap: <value>,
     * }`
     */
  [key: string]: Grid;
};

// forms

export type Field = {
  padding: CSSProps['padding'];
  fontSize: CSSProps['fontSize'];
  fontWeight: CSSProps['fontWeight'];
  lineHeight: CSSProps['lineHeight'];
} & CSSProps;

export type IThemeForm = {
  backgroundColor: CSSProps['backgroundColor'];
  backgroundColorDisabled: CSSProps['backgroundColor'];
  backgroundColorInfo: CSSProps['backgroundColor'];
  backgroundColorError: CSSProps['backgroundColor'];
  color: CSSProps['color'];
  colorDisabled: CSSProps['color'];
  colorHover: CSSProps['color'];
  colorInfo: CSSProps['color'];
  colorError: CSSProps['color'];
  border: CSSProps['border'];
  borderWidth: CSSProps['borderWidth'];
  borderColor: CSSProps['borderColor'];
  borderColorHover: CSSProps['borderColor'];
  borderColorDisabled: CSSProps['borderColor'];
  borderColorInfo: CSSProps['borderColor'];
  borderColorError: CSSProps['borderColor'];
  borderRadius: CSSProps['borderRadius'];
  outline: CSSProps['outline'];
  outlineColorFocus: CSSProps['outlineColor'];
  outlineColorActive: CSSProps['outlineColor'];
  outlineColorError: CSSProps['outlineColor'];
  outlineOffset: CSSProps['outlineOffset'];
  transition: CSSProps['transition'];
  field: {
    gap: CSSProps['gap'];
  };
  control: Field;
  label: Field;
  error: Field;
} & CSSProps;

export type FormVariants = IVariant<'default'>;

export type IThemeForms =
  | Record<FormVariants, IThemeForm>
  | Record<string & {}, Partial<IThemeForm>>;

export type ITheme = {
  /**
   * The breakpoint used in the media query of the responsive css.
   *
   * **Syntax**: {`
   *  xs: <number> | <pixel>,
   *  sm: <number> | <pixel>,
   *  md: <number> | <pixel>,
   *  lg: <number> | <pixel>,
   *  xl: <number> | <pixel>,
   * }`
   *
   * @see https://github.com/websolutespa/wsdev/blob/main/samples/docs/THEMING.md
   */
  breakpoint: Breakpoints;
  /**
   * The `color` property define the color vars used by the theme.
   *
   * **Syntax**: `{
   *  neutral: {
   *    50: <color>,
   *    100: <color>,
   *    ...
   *  },
   *  primary: {
   *    50: <color>,
   *    100: <color>,
   *    ...
   *  },
   *  ...
   * }`
   *
   * @see https://github.com/websolutespa/wsdev/blob/main/samples/docs/THEMING.md
   */
  color: Colors;
  /**
   * The `container` property define the variants of the max-width properties used by .container classes of the theme.
   *
   * **Syntax**: `{
   *  default: <Container>,
   *  ...
   * }`
   *
   * @see https://github.com/websolutespa/wsdev/blob/main/samples/docs/THEMING.md
   */
  container: Containers;
  /**
   * The `grid` property define the variants of the grid properties used by .grid classes of the theme.
   *
   * **Syntax**: `{
   *  default: <Grid>,
   *  ...
   * }`
   *
   * @see https://github.com/websolutespa/wsdev/blob/main/samples/docs/THEMING.md
   */
  grid: Grids;
  /**
   * The `typography` property define the variants of the typography elements of the theme.
   *
   * **Syntax**: `{
   *  default: <Typography>,
   *  display10: <Typography>,
   *  ...
   * }`
   *
   * @see https://github.com/websolutespa/wsdev/blob/main/samples/docs/THEMING.md
   */
  typography: Typographies;
} & IThemeItem;

export type ThemeSchemaJson = {
  /**
   * The optional [$schema](https://json-schema.org/understanding-json-schema/basics#declaring-a-json-schema) property enables json schema.
   *
   * **Syntax**: `<string>`
   */
  $schema?: string; // only for schema;
} & ITheme;

