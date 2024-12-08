declare module "*.md" {
  let MDXComponent: <
    T extends { [K in string]: unknown } = { [K in string]: unknown }
  >(
    props: JSX.IntrinsicElements["div"] & T
  ) => JSX.Element;
  export default MDXComponent;
}
declare module "*.mdx" {
  let MDXComponent: <
    T extends { [K in string]: unknown } = { [K in string]: unknown }
  >(
    props: JSX.IntrinsicElements["div"] & T
  ) => JSX.Element;
  export default MDXComponent;
}
