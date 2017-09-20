// read forceConfig => gen configs => gen fileList => distribute port
// port config => watch/build

// middleware

import forceConfig from './load-config';
import handleRule from './handle-rule';
import distribute from './distribute';

function handleConfig(forceConfig: ForceConfig): object {
  const { configs, ...baseConfig } = forceConfig;

  return configs.map(config =>
    Object.assign(
      {},
      baseConfig,
      {
        fileList: handleRule(config.entryRules),
      },
      config
    )
  );
}

const configs = distribute(handleConfig(forceConfig));

function watch(configs) {
  configs.forEach(config => config.watch());
}

function build(configs) {
  configs.forEach(config => config.build());
}
