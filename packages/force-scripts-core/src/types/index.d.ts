type Port = string;

interface Config {
  name: string;
  src: string;
  dest: string;
  entryRules: Rule;
  fileList: fileList;
  publicPath: string;

  port: Port;
  portConfig: PortConfig;
}

type fileList = string[];

type PortConfig = any;

type ForceConfig = {
  publicPath: string;
  isProd: boolean;
  configs: Config[];
};

type Rule = any;

interface Entry {
  [name: string]: string[];
}
