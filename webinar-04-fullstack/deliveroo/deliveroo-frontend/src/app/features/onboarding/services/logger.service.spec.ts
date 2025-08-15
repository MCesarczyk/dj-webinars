import { LoggerService } from './logger.service';
import * as env from '../../../../environments/environment';

describe('LoggerService', () => {
  let logger: LoggerService;
  let originalEnv: any;

  beforeEach(() => {
    // Save original environment for restoration after tests
    originalEnv = { ...env.environment };

    // Clear any previous mocks/spies
    jest.restoreAllMocks();
  });

  afterEach(() => {
    // Restore environment to original state after each test
    env.environment.production = originalEnv.production;
    jest.restoreAllMocks();
  });

  it('should log debug/info in development', () => {
    env.environment.production = false;

    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger = new LoggerService();

    logger.debug('test debug');
    logger.info('test info');

    expect(debugSpy).toHaveBeenCalledWith('test debug');
    expect(infoSpy).toHaveBeenCalledWith('test info');
  });

  it('should not log debug/info in production', () => {
    env.environment.production = true;

    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger = new LoggerService();

    logger.debug('test debug');
    logger.info('test info');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('should always log warn/error', () => {
    env.environment.production = false;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger = new LoggerService();

    logger.warn('test warn');
    logger.error('test error');

    expect(warnSpy).toHaveBeenCalledWith('test warn');
    expect(errorSpy).toHaveBeenCalledWith('test error');
  });
});
