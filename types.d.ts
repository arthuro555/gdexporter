import exporter from "./src/main";

declare module "gdexporter" {
  export default exporter;
  export { PluginDescriptor } from "./src/plugins";
}
