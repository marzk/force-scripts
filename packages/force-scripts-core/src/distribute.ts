import * as ports from './ports';

export default function distribute(configs: Config[]): any[] {
  const portConfig: { [port: string]: Config[] } = {};
  configs.forEach(config => {
    if (!(config.port in ports)) {
      throw new Error('port不存在的' + config.port);
    }
    if (Array.isArray(portConfig[config.port])) {
      portConfig[config.port].push(config);
    } else {
      portConfig[config.port] = [config];
    }
  });

  return Object.keys(portConfig).map(
    config => new (<any>ports)[config](portConfig[config])
  );
}
