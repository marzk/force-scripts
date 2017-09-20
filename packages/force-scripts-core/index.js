const forceConfig = require('./load-config');
const handleRule = require('./handle-rule');

function handleConfig(forceConfig) {
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

const configs = handleConfig(forceConfig);
