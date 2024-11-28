declare module "*.md" {
  let MDXComponent: <T extends {} = {}>(
    props: JSX.IntrinsicElements["div"] & T
  ) => JSX.Element;
  export default MDXComponent;
}
declare module "*.mdx" {
  let MDXComponent: <T extends {} = {}>(
    props: JSX.IntrinsicElements["div"] & T
  ) => JSX.Element;
  export default MDXComponent;
}
