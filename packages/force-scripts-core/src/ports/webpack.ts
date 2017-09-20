export default class Webpack implements Port {
  config: object;
  constructor(config: Config) {
    this.config = config;
  }
}
