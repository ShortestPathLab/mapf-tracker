declare module "*.md" {
  let MDXComponent: (props: JSX.IntrinsicElements["div"]) => JSX.Element;
  export default MDXComponent;
}
declare module "*.mdx" {
  let MDXComponent: (props: JSX.IntrinsicElements["div"]) => JSX.Element;
  export default MDXComponent;
}
